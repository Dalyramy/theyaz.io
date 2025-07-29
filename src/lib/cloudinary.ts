import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinary;

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
} = {}) => {
  const { width, height, crop = 'fill', quality = 'auto' } = options;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: 'auto',
    flags: 'progressive'
  });
};

// Helper function to search for images
export const searchImages = async (folder: string, maxResults: number = 50) => {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by('public_id', 'desc')
      .max_results(maxResults)
      .execute();
    
    return result.resources;
  } catch (error) {
    console.error('Error searching Cloudinary images:', error);
    return [];
  }
};

// Helper function to get image details
export const getImageDetails = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image details:', error);
    return null;
  }
}; 