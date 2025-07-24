import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://bkbqkpfzrqykrzzvzyrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYnFrcGZ6cnF5a3J6enZ6eXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzk5OTksImV4cCI6MjA2MTcxNTk5OX0.7wLFlI5VFlBGyroUtZTBu2MyM1bPbpW01yAik-oNb5s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test photos data
const testPhotos = [
  {
    title: 'Sunset at Golden Gate Bridge',
    caption: 'Beautiful sunset captured during golden hour in San Francisco',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    likes_count: 42,
    comments_count: 8
  },
  {
    title: 'Portrait in Natural Light',
    caption: 'Natural lighting creates beautiful shadows and highlights',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    likes_count: 89,
    comments_count: 15
  },
  {
    title: 'Modern Architecture',
    caption: 'Clean lines and geometric shapes in contemporary design',
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    likes_count: 34,
    comments_count: 6
  },
  {
    title: 'Mountain Landscape',
    caption: 'Breathtaking view of snow-capped peaks at dawn',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    likes_count: 156,
    comments_count: 23
  },
  {
    title: 'City Lights at Night',
    caption: 'Urban photography capturing the energy of the city',
    image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
    likes_count: 78,
    comments_count: 11
  }
];

async function addTestPhotos() {
  try {
    console.log('Adding test photos to database...');
    
    for (const photo of testPhotos) {
      const { data, error } = await supabase
        .from('photos')
        .insert([photo]);
      
      if (error) {
        console.error('Error adding photo:', error);
      } else {
        console.log(`✅ Added photo: ${photo.title}`);
      }
    }
    
    console.log('✅ Test photos added successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

addTestPhotos(); 