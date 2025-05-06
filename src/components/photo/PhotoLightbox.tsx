import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoComments from '@/components/social/PhotoComments';
import ShareButton from '@/components/social/ShareButton';

interface PhotoLightboxProps {
  photos: Array<{
    id: string;
    title: string;
    image_url: string;
    caption: string;
  }>;
  initialPhotoId: string;
  onClose: () => void;
}

const PhotoLightbox = ({ photos, initialPhotoId, onClose }: PhotoLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const index = photos.findIndex(photo => photo.id === initialPhotoId);
    setCurrentIndex(index >= 0 ? index : 0);
  }, [initialPhotoId, photos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePhotos('prev');
          break;
        case 'ArrowRight':
          navigatePhotos('next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const navigatePhotos = (direction: 'prev' | 'next') => {
    if (isZoomed) return;
    
    setCurrentIndex(prev => {
      if (direction === 'prev') {
        return prev > 0 ? prev - 1 : photos.length - 1;
      } else {
        return prev < photos.length - 1 ? prev + 1 : 0;
      }
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const xDiff = touchStart.x - e.touches[0].clientX;
    const yDiff = touchStart.y - e.touches[0].clientY;

    // Only handle horizontal swipes
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 50) {
        navigatePhotos('next');
        setTouchStart(null);
      } else if (xDiff < -50) {
        navigatePhotos('prev');
        setTouchStart(null);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleDownload = async () => {
    const photo = photos[currentIndex];
    try {
      const response = await fetch(photo.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg"
      onClick={() => !isZoomed && onClose()}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <ShareButton
          url={`${window.location.origin}/photo/${currentPhoto.id}`}
          title={currentPhoto.title}
          description={currentPhoto.caption}
          className="text-white hover:bg-white/20"
        />
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleDownload}
          aria-label="Download photo"
        >
          <Download className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div
        className="h-full w-full flex"
        data-testid="lightbox-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left side - Photo */}
        <div
          className="flex-1 flex items-center justify-center relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              navigatePhotos('prev');
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div
            className="relative max-w-[calc(100vw-400px)] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              key={currentPhoto.id}
              src={currentPhoto.image_url}
              alt={currentPhoto.title}
              className="max-w-full max-h-[90vh] object-contain cursor-zoom-in"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={() => setIsZoomed(!isZoomed)}
              style={{
                transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                transition: 'transform 0.3s ease',
              }}
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white"
            >
              <h2 className="text-xl font-semibold mb-2">{currentPhoto.title}</h2>
              <p className="text-sm opacity-90">{currentPhoto.caption}</p>
            </motion.div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              navigatePhotos('next');
            }}
            aria-label="Next photo"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        {/* Right side - Comments */}
        <div
          className="w-[400px] bg-white dark:bg-gray-900 h-full overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
          data-testid="comments-section"
        >
          <PhotoComments photoId={currentPhoto.id} />
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoLightbox; 