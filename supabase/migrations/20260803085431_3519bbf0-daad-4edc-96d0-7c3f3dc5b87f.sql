-- ============ ROLES ============
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read their own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

-- ============ PRODUCTS ============
create table public.products (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null,
  price numeric not null check (price >= 0),
  old_price numeric,
  condition text not null,
  sizes jsonb not null default '[]'::jsonb,
  image text not null,
  images jsonb,
  color text,
  status text not null default 'available' check (status in ('available','reserved','sold')),
  created_at timestamptz not null default now()
);

grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "Anyone can view available products"
on public.products for select to anon, authenticated
using (status = 'available');

create policy "Admins can view all products"
on public.products for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- ============ ORDERS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  notes text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 350,
  total numeric not null default 0,
  advance_paid boolean not null default false,
  advance_reference text,
  payment_proof_url text,
  payment_status text not null default 'pending' check (payment_status in ('pending','advance_verified','cancelled')),
  order_status text not null default 'processing' check (order_status in ('processing','fulfilled','cancelled')),
  created_at timestamptz not null default now()
);

grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create policy "Admins can view orders"
on public.orders for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- ============ ATOMIC ORDER PLACEMENT ============
create or replace function public.place_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_notes text,
  p_items jsonb,
  p_advance_reference text,
  p_payment_proof_url text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ids text[];
  v_id text;
  v_updated int;
  v_items jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_delivery numeric := 350;
  v_order_id uuid;
  v_size text;
  r public.products;
begin
  select array_agg(distinct elem->>'product_id')
    into v_ids
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) elem
  where coalesce(elem->>'product_id', '') <> '';

  if v_ids is null or array_length(v_ids, 1) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_cart');
  end if;

  begin
    foreach v_id in array v_ids loop
      update public.products set status = 'reserved'
      where id = v_id and status = 'available';
      get diagnostics v_updated = row_count;

      if v_updated = 0 then
        raise exception 'sold_out' using errcode = 'P0001';
      end if;

      select * into r from public.products where id = v_id;

      select elem->>'size' into v_size
      from jsonb_array_elements(p_items) elem
      where elem->>'product_id' = v_id
      limit 1;

      if v_size is null or not (r.sizes ? v_size) then
        select value into v_size from jsonb_array_elements_text(r.sizes) limit 1;
      end if;

      v_items := v_items || jsonb_build_array(jsonb_build_object(
        'product_id', r.id,
        'name', r.name,
        'size', coalesce(v_size, ''),
        'condition', r.condition,
        'price', r.price
      ));
      v_subtotal := v_subtotal + r.price;
    end loop;

    insert into public.orders (
      customer_name, phone, address, city, notes, items,
      subtotal, delivery_fee, total, advance_reference, payment_proof_url
    ) values (
      p_customer_name, p_phone, p_address, p_city, nullif(p_notes, ''), v_items,
      v_subtotal, v_delivery, v_subtotal + v_delivery, nullif(p_advance_reference, ''), nullif(p_payment_proof_url, '')
    ) returning id into v_order_id;

  exception when sqlstate 'P0001' then
    return jsonb_build_object('ok', false, 'error', 'sold_out');
  end;

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery,
    'total', v_subtotal + v_delivery
  );
end;
$$;

revoke all on function public.place_order(text,text,text,text,text,jsonb,text,text) from public, anon, authenticated;
grant execute on function public.place_order(text,text,text,text,text,jsonb,text,text) to service_role;

-- ============ ORDER STATE CHANGES (service role only) ============
create or replace function public.set_order_state(
  p_order_id uuid,
  p_payment_status text default null,
  p_order_status text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  item jsonb;
begin
  select * into o from public.orders where id = p_order_id;
  if o.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  update public.orders
  set payment_status = coalesce(p_payment_status, payment_status),
      order_status = coalesce(p_order_status, order_status),
      advance_paid = case when coalesce(p_payment_status, payment_status) = 'advance_verified' then true else advance_paid end
  where id = p_order_id;

  if p_order_status = 'cancelled' then
    update public.orders set payment_status = 'cancelled' where id = p_order_id;
    for item in select * from jsonb_array_elements(o.items) loop
      update public.products set status = 'available'
      where id = item->>'product_id' and status = 'reserved';
    end loop;
  end if;

  if p_order_status = 'fulfilled' then
    for item in select * from jsonb_array_elements(o.items) loop
      update public.products set status = 'sold' where id = item->>'product_id';
    end loop;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.set_order_state(uuid,text,text) from public, anon, authenticated;
grant execute on function public.set_order_state(uuid,text,text) to service_role;

-- ============ 24H EXPIRY SWEEP ============
create or replace function public.expire_unverified_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
  item jsonb;
  n integer := 0;
begin
  for o in
    select * from public.orders
    where payment_status = 'pending'
      and order_status = 'processing'
      and created_at < now() - interval '24 hours'
  loop
    update public.orders
      set payment_status = 'cancelled', order_status = 'cancelled'
      where id = o.id;
    for item in select * from jsonb_array_elements(o.items) loop
      update public.products set status = 'available'
      where id = item->>'product_id' and status = 'reserved';
    end loop;
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.expire_unverified_orders() from public, anon, authenticated;
grant execute on function public.expire_unverified_orders() to service_role;

create extension if not exists pg_cron;

select cron.schedule(
  'expire-unverified-orders',
  '7 * * * *',
  $$select public.expire_unverified_orders();$$
);

-- ============ SEED CATALOG ============
insert into public.products (id, name, brand, category, price, old_price, condition, sizes, image, images, color) values
('dunk-panda','Dunk Low Retro Panda','Nike','Men',2499,4000,'Premium+','["PAK 12","EUR 47"]','/__l5e/assets-v1/b09c4f06-e77f-4acc-9236-dc52a3e62322/shoes1.png',null,null),
('af1-midnight-navy','Air Force 1 LV8 3 GS ''College Pack - Midnight Navy''','Nike','Men',1999,4000,'Premium','["5.5 UK","38.5 EUR"]','shoes2',null,null),
('af1-sunflower','Nike Air Force 1 Low LV8 ''Have a nike day''','Nike','Women',1999,3000,'Premium','["6.5 US","39 EUR"]','shoes3',null,null),
('af1-floral-swoosh','GS Nike Air Force 1 Low ''Melted Crayon'' CU4632-100','Nike','Casual',1999,3000,'Excellence','["6 UK","8 US","39 EUR"]','shoes4',null,null),
('af1-grey-suede','Nike Air Force 1 LV8 ''Athletic Club'' Sneakers','Nike','Sports',1999,3000,'Premium+','["5 UK","7 US","38 EUR"]','shoes5',null,null),
('af1-just-do-more','Nike Air Force 1 ''JUST DO MORE'' Lightning Bolts','Nike','Kids',1999,3000,'Premium','["6 UK","8 US","39 EUR"]','shoes6',null,null),
('court-borough-low-2-sneakers','Nike Court Borough Low 2 Sneakers','Nike','Men',2499,null,'Premium','["UK 6","EUR 40"]','shoes7',null,null),
('court-vision-low-next-nature-black','Nike Court Vision Low Next Nature','Nike','Men',2999,null,'Premium','["UK 8.5","EUR 42.5"]','shoes8',null,'Black'),
('court-borough-low-2-low-top','Nike Court Borough Low 2 Low Top','Nike','Women',2499,null,'Premium+','["UK 5.5","EUR 38.5"]','shoes9',null,null),
('af1-react-astronomy-blue','Air Force 1 React ''Astronomy Blue''','Nike','Men',2999,null,'Premium','["UK 6","EUR 40"]','shoes10',null,null),
('af1-lumberjack-pack-black','Nike Air Force 1 Low Lumberjack Pack Black','Nike','Men',3499,null,'Premium+','["UK 8.5","EUR 43"]','shoes11',null,null),
('af1-low-white','Nike Air Force 1 Low','Nike','Men',3499,null,'Premium','["UK 7.5","EUR 42","US 8.5"]','shoes12',null,'White'),
('af1-07-se-recycled-white-black','Nike Air Force 1 Low ''07 SE Recycled White Black Light Bone','Nike','Men',3499,null,'Premium+','["UK 9","EUR 44","US 11.5"]','shoes13',null,'White / Light Bone'),
('af1-gs-black-gum-light-brown','Nike Air Force 1 Low GS ''Black Gum Light Brown''','Nike','Kids',3499,null,'Premium+','["UK 8.5","EUR 43","US 9.5"]','shoes14','["shoes14","shoes15"]','Black / Gum');