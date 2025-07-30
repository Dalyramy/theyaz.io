import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAlbums() {
  console.log('Testing albums table...');
  
  try {
    // Test 1: Check if albums table exists
    console.log('\n1. Checking albums table structure...');
    const { data: albums, error: albumsError } = await supabase
      .from('albums')
      .select('*')
      .limit(5);
    
    if (albumsError) {
      console.error('Error fetching albums:', albumsError);
      return;
    }
    
    console.log('Albums found:', albums?.length || 0);
    if (albums && albums.length > 0) {
      console.log('Sample album:', albums[0]);
    }
    
    // Test 2: Check photos table
    console.log('\n2. Checking photos table...');
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .limit(5);
    
    if (photosError) {
      console.error('Error fetching photos:', photosError);
    } else {
      console.log('Photos found:', photos?.length || 0);
      if (photos && photos.length > 0) {
        console.log('Sample photo:', photos[0]);
      }
    }
    
    // Test 3: Check if we can create a simple album
    console.log('\n3. Testing album creation...');
    const testAlbum = {
      title: 'Test Album',
      description: 'Test description',
      cover_image: null
    };
    
    const { data: newAlbum, error: createError } = await supabase
      .from('albums')
      .insert(testAlbum)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating test album:', createError);
    } else {
      console.log('Successfully created test album:', newAlbum);
      
      // Clean up - delete the test album
      const { error: deleteError } = await supabase
        .from('albums')
        .delete()
        .eq('id', newAlbum.id);
      
      if (deleteError) {
        console.error('Error deleting test album:', deleteError);
      } else {
        console.log('Successfully deleted test album');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testAlbums(); 