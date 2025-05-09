import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Heart, MessageSquare, Share2 } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import PhotoViewer from './PhotoViewer';

interface Photo {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  tags: string[];
  likes?: number;
  comments?: number;
}

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setIsViewerOpen(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
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
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      <Link 
        to={`/photo/${photo.id}`} 
        onClick={handleImageClick}
        className="block transform transition-transform duration-300 hover:-translate-y-1"
      >
        <motion.div
          initial={false}
          animate={{ scale: isHovered ? 1.02 : 1 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-lg">
                <motion.img
                  layoutId={`photo-${photo.image_url}`}
                  src={photo.image_url}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-xs text-white backdrop-blur-md">
                    <Logo size={12} className="drop-shadow-[0_0_8px_#3b82f6]" />
                    <span>iPhone 16 Pro Max</span>
                  </div>
                  <motion.button
                    className="rounded-full bg-black/20 p-2 text-white/80 hover:text-white backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    onClick={handleShare}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium line-clamp-1">{photo.title}</h3>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{photo.likes || 0}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs">{photo.comments || 0}</span>
                    </motion.div>
                  </div>
                </div>
                
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {photo.caption}
                </p>
                
                {photo.tags && photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {photo.tags.map((tag, i) => (
                      <motion.span
                        key={i}
                        className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>

      <PhotoViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        imageUrl={photo.image_url}
        alt={photo.title}
        title={photo.title}
      />
    </>
  );
};

export default PhotoCard;
