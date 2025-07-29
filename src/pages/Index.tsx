import { useState, useEffect } from 'react';
import FlickrStyleGallery from '@/components/FlickrStyleGallery';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import FooterSection from '@/components/home/FooterSection';
import { Link } from 'react-router-dom';
import Trans from './Trans';

const ITEMS_PER_PAGE = 12;

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

const Index = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        let query = supabase
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
            user_id
          `)
          .order('created_at', { ascending: false });

        if (debouncedSearch) {
          query = query.or(
            `title.ilike.%${debouncedSearch}%,caption.ilike.%${debouncedSearch}%`
          );
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data to match the Photo interface
        const transformedData = (data || []).map(photo => {
          const commentsCount = typeof photo.comments_count === 'number' ? photo.comments_count : 0;
          return {
            ...photo,
            comments_count: commentsCount,
            profiles: {
              username: 'user',
              avatar_url: '',
              full_name: 'User'
            }
          };
        });
        
        setPhotos(transformedData);
      } catch (err: unknown) {
        console.error('Error fetching photos:', err);
        let message = 'Unknown error';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        toast.error(`Failed to load photos: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhotos();
  }, [debouncedSearch]);
  
  const handleExploreClick = () => {
    const photoGridSection = document.querySelector('#photo-grid');
    if (photoGridSection) {
      photoGridSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-24">
      <Navbar />
      {/* Hero Section */}
      <HeroSection />
      {/* Photo Gallery Section */}
      <div id="photo-grid" className="container mx-auto px-4 py-12 mt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Flickr-Style Photo Gallery
          </h2>
          <p className="text-muted-foreground">Experience our beautiful masonry layout with hover effects</p>
        </div>
        <FlickrStyleGallery photos={photos} loading={isLoading} />
      </div>
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
    </div>
  );
};

export default Index;
