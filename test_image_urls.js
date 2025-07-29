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

async function testImageUrls() {
  try {
    console.log('Testing image URLs...\n');
    
    // Get all photos with their image URLs
    const { data: photos, error } = await supabase
      .from('photos')
      .select('id, title, image_url, album_id')
      .limit(10);
    
    if (error) {
      console.error('Error fetching photos:', error);
      return;
    }
    
    console.log('Found photos:');
    photos?.forEach(photo => {
      console.log(`- ${photo.title}: ${photo.image_url}`);
    });
    
    // Test if we can access the storage bucket
    console.log('\nTesting storage bucket access...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
    } else {
      console.log('Available buckets:', buckets?.map(b => b.name));
    }
    
    // Test if we can list objects in photos bucket
    console.log('\nTesting photos bucket...');
    const { data: objects, error: objectsError } = await supabase
      .storage
      .from('photos')
      .list();
    
    if (objectsError) {
      console.error('Error listing photos:', objectsError);
    } else {
      console.log('Photos in bucket:', objects?.map(o => o.name));
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testImageUrls(); 