import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, Eye, MoreVertical, User, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';

interface PhotoData {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  likes_count: number | null;
  comments_count: number | null;
  tags: string[];
  created_at: string;
  user_id?: string;
  profiles?: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

interface PhotoGridProps {
  photos: PhotoData[];
  viewMode: 'grid' | 'list';
  onPhotoClick?: (photo: PhotoData) => void;
  onLikePhoto?: (photoId: string) => Promise<void>;
  onSharePhoto?: (photo: PhotoData) => void;
  onDeletePhoto?: (photoId: string) => Promise<void>;
  showUserInfo?: boolean;
  showActions?: boolean;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  viewMode,
  onPhotoClick,
  onLikePhoto,
  onSharePhoto,
  onDeletePhoto,
  showUserInfo = true,
  showActions = true
}) => {
  const { user } = useAuth();
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());

  const handleLike = async (photoId: string) => {
    if (!user) {
      toast.error('Please log in to like photos');
      return;
    }

    if (onLikePhoto) {
      try {
        await onLikePhoto(photoId);
        setLikedPhotos(prev => {
          const newSet = new Set(prev);
          if (newSet.has(photoId)) {
            newSet.delete(photoId);
          } else {
            newSet.add(photoId);
          }
          return newSet;
        });
      } catch (error) {
        console.error('Error liking photo:', error);
        toast.error('Failed to like photo');
      }
    }
  };

  const handleShare = (photo: PhotoData) => {
    if (onSharePhoto) {
      onSharePhoto(photo);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: photo.title,
          text: photo.caption || photo.title,
          url: window.location.href
        });
      } else {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      if (onDeletePhoto) {
        try {
          await onDeletePhoto(photoId);
          toast.success('Photo deleted successfully');
        } catch (error) {
          console.error('Error deleting photo:', error);
          toast.error('Failed to delete photo');
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const photoDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - photoDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-4">No photos in this album yet</div>
        <div className="text-muted-foreground">Photos will appear here once uploaded</div>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" 
      : "space-y-4"
    }>
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className={viewMode === 'list' ? "flex gap-4" : ""}
          >
            <Card className={`group overflow-hidden hover-lift rounded-2xl border-border transition-all duration-300 hover:shadow-xl ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className={`overflow-hidden bg-muted relative ${viewMode === 'list' ? 'w-32 h-32' : 'aspect-square'}`}>
                <OptimizedImage
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  sizes={viewMode === 'list' 
                    ? "(max-width: 768px) 100vw, 128px" 
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  onClick={() => onPhotoClick?.(photo)}
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="bg-black/20 hover:bg-black/40 text-white"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onPhotoClick?.(photo)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(photo)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Photo
                          </DropdownMenuItem>
                          {user && photo.user_id === user.id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(photo.id)}
                                className="text-destructive"
                              >
                                <MoreVertical className="w-4 h-4 mr-2" />
                                Delete Photo
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className={`p-4 sm:p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    {photo.title}
                  </h3>
                  
                  {photo.caption && (
                    <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-3">
                      {photo.caption}
                    </p>
                  )}
                  
                  {showUserInfo && photo.profiles && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        {photo.profiles.avatar_url ? (
                          <OptimizedImage
                            src={photo.profiles.avatar_url}
                            alt={photo.profiles.full_name}
                            className="w-6 h-6 rounded-full object-cover"
                            sizes="24px"
                          />
                        ) : (
                          <User className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {photo.profiles.full_name || photo.profiles.username}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(photo.created_at)}
                      </span>
                    </div>
                  )}
                  
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {photo.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {photo.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{photo.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-muted-foreground mt-2">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleLike(photo.id)}
                    >
                      <Heart className={`w-4 h-4 ${likedPhotos.has(photo.id) ? 'fill-current text-red-500' : ''}`} />
                      <span className="text-sm font-medium">
                        {photo.likes_count || 0}
                      </span>
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {typeof photo.comments_count === 'number' ? photo.comments_count : 0}
                      </span>
                    </div>
                  </div>
                  
                  {showActions && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]"
                      onClick={() => handleShare(photo)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGrid; 