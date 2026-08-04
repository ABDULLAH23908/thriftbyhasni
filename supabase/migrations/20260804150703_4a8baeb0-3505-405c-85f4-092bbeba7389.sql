ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_at timestamptz;

UPDATE public.products SET sold_at = now() WHERE status = 'sold' AND sold_at IS NULL;

CREATE OR REPLACE FUNCTION public.products_track_sold_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'sold' AND (OLD.status IS DISTINCT FROM 'sold' OR NEW.sold_at IS NULL) THEN
    NEW.sold_at = now();
  ELSIF NEW.status <> 'sold' THEN
    NEW.sold_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_track_sold_at ON public.products;
CREATE TRIGGER products_track_sold_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_track_sold_at();

DROP POLICY IF EXISTS "Anyone can view available products" ON public.products;
CREATE POLICY "Anyone can view available and recently sold products"
ON public.products FOR SELECT
TO anon, authenticated
USING (
  status = 'available'
  OR status = 'reserved'
  OR (status = 'sold' AND sold_at IS NOT NULL AND sold_at > now() - interval '24 hours')
);