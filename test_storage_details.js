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

async function testStorageDetails() {
  try {
    console.log('Testing storage details...\n');
    
    // List all buckets
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
    } else {
      console.log('All buckets:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));
    }
    
    // List contents of photos bucket
    console.log('\nListing photos bucket contents:');
    const { data: photosObjects, error: photosError } = await supabase
      .storage
      .from('photos')
      .list();
    
    if (photosError) {
      console.error('Error listing photos:', photosError);
    } else {
      console.log('Photos bucket contents:', photosObjects);
    }
    
    // Try to list contents of the specific folder
    console.log('\nListing folder contents:');
    const { data: folderContents, error: folderError } = await supabase
      .storage
      .from('photos')
      .list('042f9bdb-b636-498e-9da6-008e40710590');
    
    if (folderError) {
      console.error('Error listing folder:', folderError);
    } else {
      console.log('Folder contents:', folderContents);
    }
    
    // Test if we can get a public URL for the specific file
    console.log('\nTesting public URL access:');
    const { data: publicUrl, error: urlError } = supabase
      .storage
      .from('photos')
      .getPublicUrl('042f9bdb-b636-498e-9da6-008e40710590/745b1462-600e-40f6-9d30-54abb7d534e1.jpg');
    
    if (urlError) {
      console.error('Error getting public URL:', urlError);
    } else {
      console.log('Public URL:', publicUrl);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStorageDetails(); 