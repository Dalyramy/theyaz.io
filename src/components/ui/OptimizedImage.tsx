import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty' | 'none';
}

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '100vw',
  quality = 80,
  placeholder = 'blur',
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');

  // Generate optimized image URL with WebP support
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (!originalSrc) return '';
    
    // If it's already a data URL or external URL, return as is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For local images, we could add optimization here
    // For now, return the original src
    return originalSrc;
  }, []);

  // Generate blur placeholder
  const generateBlurPlaceholder = useCallback(() => {
    if (placeholder === 'none') return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = width || 40;
    const h = height || 40;
    
    canvas.width = w;
    canvas.height = h;

    // Create a subtle gradient background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add some noise for texture
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
      ctx.fillRect(
        Math.random() * w,
        Math.random() * h,
        Math.random() * 3,
        Math.random() * 3
      );
    }

    setBlurDataUrl(canvas.toDataURL());
  }, [width, height, placeholder]);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    generateBlurPlaceholder();

    const optimizedSrc = getOptimizedSrc(src);
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(optimizedSrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    img.src = optimizedSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, getOptimizedSrc, generateBlurPlaceholder]);

  // Error state
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-sm">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-muted"
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </motion.div>
      )}

      {/* Blur placeholder */}
      {blurDataUrl && placeholder !== 'none' && (
        <motion.img
          src={blurDataUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-lg transform scale-110"
          style={{ opacity: isLoading ? 1 : 0 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main image */}
      <motion.img
        src={imageSrc}
        alt={alt}
        className="relative w-full h-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </motion.div>
  );
};

export default OptimizedImage; 