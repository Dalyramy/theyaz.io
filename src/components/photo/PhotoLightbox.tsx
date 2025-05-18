import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Heart, MessageCircle, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import PhotoComments from '@/components/social/PhotoComments';
import ShareButton from '@/components/social/ShareButton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import UserProfileLink from '@/components/ui/UserProfileLink';

interface PhotoLightboxProps {
  photos: Array<{
    id: string;
    title: string;
    image_url: string;
    caption: string;
    profiles: {
      username: string;
      avatar_url: string;
      full_name?: string;
    };
  }>;
  initialPhotoId: string;
  onClose: () => void;
}

const PhotoInfo = ({ photo }: { photo: PhotoLightboxProps['photos'][0] }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [likesResult, commentsResult, userLikeResult] = await Promise.all([
          supabase.from('likes').select('id', { count: 'exact' }).eq('photo_id', photo.id),
          supabase.from('comments').select('id', { count: 'exact' }).eq('photo_id', photo.id),
          user ? supabase.from('likes').select('id').eq('photo_id', photo.id).eq('user_id', user.id).single() : null
        ]);

        setLikesCount(likesResult.count || 0);
        setCommentsCount(commentsResult.count || 0);
        setIsLiked(!!userLikeResult?.data);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, [photo.id, user]);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('photo_id', photo.id).eq('user_id', user.id);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase.from('likes').insert({ photo_id: photo.id, user_id: user.id });
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <UserProfileLink user={photo.profiles} avatarClassName="h-8 w-8" nameClassName="font-medium" />
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{commentsCount}</span>
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-medium text-lg mb-2">{photo.title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{photo.caption}</p>
      </div>
    </div>
  );
};

const PhotoLightbox = ({ photos, initialPhotoId, onClose }: PhotoLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const navigatePhotos = useCallback((direction: 'prev' | 'next') => {
    if (isZoomed) return;
    setCurrentIndex(prev => {
      if (direction === 'prev') {
        return prev > 0 ? prev - 1 : photos.length - 1;
      } else {
        return prev < photos.length - 1 ? prev + 1 : 0;
      }
    });
  }, [isZoomed, photos.length]);

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
  }, [currentIndex, navigatePhotos, onClose]);

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
              layoutId={`photo-${currentPhoto.id}`}
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
          <PhotoInfo photo={currentPhoto} />
          <Separator className="my-6" />
          <PhotoComments photoId={currentPhoto.id} />
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoLightbox; 