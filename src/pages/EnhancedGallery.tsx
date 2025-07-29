import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Camera, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import FlickrStyleGallery from '@/components/FlickrStyleGallery';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

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

const EnhancedGallery = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('photos')
        .select(`
          id,
          title,
          image_url,
          caption,
          tags,
          created_at,
          likes_count,
          comments_count,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <Navbar />
      
      {/* Peace Sign Background Watermark */}
      <div 
        className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
        style={{
          width: '300px',
          height: '300px',
          backgroundImage: 'url(/icons/peace-watermark.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(-10deg)',
        }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Enhanced Gallery
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Flickr-Style Photo Gallery
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Experience our beautiful masonry layout with hover effects and smooth animations
          </p>
        </motion.div>

        {/* Gallery Stats */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{photos.length}</div>
            <div className="text-sm text-muted-foreground">Total Photos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {photos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {photos.reduce((sum, photo) => sum + (photo.comments_count || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Comments</div>
          </div>
        </motion.div>

        {/* Flickr-Style Gallery */}
        <FlickrStyleGallery 
          photos={photos} 
          loading={loading} 
        />

        {/* Error State */}
        {error && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-muted-foreground text-lg mb-4">{error}</div>
            <button
              onClick={fetchPhotos}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default EnhancedGallery; 