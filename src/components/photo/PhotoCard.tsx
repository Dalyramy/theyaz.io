import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

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
  return (
    <Link to={`/photo/${photo.id}`}>
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-lg">
            <img
              src={photo.image_url}
              alt={photo.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-xs text-white backdrop-blur-md">
                <Phone className="h-3 w-3" />
                <span>iPhone 16 Pro Max</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-medium line-clamp-1">{photo.title}</h3>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">{photo.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">{photo.comments || 0}</span>
                </div>
              </div>
            </div>
            
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {photo.caption}
            </p>
            
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {photo.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PhotoCard;
