-- ============ PAYMENT METHOD OPTIONS ============
-- cod        : Rs 350 advance now, rest paid cash on delivery (existing default flow)
-- full       : entire order total paid upfront via NayaPay, nothing on delivery
-- ceo        : fun/premium option — delivery handled personally by the CEO, Rs 20,000 advance

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cod'
    CHECK (payment_method IN ('cod', 'full', 'ceo'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS advance_amount numeric NOT NULL DEFAULT 350;

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_notes text,
  p_items jsonb,
  p_advance_reference text,
  p_payment_proof_url text DEFAULT NULL,
  p_payment_method text DEFAULT 'cod'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ids text[];
  v_id text;
  v_updated int;
  v_items jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_delivery numeric := 350;
  v_advance numeric := 350;
  v_method text := coalesce(nullif(p_payment_method, ''), 'cod');
  v_order_id uuid;
  v_size text;
  r public.products;
BEGIN
  IF v_method NOT IN ('cod', 'full', 'ceo') THEN
    v_method := 'cod';
  END IF;

  -- CEO delivery carries its own novelty delivery charge; cod & full use the standard fee.
  IF v_method = 'ceo' THEN
    v_delivery := 20000;
  ELSE
    v_delivery := 350;
  END IF;

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

    -- Full-prepaid orders collect the whole total as the advance; cod/ceo only collect the delivery charge upfront.
    if v_method = 'full' then
      v_advance := v_subtotal + v_delivery;
    else
      v_advance := v_delivery;
    end if;

    insert into public.orders (
      customer_name, phone, address, city, notes, items,
      subtotal, delivery_fee, total, advance_reference, payment_proof_url,
      payment_method, advance_amount
    ) values (
      p_customer_name, p_phone, p_address, p_city, nullif(p_notes, ''), v_items,
      v_subtotal, v_delivery, v_subtotal + v_delivery, nullif(p_advance_reference, ''), nullif(p_payment_proof_url, ''),
      v_method, v_advance
    ) returning id into v_order_id;

  exception when sqlstate 'P0001' then
    return jsonb_build_object('ok', false, 'error', 'sold_out');
  end;

  return jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery,
    'advance_amount', v_advance,
    'payment_method', v_method,
    'total', v_subtotal + v_delivery
  );
END;
$$;

-- Drop the old signature (without p_payment_method) and grant only on the new one.
DROP FUNCTION IF EXISTS public.place_order(text,text,text,text,text,jsonb,text,text);

REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,text,jsonb,text,text,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,jsonb,text,text,text) TO service_role;
