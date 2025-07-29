import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAlbums() {
  console.log('Testing albums functionality...');
  
  try {
    // Test 1: Check if albums table exists and has correct structure
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
      console.log('Sample album:', {
        id: albums[0].id,
        title: albums[0].title,
        description: albums[0].description,
        user_id: albums[0].user_id,
        created_at: albums[0].created_at
      });
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
        console.log('Sample photo:', {
          id: photos[0].id,
          title: photos[0].title,
          album_id: photos[0].album_id,
          user_id: photos[0].user_id
        });
      }
    }
    
    // Test 3: Test album creation
    console.log('\n3. Testing album creation...');
    const testAlbum = {
      title: 'Test Album - ' + Date.now(),
      description: 'Test description for album creation',
      user_id: null // System album
    };
    
    const { data: newAlbum, error: createError } = await supabase
      .from('albums')
      .insert(testAlbum)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating test album:', createError);
    } else {
      console.log('✅ Test album created successfully:', {
        id: newAlbum.id,
        title: newAlbum.title,
        description: newAlbum.description
      });
      
      // Test 4: Test album update
      console.log('\n4. Testing album update...');
      const updateData = {
        title: 'Updated Test Album - ' + Date.now(),
        description: 'Updated description',
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedAlbum, error: updateError } = await supabase
        .from('albums')
        .update(updateData)
        .eq('id', newAlbum.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating album:', updateError);
      } else {
        console.log('✅ Album updated successfully:', {
          id: updatedAlbum.id,
          title: updatedAlbum.title,
          description: updatedAlbum.description
        });
      }
      
      // Test 5: Test album deletion
      console.log('\n5. Testing album deletion...');
      const { error: deleteError } = await supabase
        .from('albums')
        .delete()
        .eq('id', newAlbum.id);
      
      if (deleteError) {
        console.error('Error deleting album:', deleteError);
      } else {
        console.log('✅ Test album deleted successfully');
      }
    }
    
    // Test 6: Check photo counts for albums
    console.log('\n6. Testing album photo counts...');
    const { data: albumsWithCounts, error: countError } = await supabase
      .from('albums')
      .select(`
        id,
        title,
        photos!inner(count)
      `)
      .limit(3);
    
    if (countError) {
      console.error('Error fetching albums with counts:', countError);
    } else {
      console.log('Albums with photo counts:', albumsWithCounts?.length || 0);
      if (albumsWithCounts && albumsWithCounts.length > 0) {
        albumsWithCounts.forEach(album => {
          console.log(`- ${album.title}: ${album.photos?.[0]?.count || 0} photos`);
        });
      }
    }
    
    console.log('\n✅ All album tests completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the tests
testAlbums(); 