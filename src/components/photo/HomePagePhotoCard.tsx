import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Eye, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface PhotoWithAlbum {
  id: string;
  title: string;
  image_url: string;
  album_id: string;
  album_title: string;
  likes_count: number | null;
  comments_count: number | null;
}

interface HomePagePhotoCardProps {
  photo: PhotoWithAlbum;
  index: number;
}

const HomePagePhotoCard: React.FC<HomePagePhotoCardProps> = React.memo(({ photo, index }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
    target.onerror = null; // Prevent infinite loop
  };

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
              src={photo.image_url}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl"
              loading="lazy"
              onError={handleImageError}
            />
          </Link>
          
          {/* Overlay with album info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Album badge */}
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
          
          {/* View photo button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link to={`/photo/${photo.id}`}>
              <Button size="sm" variant="secondary" className="rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3">
            <Link to={`/photo/${photo.id}`} className="block">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                {photo.title}
              </h3>
            </Link>
            
            {/* Album link */}
            <Link 
              to={`/gallery`}
              state={{ selectedAlbumId: photo.album_id }}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-secondary transition-colors duration-200 underline decoration-dotted"
            >
              <FolderOpen className="w-3 h-3" />
              {photo.album_title}
            </Link>
          </div>
          
          {/* Social stats */}
          <div className="flex items-center justify-between text-muted-foreground mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {photo.likes_count || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {photo.comments_count || 0}
                </span>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link to={`/gallery`} state={{ selectedAlbumId: photo.album_id }}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={`/photo/${photo.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

HomePagePhotoCard.displayName = 'HomePagePhotoCard';

export default HomePagePhotoCard; 