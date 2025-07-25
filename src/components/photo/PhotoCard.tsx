import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Heart, MessageSquare, Share2 } from 'lucide-react';
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
        className="block transform transition-transform duration-300 hover:-translate-y-1 h-full"
      >
        <motion.div
          initial={false}
          animate={{ scale: isHovered ? 1.02 : 1 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="h-full"
        >
          <Card className="overflow-hidden bg-card/50 backdrop-blur-sm h-full flex flex-col">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-lg flex-shrink-0">
                <motion.img
                  layoutId={`photo-${photo.image_url}`}
                  src={photo.image_url}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-md">
                  <span>iPhone 16 Pro Max</span>
                </div>
                <motion.button
                  className="absolute top-3 right-3 rounded-full bg-black/40 p-2 text-white/80 hover:text-white backdrop-blur-md"
                  onClick={handleShare}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="h-4 w-4" />
                </motion.button>
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
