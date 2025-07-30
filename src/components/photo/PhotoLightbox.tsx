import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import PhotoComments from '@/components/social/PhotoComments';
import ShareButton from '@/components/social/ShareButton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
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
    <div className="space-y-6">
      {/* Photo Info Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <UserProfileLink user={photo.profiles} avatarClassName="h-10 w-10" nameClassName="font-semibold text-lg" />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{commentsCount}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Photo Details */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{photo.title}</h2>
          {photo.caption && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{photo.caption}</p>
          )}
        </div>
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



  const currentPhoto = photos[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-2xl"
      onClick={() => !isZoomed && onClose()}
    >
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <ShareButton
          url={`${window.location.origin}/photo/${currentPhoto.id}`}
          title={currentPhoto.title}
          description={currentPhoto.caption}
          className="text-white hover:bg-white/30 bg-black/30 backdrop-blur-md rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        />

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/30 bg-black/30 backdrop-blur-md rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div
        className="h-full w-full flex items-center justify-center"
        data-testid="lightbox-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full screen photo */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/30 bg-black/30 backdrop-blur-md rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              navigatePhotos('prev');
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div
            className="relative w-full h-full flex items-center justify-center p-4 group"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              layoutId={`photo-${currentPhoto.id}`}
              src={currentPhoto.image_url}
              alt={currentPhoto.title}
              className="max-w-full max-h-full object-contain cursor-zoom-in rounded-lg shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              onClick={() => setIsZoomed(!isZoomed)}
              style={{
                transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            />
            
            {/* Floating info panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-xl rounded-3xl p-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl border border-white/10"
            >
              <div className="text-center flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold mb-2 text-white text-center">{currentPhoto.title}</h3>
                {currentPhoto.caption && (
                  <p className="text-sm opacity-90 leading-relaxed max-w-md text-center">{currentPhoto.caption}</p>
                )}
              </div>
            </motion.div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/30 bg-black/30 backdrop-blur-md rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              navigatePhotos('next');
            }}
            aria-label="Next photo"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoLightbox; 