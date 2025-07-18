import { useState, useEffect } from 'react';
import PhotoGrid from '@/components/PhotoGrid';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import SearchSection from '@/components/home/SearchSection';
import FooterSection from '@/components/home/FooterSection';
import { Link } from 'react-router-dom';
import CompactGallery from '@/components/gallery/CompactGallery';

const ITEMS_PER_PAGE = 12;

type Photo = {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
  created_at: string;
  // Add other fields as needed
};

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
          .select('id, title, caption, image_url, created_at, tags, user_id, profiles(id, username, avatar_url, full_name)')
          .order('created_at', { ascending: false });

        if (debouncedSearch) {
          query = query.or(
            `title.ilike.%${debouncedSearch}%,caption.ilike.%${debouncedSearch}%`
          );
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        setPhotos(data || []);
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <HeroSection handleExploreClick={handleExploreClick} />
      {/* Photo Grid Section */}
      <div id="photo-grid" className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Latest Photos
          </h2>
          <p className="text-muted-foreground">Explore our latest captures</p>
        </div>
        <PhotoGrid photos={photos} isLoading={isLoading} />
      </div>

      {/* Enhanced Gallery Preview */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Enhanced Gallery
          </h2>
          <p className="text-muted-foreground mb-6">Experience our new beautiful gallery design</p>
          <Link 
            to="/enhanced-gallery" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            View Full Gallery
          </Link>
        </div>
        <CompactGallery limit={6} />
      </div>
    </div>
  );
};

export default Index;
