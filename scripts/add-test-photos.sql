-- Add test photos for enhanced gallery testing
-- This script adds sample photos with various properties

-- Test Photo 1: Regular photo
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Sunset at Golden Gate Bridge',
  'Beautiful sunset captured during golden hour in San Francisco',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  '/photos/sunset-golden-gate.jpg',
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '2 days',
  ARRAY['landscape', 'sunset', 'san-francisco'],
  42,
  8
);

-- Test Photo 2: Instagram post
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count, instagram_post_id) 
VALUES (
  gen_random_uuid(),
  'Street Photography in Tokyo',
  'Candid moment captured in the bustling streets of Shibuya',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
  '/photos/tokyo-street.jpg',
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '1 day',
  ARRAY['street', 'tokyo', 'urban'],
  67,
  12,
  'CyHksZcMYY2'
);

-- Test Photo 3: Portrait
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Portrait in Natural Light',
  'Natural lighting creates beautiful shadows and highlights',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  '/photos/portrait-natural-light.jpg',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '3 hours',
  ARRAY['portrait', 'natural-light', 'photography'],
  89,
  15
);

-- Test Photo 4: Architecture
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Modern Architecture',
  'Clean lines and geometric shapes in contemporary design',
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
  '/photos/modern-architecture.jpg',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '6 hours',
  ARRAY['architecture', 'modern', 'geometric'],
  34,
  6
);

-- Test Photo 5: Nature
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Mountain Landscape',
  'Breathtaking view of snow-capped peaks at dawn',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  '/photos/mountain-landscape.jpg',
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '12 hours',
  ARRAY['nature', 'mountains', 'landscape'],
  156,
  23
);

-- Test Photo 6: Urban
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'City Lights at Night',
  'Urban photography capturing the energy of the city',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
  '/photos/city-lights-night.jpg',
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '1 hour',
  ARRAY['urban', 'night', 'city-lights'],
  78,
  11
);

-- Test Photo 7: Abstract
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Abstract Patterns',
  'Exploring texture and form in abstract photography',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  '/photos/abstract-patterns.jpg',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '30 minutes',
  ARRAY['abstract', 'texture', 'patterns'],
  45,
  7
);

-- Test Photo 8: Food
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Artisanal Coffee',
  'Perfectly crafted latte art in a cozy café',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
  '/photos/artisanal-coffee.jpg',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '15 minutes',
  ARRAY['food', 'coffee', 'latte-art'],
  92,
  18
);

-- Test Photo 9: Travel
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Travel Memories',
  'Exploring new cultures and capturing unforgettable moments',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
  '/photos/travel-memories.jpg',
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '45 minutes',
  ARRAY['travel', 'culture', 'adventure'],
  203,
  31
);

-- Test Photo 10: Minimalist
INSERT INTO public.photos (id, title, caption, image_url, image_path, user_id, created_at, tags, likes_count, comments_count) 
VALUES (
  gen_random_uuid(),
  'Minimalist Design',
  'Less is more - finding beauty in simplicity',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  '/photos/minimalist-design.jpg',
  '22222222-2222-2222-2222-222222222222',
  NOW(),
  ARRAY['minimalist', 'simple', 'design'],
  67,
  9
);

-- Verify the photos were added
SELECT 
  id,
  title,
  likes_count,
  comments_count,
  instagram_post_id,
  created_at
FROM public.photos 
ORDER BY created_at DESC
LIMIT 10; 