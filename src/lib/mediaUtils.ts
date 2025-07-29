// Media utility functions for image and video optimization

export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  format: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
}

// Supported file formats
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'] as const;
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'avi', 'mkv'] as const;

export type ImageFormat = typeof SUPPORTED_IMAGE_FORMATS[number];
export type VideoFormat = typeof SUPPORTED_VIDEO_FORMATS[number];

// Detect media type from URL or file
export const detectMediaType = (url: string): 'image' | 'video' => {
  const extension = url.toLowerCase().split('.').pop()?.toLowerCase();
  
  if (!extension) return 'image'; // Default to image
  
  if (SUPPORTED_VIDEO_FORMATS.includes(extension as VideoFormat)) {
    return 'video';
  }
  
  if (SUPPORTED_IMAGE_FORMATS.includes(extension as ImageFormat)) {
    return 'image';
  }
  
  return 'image'; // Default fallback
};

// Get file format from URL
export const getFileFormat = (url: string): string => {
  return url.toLowerCase().split('.').pop()?.toLowerCase() || '';
};

// Check if browser supports WebP
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// Check if browser supports AVIF
export const supportsAVIF = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// Generate responsive image sizes
export const generateResponsiveSizes = (width: number): string => {
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.min(width, 1200)}px`;
};

// Generate optimized image URL (placeholder for image optimization service)
export const generateOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  quality: number = 80,
  format?: 'webp' | 'avif' | 'original'
): string => {
  // If it's already an external URL, return as is
  if (originalUrl.startsWith('http')) {
    return originalUrl;
  }

  // For local images, you could integrate with an image optimization service
  // For now, return the original URL
  return originalUrl;
};

// Generate video poster image URL
export const generateVideoPoster = (videoUrl: string): string => {
  // This would generate a poster frame from the video
  // For now, return empty string
  return '';
};

// Calculate aspect ratio
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// Get optimal image dimensions for different screen sizes
export const getOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 1200
): { width: number; height: number } => {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);
  
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const newWidth = maxWidth;
  const newHeight = Math.round(maxWidth / aspectRatio);
  
  return { width: newWidth, height: newHeight };
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format video duration
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Validate media file
export const validateMediaFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const supportedFormats = [...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_VIDEO_FORMATS];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum 50MB allowed.' };
  }
  
  const extension = file.name.toLowerCase().split('.').pop();
  if (!extension || !supportedFormats.includes(extension as any)) {
    return { 
      isValid: false, 
      error: `Unsupported file format. Supported formats: ${supportedFormats.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

// Generate blur data URL for placeholder
export const generateBlurDataUrl = (width: number = 40, height: number = 40): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = width;
  canvas.height = height;
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add noise for texture
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
    ctx.fillRect(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 3,
      Math.random() * 3
    );
  }
  
  return canvas.toDataURL();
};

// Preload media for better performance
export const preloadMedia = (url: string, type: 'image' | 'video'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to preload image'));
      img.src = url;
    } else {
      const video = document.createElement('video');
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Failed to preload video'));
      video.src = url;
    }
  });
}; 