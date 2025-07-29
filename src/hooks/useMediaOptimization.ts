import { useState, useEffect, useCallback } from 'react';

interface MediaInfo {
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  format?: string;
}

interface UseMediaOptimizationProps {
  src: string;
  type?: 'image' | 'video';
}

export const useMediaOptimization = ({ src, type }: UseMediaOptimizationProps) => {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');

  // Detect media type from URL
  const detectMediaType = useCallback((url: string): 'image' | 'video' => {
    if (type) return type;
    
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
    
    const extension = url.toLowerCase().split('.').pop();
    
    if (videoExtensions.includes(`.${extension}`)) return 'video';
    if (imageExtensions.includes(`.${extension}`)) return 'image';
    
    // Default to image if we can't determine
    return 'image';
  }, [type]);

  // Generate optimized source URL
  const generateOptimizedSrc = useCallback((originalSrc: string, mediaType: 'image' | 'video') => {
    if (!originalSrc) return '';

    // For external URLs, return as is
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For local images, we could add optimization here
    // For now, return the original src
    return originalSrc;
  }, []);

  // Get media information
  const getMediaInfo = useCallback(async (url: string, mediaType: 'image' | 'video') => {
    return new Promise<MediaInfo>((resolve, reject) => {
      if (mediaType === 'image') {
        const img = new Image();
        img.onload = () => {
          resolve({
            type: 'image',
            width: img.naturalWidth,
            height: img.naturalHeight,
            format: url.split('.').pop()?.toLowerCase(),
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      } else {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            type: 'video',
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
            format: url.split('.').pop()?.toLowerCase(),
          });
        };
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = url;
      }
    });
  }, []);

  // Generate responsive sizes
  const getResponsiveSizes = useCallback((width?: number) => {
    if (!width) return '100vw';
    
    return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.min(width, 800)}px`;
  }, []);

  // Generate WebP srcset if supported
  const generateWebPSrcSet = useCallback((originalSrc: string) => {
    // This would generate WebP versions if you have an image optimization service
    // For now, return the original src
    return originalSrc;
  }, []);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const mediaType = detectMediaType(src);
    const optimized = generateOptimizedSrc(src, mediaType);
    setOptimizedSrc(optimized);

    getMediaInfo(optimized, mediaType)
      .then((info) => {
        setMediaInfo(info);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading media:', error);
        setHasError(true);
        setIsLoading(false);
      });
  }, [src, detectMediaType, generateOptimizedSrc, getMediaInfo]);

  return {
    mediaInfo,
    isLoading,
    hasError,
    optimizedSrc,
    mediaType: detectMediaType(src),
    responsiveSizes: getResponsiveSizes(mediaInfo?.width),
    webPSrc: generateWebPSrcSet(src),
  };
}; 