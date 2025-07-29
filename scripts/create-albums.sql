-- Create default albums for the specialized gallery
-- This script sets up albums with different themes and descriptions

-- Insert default albums
INSERT INTO albums (id, title, description, cover_image, created_at) VALUES
  (
    gen_random_uuid(),
    'Nature & Landscape',
    'Breathtaking landscapes, wildlife, and natural wonders captured in their purest form. From majestic mountains to serene forests, discover the beauty of our natural world.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Portrait & People',
    'Intimate portraits and candid moments that capture the human spirit. From street photography to studio portraits, explore the diverse faces of humanity.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Street Photography',
    'Urban life captured through the lens. Street scenes, city architecture, and the rhythm of daily life in metropolitan environments.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Architecture & Design',
    'Stunning architectural marvels, modern buildings, and timeless structures. Explore the intersection of art, design, and human ingenuity.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Abstract & Artistic',
    'Creative expressions and abstract compositions. Experimental photography that pushes the boundaries of visual storytelling.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Minimal & Clean',
    'Less is more. Clean lines, simple compositions, and minimalist aesthetics that find beauty in simplicity and negative space.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Black & White',
    'Timeless monochrome photography that emphasizes contrast, texture, and emotion. Classic black and white images with powerful visual impact.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Color & Vibrant',
    'Bold, colorful compositions that celebrate the full spectrum of life. Vibrant hues and dynamic color palettes that tell stories through color.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Macro & Details',
    'The world in miniature. Close-up photography that reveals the intricate details and textures often overlooked in everyday life.',
    NULL,
    NOW()
  ),
  (
    gen_random_uuid(),
    'Travel & Adventure',
    'Journeys around the world captured through photography. Cultural experiences, new places, and the spirit of adventure and exploration.',
    NULL,
    NOW()
  );

-- Update the albums table to ensure we have the necessary columns
-- This is a safety check in case the table structure needs updating
DO $$
BEGIN
  -- Add description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'albums' AND column_name = 'description') THEN
    ALTER TABLE albums ADD COLUMN description TEXT;
  END IF;
  
  -- Add cover_image column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'albums' AND column_name = 'cover_image') THEN
    ALTER TABLE albums ADD COLUMN cover_image TEXT;
  END IF;
END $$; 