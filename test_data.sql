-- Insert test data for your gallery app

-- 1. Create test users (profiles)
INSERT INTO public.profiles (id, username, full_name, avatar_url, bio, is_admin) VALUES
('11111111-1111-1111-1111-111111111111', 'alice', 'Alice Johnson', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Photography enthusiast from San Francisco', false),
('22222222-2222-2222-2222-222222222222', 'bob', 'Bob Smith', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Landscape photographer', false),
('33333333-3333-3333-3333-333333333333', 'charlie', 'Charlie Brown', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Street photography lover', true),
('44444444-4444-4444-4444-444444444444', 'diana', 'Diana Prince', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Portrait and fashion photographer', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create categories
INSERT INTO public.categories (name, description) VALUES
('Nature', 'Beautiful landscapes and wildlife photography'),
('Portrait', 'Professional and artistic portrait photography'),
('Street', 'Urban life and street photography'),
('Architecture', 'Modern and classical architecture'),
('Travel', 'Travel and adventure photography')
ON CONFLICT (name) DO NOTHING;

-- 3. Create albums
INSERT INTO public.albums (title, description, user_id, category_id, is_featured) VALUES
('Golden Hour Collection', 'Beautiful sunset and sunrise photos', '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.categories WHERE name = 'Nature'), true),
('Urban Portraits', 'Street portraits from around the world', '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.categories WHERE name = 'Portrait'), false),
('City Architecture', 'Modern buildings and structures', '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.categories WHERE name = 'Architecture'), true),
('Travel Adventures', 'Photos from my travels', '44444444-4444-4444-4444-444444444444', (SELECT id FROM public.categories WHERE name = 'Travel'), false)
ON CONFLICT DO NOTHING;

-- 4. Create photos
INSERT INTO public.photos (title, caption, image_url, image_path, user_id, album_id, tags, likes_count, comments_count) VALUES
('Sunset at Golden Gate', 'Beautiful sunset captured during golden hour in San Francisco', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', '/photos/sunset-golden-gate.jpg', '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.albums WHERE title = 'Golden Hour Collection'), ARRAY['sunset', 'golden-gate', 'san-francisco'], 42, 8),
('Portrait in Natural Light', 'Natural lighting creates beautiful shadows and highlights', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', '/photos/portrait-natural-light.jpg', '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.albums WHERE title = 'Urban Portraits'), ARRAY['portrait', 'natural-light', 'photography'], 89, 15),
('Modern Architecture', 'Clean lines and geometric shapes in contemporary design', 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop', '/photos/modern-architecture.jpg', '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.albums WHERE title = 'City Architecture'), ARRAY['architecture', 'modern', 'geometric'], 34, 6),
('Mountain Landscape', 'Breathtaking mountain views at dawn', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', '/photos/mountain-landscape.jpg', '44444444-4444-4444-4444-444444444444', (SELECT id FROM public.albums WHERE title = 'Travel Adventures'), ARRAY['mountain', 'landscape', 'nature'], 67, 12),
('Street Photography', 'Urban life captured in black and white', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop', '/photos/street-photography.jpg', '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.albums WHERE title = 'Urban Portraits'), ARRAY['street', 'urban', 'black-white'], 23, 4),
('Abstract Art', 'Colorful abstract composition', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop', '/photos/abstract-art.jpg', '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.albums WHERE title = 'Golden Hour Collection'), ARRAY['abstract', 'art', 'colorful'], 45, 9)
ON CONFLICT DO NOTHING;

-- 5. Create comments
INSERT INTO public.comments (photo_id, user_id, content, likes) VALUES
((SELECT id FROM public.photos WHERE title = 'Sunset at Golden Gate'), '22222222-2222-2222-2222-222222222222', 'Amazing colors! Love the golden hour lighting.', 3),
((SELECT id FROM public.photos WHERE title = 'Sunset at Golden Gate'), '33333333-3333-3333-3333-333333333333', 'This is absolutely stunning! Where was this taken?', 1),
((SELECT id FROM public.photos WHERE title = 'Portrait in Natural Light'), '11111111-1111-1111-1111-111111111111', 'Beautiful portrait! The lighting is perfect.', 5),
((SELECT id FROM public.photos WHERE title = 'Modern Architecture'), '44444444-4444-4444-4444-444444444444', 'Love the clean lines and modern aesthetic.', 2),
((SELECT id FROM public.photos WHERE title = 'Mountain Landscape'), '11111111-1111-1111-1111-111111111111', 'Breathtaking view! What mountain range is this?', 4),
((SELECT id FROM public.photos WHERE title = 'Street Photography'), '22222222-2222-2222-2222-222222222222', 'Great composition and mood!', 1)
ON CONFLICT DO NOTHING;

-- 6. Create likes
INSERT INTO public.likes (photo_id, user_id) VALUES
((SELECT id FROM public.photos WHERE title = 'Sunset at Golden Gate'), '22222222-2222-2222-2222-222222222222'),
((SELECT id FROM public.photos WHERE title = 'Sunset at Golden Gate'), '33333333-3333-3333-3333-333333333333'),
((SELECT id FROM public.photos WHERE title = 'Sunset at Golden Gate'), '44444444-4444-4444-4444-444444444444'),
((SELECT id FROM public.photos WHERE title = 'Portrait in Natural Light'), '11111111-1111-1111-1111-111111111111'),
((SELECT id FROM public.photos WHERE title = 'Portrait in Natural Light'), '33333333-3333-3333-3333-333333333333'),
((SELECT id FROM public.photos WHERE title = 'Modern Architecture'), '11111111-1111-1111-1111-111111111111'),
((SELECT id FROM public.photos WHERE title = 'Modern Architecture'), '22222222-2222-2222-2222-222222222222'),
((SELECT id FROM public.photos WHERE title = 'Mountain Landscape'), '11111111-1111-1111-1111-111111111111'),
((SELECT id FROM public.photos WHERE title = 'Mountain Landscape'), '33333333-3333-3333-3333-333333333333'),
((SELECT id FROM public.photos WHERE title = 'Street Photography'), '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- 7. Create comment likes
INSERT INTO public.comment_likes (comment_id, user_id) VALUES
((SELECT id FROM public.comments WHERE content LIKE 'Amazing colors!%'), '11111111-1111-1111-1111-111111111111'),
((SELECT id FROM public.comments WHERE content LIKE 'Beautiful portrait!%'), '33333333-3333-3333-3333-333333333333'),
((SELECT id FROM public.comments WHERE content LIKE 'Love the clean lines%'), '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- 8. Update cover photos for categories and albums
UPDATE public.categories SET cover_photo_id = (SELECT id FROM public.photos WHERE title = 'Sunset at Golden Gate') WHERE name = 'Nature';
UPDATE public.categories SET cover_photo_id = (SELECT id FROM public.photos WHERE title = 'Portrait in Natural Light') WHERE name = 'Portrait';
UPDATE public.categories SET cover_photo_id = (SELECT id FROM public.photos WHERE title = 'Modern Architecture') WHERE name = 'Architecture';

UPDATE public.albums SET cover_photo_id = (SELECT id FROM public.photos WHERE title = 'Sunset at Golden Gate') WHERE title = 'Golden Hour Collection';
UPDATE public.albums SET cover_photo_id = (SELECT id FROM public.photos WHERE title = 'Portrait in Natural Light') WHERE title = 'Urban Portraits';
UPDATE public.albums SET cover_photo_id = (SELECT id FROM public.photos WHERE title = 'Modern Architecture') WHERE title = 'City Architecture';
UPDATE public.albums SET cover_photo_id = (SELECT id FROM public.photos WHERE title = 'Mountain Landscape') WHERE title = 'Travel Adventures'; 