import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAlbumPhotos() {
  try {
    console.log('Testing album-photo relationships...\n');
    
    // Get all albums
    const { data: albums, error: albumsError } = await supabase
      .from('albums')
      .select('id, title, description')
      .order('created_at', { ascending: false });
    
    if (albumsError) {
      console.error('Error fetching albums:', albumsError);
      return;
    }
    
    console.log('Albums found:', albums?.length);
    
    // For each album, get its photos
    for (const album of albums || []) {
      console.log(`\n--- Album: ${album.title} (${album.id}) ---`);
      
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('id, title, image_url, created_at')
        .eq('album_id', album.id)
        .order('created_at', { ascending: false });
      
      if (photosError) {
        console.error(`Error fetching photos for ${album.title}:`, photosError);
        continue;
      }
      
      console.log(`Photos in album: ${photos?.length || 0}`);
      
      if (photos && photos.length > 0) {
        console.log('First photo (should be cover):', {
          title: photos[0].title,
          image_url: photos[0].image_url,
          created_at: photos[0].created_at
        });
        
        // Test if the image URL is accessible
        if (photos[0].image_url) {
          try {
            const response = await fetch(photos[0].image_url, { method: 'HEAD' });
            console.log(`Image URL status: ${response.status} ${response.statusText}`);
          } catch (error) {
            console.log(`Image URL error: ${error.message}`);
          }
        }
      } else {
        console.log('No photos in this album');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAlbumPhotos(); 