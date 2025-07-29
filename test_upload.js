import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUploadFunctionality() {
  try {
    console.log('🔍 Testing upload functionality...\n');

    // 1. Check if photos storage bucket exists
    console.log('1. Checking photos storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      const photosBucket = buckets.find(bucket => bucket.name === 'photos');
      if (photosBucket) {
        console.log('✅ Photos bucket exists');
      } else {
        console.log('❌ Photos bucket does not exist');
        console.log('Available buckets:', buckets.map(b => b.name));
      }
    }

    // 2. Check photos table structure
    console.log('\n2. Checking photos table...');
    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .limit(1);

    if (photosError) {
      console.error('❌ Error accessing photos table:', photosError);
    } else {
      console.log('✅ Photos table is accessible');
      if (photosData && photosData.length > 0) {
        console.log('Sample photo structure:', Object.keys(photosData[0]));
      }
    }

    // 3. Check albums table
    console.log('\n3. Checking albums table...');
    const { data: albumsData, error: albumsError } = await supabase
      .from('albums')
      .select('*')
      .limit(1);

    if (albumsError) {
      console.error('❌ Error accessing albums table:', albumsError);
    } else {
      console.log('✅ Albums table is accessible');
      if (albumsData && albumsData.length > 0) {
        console.log('Sample album structure:', Object.keys(albumsData[0]));
      }
    }

    // 4. Check if user is authenticated (simulate upload scenario)
    console.log('\n4. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else if (user) {
      console.log('✅ User is authenticated:', user.email);
      console.log('User ID:', user.id);
    } else {
      console.log('⚠️  No authenticated user (this is expected for testing)');
    }

    // 5. Test storage upload permissions
    console.log('\n5. Testing storage upload permissions...');
    if (user) {
      const testFileName = `test-${Date.now()}.txt`;
      const testContent = 'This is a test file for upload permissions';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`${user.id}/test-${testFileName}`, testBlob, {
          contentType: 'text/plain',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
      } else {
        console.log('✅ Storage upload successful');
        
        // Clean up test file
        const { error: deleteError } = await supabase.storage
          .from('photos')
          .remove([`${user.id}/test-${testFileName}`]);
        
        if (deleteError) {
          console.log('⚠️  Could not clean up test file:', deleteError);
        } else {
          console.log('✅ Test file cleaned up');
        }
      }
    } else {
      console.log('⚠️  Skipping storage test - no authenticated user');
    }

    console.log('\n📊 Upload functionality test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testUploadFunctionality(); 