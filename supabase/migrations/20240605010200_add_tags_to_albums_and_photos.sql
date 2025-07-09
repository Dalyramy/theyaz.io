ALTER TABLE public.albums ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS albums_tags_idx ON public.albums USING GIN(tags);
CREATE INDEX IF NOT EXISTS photos_tags_idx ON public.photos USING GIN(tags); 