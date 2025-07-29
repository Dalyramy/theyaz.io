import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageSquare, Share2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { optimizeImage, imgixOptimizations } from '@/lib/imgix';

interface Photo {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  tags: string[];
  likes?: number;
  comments?: number;
  album_id?: string;
  album_title?: string;
}

interface HomePagePhotoCardProps {
  photo: Photo;
  index: number;
}

const HomePagePhotoCard: React.FC<HomePagePhotoCardProps> = React.memo(({ photo, index }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
    target.onerror = null; // Prevent infinite loop
  };

  // Optimize image for gallery display
  const optimizedImageUrl = imgixOptimizations.gallery(photo.image_url);
  const thumbnailUrl = imgixOptimizations.thumbnail(photo.image_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden hover-lift rounded-2xl border-border w-full bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-muted relative">
          {/* Main photo link */}
          <Link to={`/photo/${photo.id}`} className="block w-full h-full">
            <img
              src={optimizedImageUrl}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl"
              loading="lazy"
              onError={handleImageError}
              // Add responsive image support
              srcSet={`${thumbnailUrl} 300w, ${optimizedImageUrl} 800w`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Link>
          
          {/* Overlay with album info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Album badge */}
          {photo.album_id && photo.album_title && (
            <div className="absolute top-3 left-3">
              <Link 
                to={`/gallery`}
                state={{ selectedAlbumId: photo.album_id }}
                className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-md hover:bg-black/60 transition-colors"
              >
                <FolderOpen className="w-3 h-3" />
                {photo.album_title}
              </Link>
            </div>
          )}
          
          {/* View photo button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
              <Share2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        
        {/* Card content always at the bottom */}
        <div className="flex flex-col justify-end flex-1 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white rounded-b-lg">
          <div className="flex items-center gap-4 mb-2">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {photo.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {photo.comments || 0}
            </span>
            {photo.tags && photo.tags.length > 0 && (
              <span className="flex flex-wrap gap-1 ml-2">
                {photo.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-medium">#{tag}</span>
                ))}
                {photo.tags.length > 2 && <span className="text-xs ml-1">+{photo.tags.length - 2}</span>}
              </span>
            )}
          </div>
          <div className="font-semibold text-lg line-clamp-1">{photo.title}</div>
          <div className="text-xs opacity-80 line-clamp-2">{photo.caption}</div>
        </div>
      </Card>
    </motion.div>
  );
});

export default HomePagePhotoCard; 