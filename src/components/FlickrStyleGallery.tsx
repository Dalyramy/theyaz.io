import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Eye, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PhotoLightbox from '@/components/photo/PhotoLightbox';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface Photo {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  tags: string[];
  profiles: {
    username: string;
    avatar_url: string;
    full_name?: string;
  };
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

interface FlickrStyleGalleryProps {
  photos: Photo[];
  loading?: boolean;
  isOwner?: boolean;
}

const ITEMS_PER_PAGE = 20;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const SORT_OPTIONS = [
  { label: 'Recent', value: 'recent' },
  { label: 'Popular', value: 'popular' },
  { label: 'Oldest', value: 'oldest' },
];

const FlickrStyleGallery = ({ photos, loading = false, isOwner = false }: FlickrStyleGalleryProps) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('recent');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);



  // Extract unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      if (photo.tags && Array.isArray(photo.tags)) {
        photo.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            tags.add(tag);
          }
        });
      }
    });
    let result = Array.from(tags).sort();
    
    // If no tags found, add some default categories
    if (result.length === 0) {
      result = ['landscape', 'portrait', 'street', 'nature', 'urban'];
    }
    
    return result;
  }, [photos]);

  // Filter and sort photos
  const processedPhotos = useMemo(() => {
    let filtered = selectedTag 
      ? photos.filter(photo => photo.tags?.includes(selectedTag))
      : photos;

    // Sort photos
    switch (sortOption) {
      case 'popular':
        filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [photos, selectedTag, sortOption]);

  const { displayedItems, lastItemRef, hasMore } = useInfiniteScroll({
    items: processedPhotos,
    itemsPerPage: ITEMS_PER_PAGE,
    loading
  });

  const handlePhotoClick = (photoId: string) => {
    setLightboxPhotoId(photoId);
    setLightboxOpen(true);
  };

  const handleShare = async (e: React.MouseEvent, photo: Photo) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: photo.title,
          text: photo.caption,
          url: window.location.origin + `/photo/${photo.id}`
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.origin + `/photo/${photo.id}`
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium text-secondary">Loading photos...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] bg-muted rounded-lg mb-2"></div>
              <div className="h-4 bg-muted rounded mb-1"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {SORT_OPTIONS.map(option => (
          <button
            key={option.value}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              sortOption === option.value 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-muted text-foreground hover:bg-primary/10'
            }`}
            onClick={() => setSortOption(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            !selectedTag 
              ? 'bg-primary text-white shadow-lg border-primary' 
              : 'bg-muted text-foreground hover:bg-primary/10 border-border'
          }`}
          onClick={() => setSelectedTag(null)}
        >
          All Photos
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selectedTag === tag 
                ? 'bg-primary text-white shadow-lg border-primary' 
                : 'bg-muted text-foreground hover:bg-primary/10 border-border'
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Flickr-style Masonry Grid */}
      <motion.div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
        style={{ columnGap: '1rem' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {displayedItems.map((photo, index) => {
            const isLastPhoto = index === displayedItems.length - 1;
            return (
              <motion.div
                key={photo.id}
                ref={el => {
                  if (isLastPhoto) lastItemRef(el);
                }}
                variants={itemVariants}
                layout
                className="relative group cursor-pointer mb-4 break-inside-avoid"
                style={{ 
                  display: 'inline-block',
                  width: '100%',
                  marginBottom: '1rem'
                }}
                onClick={() => handlePhotoClick(photo.id)}
                onMouseEnter={() => setHoveredPhoto(photo.id)}
                onMouseLeave={() => setHoveredPhoto(null)}
              >
                {/* Photo Container */}
                <div className="relative overflow-hidden rounded-lg bg-muted aspect-[4/5] mb-2">
                  <motion.img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Overlay on hover */}
                  <AnimatePresence>
                    {hoveredPhoto === photo.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 flex flex-col justify-between p-4 text-white"
                      >
                        {/* Top section */}
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            <Camera className="w-3 h-3 mr-1" />
                            iPhone 16 Pro Max
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-white hover:bg-white/20"
                            onClick={(e) => handleShare(e, photo)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Bottom section */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-2">
                            {photo.title}
                          </h3>
                          {photo.caption && (
                            <p className="text-sm opacity-90 line-clamp-2">
                              {photo.caption}
                            </p>
                          )}
                          
                          {/* Tags */}
                          {photo.tags && photo.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {photo.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
                                  #{tag}
                                </span>
                              ))}
                              {photo.tags.length > 3 && (
                                <span className="text-xs opacity-70">+{photo.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Photo info below image (always visible) */}
                <div className="mt-3 space-y-2">
                  <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {photo.title}
                  </h3>

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Load more indicator */}
      {hasMore && (
        <motion.div 
          className="flex justify-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
        </motion.div>
      )}

      {/* Lightbox */}
      {lightboxOpen && lightboxPhotoId && (
        <PhotoLightbox
          photos={processedPhotos}
          initialPhotoId={lightboxPhotoId}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default FlickrStyleGallery; 