ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;
CREATE INDEX IF NOT EXISTS photos_order_idx ON public.photos("order"); 