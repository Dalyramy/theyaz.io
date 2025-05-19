import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import PhotoGrid from '@/components/PhotoGrid';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Define the expected photo type
interface Photo {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
  created_at: string;
  user_id: string;
  profile?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
  // Add other fields as needed
}

const PrivateGallery = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'shared'
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from('photos')
          .select(`
            *,
            profiles(
              username,
              avatar_url,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filter === 'mine') {
          query = query.eq('user_id', user?.id);
        } else if (filter === 'shared') {
          query = query.neq('user_id', user?.id);
        }

        // Apply search
        if (debouncedSearch) {
          query = query.or(
            `title.ilike.%${debouncedSearch}%,caption.ilike.%${debouncedSearch}%,tags.cs.{${debouncedSearch}}`
          );
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform the data to match the expected format
        const transformedData = (data || []).map(photo => ({
          ...photo,
          profile: photo.profiles
        }));
        
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
  }, [debouncedSearch, filter, user?.id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Private Gallery</h1>
          <p className="text-muted-foreground">
            Your personal space for photos and shared memories
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="flex-1 sm:flex-none"
            >
              All Photos
            </Button>
            <Button
              variant={filter === 'mine' ? 'default' : 'outline'}
              onClick={() => setFilter('mine')}
              className="flex-1 sm:flex-none"
            >
              My Photos
            </Button>
            <Button
              variant={filter === 'shared' ? 'default' : 'outline'}
              onClick={() => setFilter('shared')}
              className="flex-1 sm:flex-none"
            >
              Shared
            </Button>
          </div>
        </div>

        {/* Photo Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PhotoGrid photos={photos} loading={isLoading} />
        </motion.div>
      </main>
    </div>
  );
};

export default PrivateGallery; 