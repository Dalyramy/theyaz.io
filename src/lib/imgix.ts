// imgix utility for image optimization
// Replace 'your-subdomain' with your actual imgix subdomain

const IMGIX_DOMAIN = 'your-subdomain.imgix.net'; // Replace with your actual imgix domain

export interface ImgixParams {
  w?: number; // width
  h?: number; // height
  fit?: 'clip' | 'crop' | 'fill' | 'scale-down' | 'max' | 'min';
  crop?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'faces' | 'focalpoint';
  auto?: 'format' | 'compress' | 'enhance' | 'redeye' | 'pixelate' | 'metadata';
  q?: number; // quality (1-100)
  fm?: 'jpg' | 'png' | 'webp' | 'avif' | 'gif';
  blur?: number; // blur amount
  sat?: number; // saturation
  con?: number; // contrast
  bright?: number; // brightness
  hue?: number; // hue rotation
  dpr?: number; // device pixel ratio
}

/**
 * Convert a Supabase storage URL to an optimized imgix URL
 */
export function optimizeImage(
  supabaseUrl: string, 
  params: ImgixParams = {}
): string {
  // Extract the path from Supabase URL
  // Example: https://rkdpcovnrrtlkcxzolxl.supabase.co/storage/v1/object/public/photos/user-id/image.jpg
  const url = new URL(supabaseUrl);
  const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/photos\/(.+)/);
  
  if (!pathMatch) {
    console.warn('Could not parse Supabase URL for imgix optimization:', supabaseUrl);
    return supabaseUrl; // Return original URL if parsing fails
  }
  
  const imagePath = pathMatch[1];
  
  // Build imgix URL
  const imgixUrl = new URL(`https://${IMGIX_DOMAIN}/${imagePath}`);
  
  // Add default optimization parameters
  const defaultParams: ImgixParams = {
    auto: 'format,compress',
    q: 85,
    ...params
  };
  
  // Add parameters to URL
  Object.entries(defaultParams).forEach(([key, value]) => {
    if (value !== undefined) {
      imgixUrl.searchParams.set(key, value.toString());
    }
  });
  
  return imgixUrl.toString();
}

/**
 * Generate responsive image URLs for different sizes
 */
export function generateResponsiveImages(
  supabaseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
): { [key: string]: string } {
  const images: { [key: string]: string } = {};
  
  sizes.forEach(size => {
    images[`${size}w`] = optimizeImage(supabaseUrl, { w: size, h: size, fit: 'crop' });
  });
  
  return images;
}

/**
 * Generate a srcset string for responsive images
 */
export function generateSrcSet(
  supabaseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
): string {
  const images = generateResponsiveImages(supabaseUrl, sizes);
  return Object.entries(images)
    .map(([size, url]) => `${url} ${size}`)
    .join(', ');
}

/**
 * Optimize image for specific use cases
 */
export const imgixOptimizations = {
  // Thumbnail optimization
  thumbnail: (url: string) => optimizeImage(url, {
    w: 300,
    h: 300,
    fit: 'crop',
    crop: 'faces',
    auto: 'format,compress',
    q: 80
  }),
  
  // Gallery optimization
  gallery: (url: string) => optimizeImage(url, {
    w: 800,
    h: 600,
    fit: 'crop',
    auto: 'format,compress',
    q: 85
  }),
  
  // Hero image optimization
  hero: (url: string) => optimizeImage(url, {
    w: 1200,
    h: 800,
    fit: 'crop',
    auto: 'format,compress',
    q: 90
  }),
  
  // Avatar optimization
  avatar: (url: string) => optimizeImage(url, {
    w: 100,
    h: 100,
    fit: 'crop',
    crop: 'faces',
    auto: 'format,compress',
    q: 85
  }),
  
  // WebP format for modern browsers
  webp: (url: string) => optimizeImage(url, {
    fm: 'webp',
    auto: 'format,compress',
    q: 85
  }),
  
  // AVIF format for latest browsers
  avif: (url: string) => optimizeImage(url, {
    fm: 'avif',
    auto: 'format,compress',
    q: 85
  })
};

export default {
  optimizeImage,
  generateResponsiveImages,
  generateSrcSet,
  imgixOptimizations
};