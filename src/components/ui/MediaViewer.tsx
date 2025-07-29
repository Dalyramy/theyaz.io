import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectMediaType } from '@/lib/mediaUtils';
import OptimizedImage from './OptimizedImage';
import OptimizedVideo from './OptimizedVideo';

interface MediaViewerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty' | 'none';
}

const MediaViewer = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  poster,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  preload = 'metadata',
  sizes = '100vw',
  quality = 80,
  placeholder = 'blur',
}: MediaViewerProps) => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const type = detectMediaType(src);
    setMediaType(type);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  if (mediaType === 'video') {
    return (
      <OptimizedVideo
        src={src}
        poster={poster}
        alt={alt}
        className={className}
        width={width}
        height={height}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        preload={preload}
      />
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
    />
  );
};

export default MediaViewer; 