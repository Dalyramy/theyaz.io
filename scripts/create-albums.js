import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const albums = [
  {
    title: 'Nature & Landscape',
    description: 'Breathtaking landscapes, wildlife, and natural wonders captured in their purest form. From majestic mountains to serene forests, discover the beauty of our natural world.',
    cover_image: null
  },
  {
    title: 'Portrait & People',
    description: 'Intimate portraits and candid moments that capture the human spirit. From street photography to studio portraits, explore the diverse faces of humanity.',
    cover_image: null
  },
  {
    title: 'Street Photography',
    description: 'Urban life captured through the lens. Street scenes, city architecture, and the rhythm of daily life in metropolitan environments.',
    cover_image: null
  },
  {
    title: 'Architecture & Design',
    description: 'Stunning architectural marvels, modern buildings, and timeless structures. Explore the intersection of art, design, and human ingenuity.',
    cover_image: null
  },
  {
    title: 'Abstract & Artistic',
    description: 'Creative expressions and abstract compositions. Experimental photography that pushes the boundaries of visual storytelling.',
    cover_image: null
  },
  {
    title: 'Minimal & Clean',
    description: 'Less is more. Clean lines, simple compositions, and minimalist aesthetics that find beauty in simplicity and negative space.',
    cover_image: null
  },
  {
    title: 'Black & White',
    description: 'Timeless monochrome photography that emphasizes contrast, texture, and emotion. Classic black and white images with powerful visual impact.',
    cover_image: null
  },
  {
    title: 'Color & Vibrant',
    description: 'Bold, colorful compositions that celebrate the full spectrum of life. Vibrant hues and dynamic color palettes that tell stories through color.',
    cover_image: null
  },
  {
    title: 'Macro & Details',
    description: 'The world in miniature. Close-up photography that reveals the intricate details and textures often overlooked in everyday life.',
    cover_image: null
  },
  {
    title: 'Travel & Adventure',
    description: 'Journeys around the world captured through photography. Cultural experiences, new places, and the spirit of adventure and exploration.',
    cover_image: null
  }
];

async function createAlbums() {
  console.log('Creating albums...');
  
  try {
    // First, check if albums already exist
    const { data: existingAlbums, error: fetchError } = await supabase
      .from('albums')
      .select('title');
    
    if (fetchError) {
      console.error('Error fetching existing albums:', fetchError);
      return;
    }
    
    const existingTitles = existingAlbums?.map(album => album.title) || [];
    
    // Filter out albums that already exist
    const newAlbums = albums.filter(album => !existingTitles.includes(album.title));
    
    if (newAlbums.length === 0) {
      console.log('All albums already exist!');
      return;
    }
    
    // Insert new albums
    const { data, error } = await supabase
      .from('albums')
      .insert(newAlbums)
      .select();
    
    if (error) {
      console.error('Error creating albums:', error);
      return;
    }
    
    console.log(`Successfully created ${data.length} albums:`);
    data.forEach(album => {
      console.log(`- ${album.title}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAlbums(); 