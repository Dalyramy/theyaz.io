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
          .select('*')
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
        if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
          message = (err as any).message;
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection handleExploreClick={handleExploreClick} />

      <main className="container mx-auto px-6 py-20 flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-background dark:to-background/80 backdrop-blur-sm rounded-t-3xl shadow-lg -mt-8 relative z-20">
        {/* Search Section */}
        <SearchSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Photo Grid */}
        <motion.div
          id="photo-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <PhotoGrid photos={photos} loading={isLoading} />
        </motion.div>
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Index;
