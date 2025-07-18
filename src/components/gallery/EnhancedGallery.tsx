import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Camera, 
  Sparkles,
  Image as ImageIcon,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import PhotoViewer from '@/components/photo/PhotoViewer';
import { useIsMobile } from '@/hooks/use-mobile';

interface Photo {
  id: string;
  title: string;
  image_url: string;
  caption?: string;
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
  instagram_post_id?: string | null;
  created_at: string;
  user_id?: string;
}

interface EnhancedGalleryProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
}

// Fallback sample data for mobile testing
const fallbackPhotos: Photo[] = [
  {
    id: 'fallback-1',
    title: 'Beautiful Sunset',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    caption: 'Stunning sunset captured during golden hour',
    tags: ['landscape', 'sunset', 'nature'],
    likes_count: 42,
    comments_count: 8,
    created_at: new Date().toISOString(),
    user_id: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: 'fallback-2',
    title: 'Street Photography',
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    caption: 'Urban life captured in candid moments',
    tags: ['street', 'urban', 'photography'],
    likes_count: 67,
    comments_count: 12,
    instagram_post_id: 'CyHksZcMYY2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: '22222222-2222-2222-2222-222222222222'
  },
  {
    id: 'fallback-3',
    title: 'Portrait in Natural Light',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    caption: 'Natural lighting creates beautiful shadows',
    tags: ['portrait', 'natural-light'],
    likes_count: 89,
    comments_count: 15,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    user_id: '33333333-3333-3333-3333-333333333333'
  },
  {
    id: 'fallback-4',
    title: 'Modern Architecture',
    image_url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    caption: 'Clean lines and geometric shapes',
    tags: ['architecture', 'modern'],
    likes_count: 34,
    comments_count: 6,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    user_id: '44444444-4444-4444-4444-444444444444'
  },
  {
    id: 'fallback-5',
    title: 'Mountain Landscape',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    caption: 'Breathtaking view of snow-capped peaks',
    tags: ['nature', 'mountains', 'landscape'],
    likes_count: 156,
    comments_count: 23,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    user_id: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: 'fallback-6',
    title: 'City Lights at Night',
    image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
    caption: 'Urban photography capturing city energy',
    tags: ['urban', 'night', 'city-lights'],
    likes_count: 78,
    comments_count: 11,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    user_id: '22222222-2222-2222-2222-222222222222'
  }
];

const EnhancedGallery: React.FC<EnhancedGalleryProps> = ({ 
  className = "", 
  showHeader = true,
  limit 
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const isMobile = useIsMobile();

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('photos')
        .select(`
          id, 
          title, 
          image_url, 
          caption, 
          tags, 
          likes_count, 
          comments_count,
          instagram_post_id,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching photos:', fetchError);
        // Use fallback data for mobile testing
        console.log('Using fallback data for mobile testing');
        setPhotos(fallbackPhotos);
        return;
      }

      if (!data || data.length === 0) {
        // Use fallback data if no photos in database
        console.log('No photos in database, using fallback data');
        setPhotos(fallbackPhotos);
        return;
      }

      setPhotos(data);
    } catch (err) {
      console.error('Error in fetchPhotos:', err);
      // Use fallback data on any error
      console.log('Error occurred, using fallback data');
      setPhotos(fallbackPhotos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();

    // Subscribe to real-time updates only if we have real data
    if (photos.length > 0 && photos[0].id !== 'fallback-1') {
      const subscription = supabase
        .channel('photos_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'photos'
          },
          () => {
            fetchPhotos(); // Refresh on any change
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [limit]);

  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    setIsViewerOpen(true);
  };

  const handleShare = async (photo: Photo, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: photo.title,
          text: photo.caption || photo.title,
          url: `${window.location.origin}/photo/${photo.id}`
        });
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/photo/${photo.id}`
        );
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!selectedPhoto) return;
    
    const newIndex = direction === 'left' 
      ? Math.min(currentPhotoIndex + 1, photos.length - 1)
      : Math.max(currentPhotoIndex - 1, 0);
    
    if (newIndex !== currentPhotoIndex) {
      setCurrentPhotoIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-background text-foreground ${className}`}>
        <div className="container mx-auto px-4 py-8">
          {showHeader && (
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <Badge variant="secondary" className="text-xs sm:text-sm">Gallery</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                Photo Gallery
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">Discover beautiful moments captured in time</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(isMobile ? 4 : 6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="animate-pulse"
              >
                <Card className="overflow-hidden">
                  <div className="aspect-[4/5] bg-muted rounded-t-lg"></div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-background text-foreground flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <div className="text-muted-foreground text-lg mb-4">{error}</div>
          <Button onClick={fetchPhotos} className="gap-2">
            <Loader2 className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={`min-h-screen bg-background text-foreground flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No photos yet</h3>
          <p className="text-muted-foreground">Check back later for new content</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${className}`}>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {showHeader && (
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <Badge variant="secondary" className="text-xs sm:text-sm">Gallery</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Photo Gallery
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">Discover beautiful moments captured in time</p>
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={!isMobile ? { y: -5 } : {}}
                whileTap={isMobile ? { scale: 0.98 } : {}}
                className="group touch-manipulation"
              >
                <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/5] w-full overflow-hidden">
                      {photo.instagram_post_id ? (
                        <div className="h-full w-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-2xl sm:text-3xl mb-2">📸</div>
                            <div className="text-xs sm:text-sm font-medium">Instagram Post</div>
                            <div className="text-xs opacity-80">Tap to view</div>
                          </div>
                        </div>
                      ) : (
                        <motion.img
                          layoutId={`photo-${photo.id}`}
                          src={photo.image_url}
                          alt={photo.title}
                          className="h-full w-full object-cover cursor-pointer touch-manipulation"
                          loading="lazy"
                          onClick={() => handlePhotoClick(photo, index)}
                          whileHover={!isMobile ? { scale: 1.05 } : {}}
                          whileTap={isMobile ? { scale: 0.95 } : {}}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      {/* Overlay with camera info and share button */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs bg-black/20 text-white backdrop-blur-md">
                          <Camera className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">iPhone 16 Pro Max</span>
                          <span className="sm:hidden">iPhone</span>
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full bg-black/20 text-white/80 hover:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 touch-manipulation"
                          onClick={(e) => handleShare(photo, e)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Bottom overlay with photo info - always visible on mobile */}
                      <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
                        <motion.div
                          initial={{ opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 30 }}
                          whileHover={!isMobile ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 text-white"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <div className="flex items-center gap-2 sm:gap-4 mb-2">
                            <span className="flex items-center gap-1 text-xs sm:text-sm">
                              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                              {photo.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1 text-xs sm:text-sm">
                              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                              {photo.comments_count || 0}
                            </span>
                            {photo.tags && photo.tags.length > 0 && (
                              <span className="flex flex-wrap gap-1 ml-2">
                                {photo.tags.slice(0, isMobile ? 1 : 2).map((tag, i) => (
                                  <span key={i} className="bg-white/20 rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-medium">
                                    #{tag}
                                  </span>
                                ))}
                                {photo.tags.length > (isMobile ? 1 : 2) && (
                                  <span className="text-xs ml-1">+{photo.tags.length - (isMobile ? 1 : 2)}</span>
                                )}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-base sm:text-lg line-clamp-1 mb-1">{photo.title}</div>
                          {photo.caption && (
                            <div className="text-xs opacity-80 line-clamp-2 mb-2">{photo.caption}</div>
                          )}
                          <div className="text-xs opacity-60">{formatDate(photo.created_at)}</div>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load more button if there's a limit */}
        {limit && photos.length >= limit && (
          <motion.div 
            className="text-center mt-6 sm:mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              variant="outline" 
              size="lg"
              onClick={fetchPhotos}
              className="gap-2 w-full sm:w-auto"
            >
              <Loader2 className="w-4 h-4" />
              Load More Photos
            </Button>
          </motion.div>
        )}
      </div>

      {/* Enhanced Mobile Photo Viewer */}
      {selectedPhoto && (
        <div className={`fixed inset-0 z-50 bg-black ${isViewerOpen ? 'block' : 'hidden'}`}>
          <div className="relative h-full w-full">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full p-2"
              onClick={() => {
                setIsViewerOpen(false);
                setSelectedPhoto(null);
              }}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full p-2"
                  onClick={() => handleSwipe('right')}
                  disabled={currentPhotoIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full p-2"
                  onClick={() => handleSwipe('left')}
                  disabled={currentPhotoIndex === photos.length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Photo display */}
            <div className="flex items-center justify-center h-full w-full p-4">
              {selectedPhoto.instagram_post_id ? (
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="text-xl font-semibold mb-2">{selectedPhoto.title}</h3>
                  <p className="text-sm opacity-80">Instagram Post</p>
                </div>
              ) : (
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Photo info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h3 className="text-lg font-semibold mb-2">{selectedPhoto.title}</h3>
              {selectedPhoto.caption && (
                <p className="text-sm opacity-80 mb-2">{selectedPhoto.caption}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {selectedPhoto.likes_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {selectedPhoto.comments_count || 0}
                </span>
                <span className="text-xs opacity-60">{formatDate(selectedPhoto.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGallery; 