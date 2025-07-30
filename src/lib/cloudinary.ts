import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using Next.js environment variables
const {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_API_KEY,
  NEXT_PUBLIC_CLOUDINARY_API_SECRET,
} = process.env;

if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !NEXT_PUBLIC_CLOUDINARY_API_KEY || !NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
  throw new Error(
    'Missing Cloudinary environment variables. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY and NEXT_PUBLIC_CLOUDINARY_API_SECRET in your environment.'
  );
}

cloudinary.config({
  cloud_name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
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