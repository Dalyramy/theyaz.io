import { useState, useCallback, memo } from 'react';
import { Calendar, Tag, User, Phone, Camera, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { PhotoSocialFeatures } from '@/components/ui/PhotoSocialFeatures';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoNavigation } from '@/hooks/usePhotoNavigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import UserProfileLink from '@/components/ui/UserProfileLink';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface PhotoDetailProps {
  photo: {
    id: string;
    title: string;
    caption: string;
    tags: string[];
    image_url: string;
    created_at: string;
    user_id: string;
    profiles: {
      username: string;
      avatar_url: string;
      full_name?: string;
    };
  };
}

// Memoized components for better performance
const NavigationButton = memo(({ direction, onClick, className }: { 
  direction: 'left' | 'right', 
  onClick: () => void,
  className: string 
}) => (
  <Button
    variant="ghost"
    size="icon"
    className={className}
    onClick={onClick}
  >
    {direction === 'left' ? (
      <ChevronLeft className="h-6 w-6" />
    ) : (
      <ChevronRight className="h-6 w-6" />
    )}
  </Button>
));

const PhotoThumbnail = memo(({ photo, direction, onClick }: {
  photo: { image_url: string; title: string; },
  direction: 'left' | 'right',
  onClick: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="relative h-12 w-12 rounded-md overflow-hidden group cursor-pointer shadow-lg shadow-emerald-900/10"
    onClick={onClick}
  >
    <img
      src={photo.image_url}
      alt={photo.title}
      className="h-full w-full object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      {direction === 'left' ? (
        <ChevronLeft className="h-4 w-4 text-white" />
      ) : (
        <ChevronRight className="h-4 w-4 text-white" />
      )}
    </div>
  </motion.div>
));

const PhotoMetadata = memo(({ date, caption, tags }: {
  date: string;
  caption: string;
  tags: string[];
}) => (
  <>
    <div className="flex items-center gap-4 text-sm text-primary">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <time dateTime={date}>{date}</time>
      </div>
      <div className="flex items-center gap-2">
        <span>Shot on iPhone</span>
      </div>
      <div className="flex items-center gap-2">
        <Leaf className="h-4 w-4" />
        <span>Nature-inspired</span>
      </div>
    </div>
    <Separator className="bg-muted/50" />
    <div className="prose prose-primary dark:prose-invert max-w-none">
      <p className="text-lg leading-relaxed text-foreground">{caption}</p>
    </div>
    {tags && tags.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="bg-muted text-primary hover:bg-accent border border-muted"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    )}
  </>
));

const PhotoDetail = ({ photo }: PhotoDetailProps) => {
  const [loaded, setLoaded] = useState(false);
  const { previousPhoto, nextPhoto, navigateToPhoto, isLoading } = usePhotoNavigation(photo.id);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const formattedDate = new Date(photo.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) < 50) return;

    if (diff > 0 && nextPhoto) {
      navigateToPhoto(nextPhoto.id);
    } else if (diff < 0 && previousPhoto) {
      navigateToPhoto(previousPhoto.id);
    }

    setTouchStart(null);
  }, [touchStart, nextPhoto, previousPhoto, navigateToPhoto]);

  const buttonClassName = "h-12 w-12 rounded-full bg-primary/20 backdrop-blur-md hover:bg-primary/40 text-primary-foreground shadow-lg shadow-primary/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Navigation Buttons */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none">
        <AnimatePresence>
          {previousPhoto && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pointer-events-auto"
            >
              <NavigationButton
                direction="left"
                onClick={() => navigateToPhoto(previousPhoto.id)}
                className={buttonClassName}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {nextPhoto && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="pointer-events-auto"
            >
              <NavigationButton
                direction="right"
                onClick={() => navigateToPhoto(nextPhoto.id)}
                className={buttonClassName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Thumbnails */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        <AnimatePresence>
          {previousPhoto && (
            <PhotoThumbnail
              photo={previousPhoto}
              direction="left"
              onClick={() => navigateToPhoto(previousPhoto.id)}
            />
          )}
          {nextPhoto && (
            <PhotoThumbnail
              photo={nextPhoto}
              direction="right"
              onClick={() => navigateToPhoto(nextPhoto.id)}
            />
          )}
        </AnimatePresence>
      </div>

      <Card 
        className="overflow-hidden backdrop-blur-sm bg-card text-card-foreground border-0 shadow-xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
          <OptimizedImage
            key={photo.id}
            src={photo.image_url}
            alt={photo.title}
            className="h-full w-full"
            priority={true}
            placeholder="blur"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1.5 text-sm text-primary-foreground backdrop-blur-md border border-primary/20">
              <Camera className="h-4 w-4" />
              <span>iPhone 16 Pro Max</span>
            </div>
          </div>
        </div>
        <motion.div 
          className="p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {photo.title}
              </h1>
              <UserProfileLink user={photo.profiles} className="gap-3" avatarClassName="h-10 w-10 border-2 border-primary/20" nameClassName="font-medium text-primary hover:text-accent" />
            </div>
            
            <PhotoMetadata
              date={formattedDate}
              caption={photo.caption}
              tags={photo.tags}
            />
          </div>

          <Separator className="bg-muted/50" />
          
          <PhotoSocialFeatures
            photoId={photo.id}
            photoUrl={photo.image_url}
          />
        </motion.div>
      </Card>

      {/* Navigation Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-center text-sm text-primary"
      >
        <p>Use arrow keys or swipe to navigate between photos</p>
      </motion.div>
    </motion.div>
  );
};

export default memo(PhotoDetail);
