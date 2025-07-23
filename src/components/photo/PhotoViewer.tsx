import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Share2 } from 'lucide-react';

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  title?: string;
}

const PhotoViewer = ({ isOpen, onClose, imageUrl, alt, title }: PhotoViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const brightness = useMotionValue(1);

  // Reset zoom and position when image changes or viewer closes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setShowControls(true);
  }, [imageUrl, isOpen]);

  const handleDoubleTap = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handlePinchZoom = (e: unknown) => {
    if (
      e &&
      typeof e === 'object' &&
      'scale' in e &&
      typeof (e as { scale?: unknown }).scale === 'number'
    ) {
      const newScale = scale * (e as { scale: number }).scale;
      setScale(Math.min(Math.max(1, newScale), 4));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Shared Photo',
          text: 'Check out this photo from theyaz.io',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleZoom = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          onTap={() => setShowControls(!showControls)}
        >
          {/* Top controls */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ 
              opacity: showControls ? 1 : 0,
              y: showControls ? 0 : -20 
            }}
            className="absolute top-safe-top left-4 right-4 z-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-full bg-black/20 p-2 text-white/80 hover:text-white backdrop-blur-md"
              >
                <X className="h-6 w-6" />
              </button>
              {title && (
                <h3 className="text-white/90 text-sm font-medium ml-2">{title}</h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleZoom}
                className="rounded-full bg-black/20 p-2 text-white/80 hover:text-white backdrop-blur-md"
              >
                {scale > 1 ? (
                  <ZoomOut className="h-6 w-6" />
                ) : (
                  <ZoomIn className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="rounded-full bg-black/20 p-2 text-white/80 hover:text-white backdrop-blur-md"
              >
                <Share2 className="h-6 w-6" />
              </button>
            </div>
          </motion.div>

          {/* Image container with constraints */}
          <div
            ref={constraintsRef}
            className="relative h-full w-full overflow-hidden touch-none"
          >
            <motion.div
              className="relative h-full w-full flex items-center justify-center"
              style={{ 
                touchAction: 'none',
                filter: `brightness(${brightness.get()})` 
              }}
              drag={scale > 1}
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onTap={(e) => {
                if (!isDragging && e.tapCount === 2) {
                  handleDoubleTap();
                }
              }}
              animate={{
                scale,
                x: position.x,
                y: position.y,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              whileHover={{ cursor: scale > 1 ? 'grab' : 'default' }}
              whileTap={{ cursor: scale > 1 ? 'grabbing' : 'default' }}
            >
              <motion.img
                src={imageUrl}
                alt={alt}
                className="max-h-full max-w-full object-contain"
                draggable="false"
                layoutId={`photo-${imageUrl}`}
              />
            </motion.div>
          </div>

          {/* Bottom controls */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ 
              opacity: showControls ? 1 : 0,
              y: showControls ? 0 : 20 
            }}
            className="absolute bottom-safe-bottom left-0 right-0 p-4 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm text-white/80 backdrop-blur-md">
              <span>Double-tap or pinch to zoom</span>
              <span className="text-white/40">•</span>
              <span>Drag to pan</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoViewer; 