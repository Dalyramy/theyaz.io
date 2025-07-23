-- Sample data for testing the Gallery component
-- This file contains sample photos with both regular images and Instagram posts

-- Insert sample photos with regular images
INSERT INTO public.photos (id, title, image_url, likes_count, created_at) VALUES
(
  gen_random_uuid(),
  'Sunset at the Beach',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  42,
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'Mountain Landscape',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  18,
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'City Skyline',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
  35,
  NOW() - INTERVAL '3 hours'
);

-- Verify the data was inserted
SELECT 
  id,
  title,
  image_url,
  likes_count,
  created_at
FROM public.photos 
ORDER BY created_at DESC 
LIMIT 10; 