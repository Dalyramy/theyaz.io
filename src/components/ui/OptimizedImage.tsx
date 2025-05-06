import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate low-quality placeholder
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width || 40;
    canvas.height = height || 40;
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setBlurDataUrl(canvas.toDataURL());
    }

    // Load optimized image
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
    };
  }, [src, width, height]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Blur placeholder */}
      <motion.img
        src={blurDataUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover filter blur-lg transform scale-110"
        style={{ opacity: isLoading ? 1 : 0 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
      />

      {/* Main image */}
      <motion.img
        src={imageSrc}
        alt={alt}
        className="relative w-full h-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        animate={{ opacity: isLoading ? 0 : 1 }}
        onLoad={() => setIsLoading(false)}
      />
    </motion.div>
  );
};

export default OptimizedImage; 