import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import PhotoGrid from '@/components/PhotoGrid';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Upload, Edit, Trash2, Calendar, Heart, MessageCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked' | 'most_commented'>('newest');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const getSortQuery = (option: typeof sortBy) => {
    switch (option) {
      case 'oldest':
        return { column: 'created_at', ascending: true };
      case 'most_liked':
        return { column: 'likes_count', ascending: false };
      case 'most_commented':
        return { column: 'comments_count', ascending: false };
      default:
        return { column: 'created_at', ascending: false };
    }
  };

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
          const sort = getSortQuery(sortBy);
          query = query.eq('user_id', user?.id).order(sort.column, { ascending: sort.ascending });
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
  }, [debouncedSearch, filter, user?.id, sortBy]);

  const handleDeletePhoto = async (id: string, imagePath: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      const { error: storageError } = await supabase.storage.from('photos').remove([imagePath]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase.from('photos').delete().eq('id', id);
      if (dbError) throw dbError;
      setPhotos(photos => photos.filter(photo => photo.id !== id));
      toast.success('Photo deleted successfully');
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        message = (err as { message: string }).message;
      }
      toast.error(`Error deleting photo: ${message}`);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
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
            {filter === 'mine' && (
              <Button asChild>
                <a href="/upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload New</span>
                </a>
              </Button>
            )}
          </div>
          {filter === 'mine' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Sort by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('most_liked')}>Most liked</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('most_commented')}>Most commented</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Photo Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="aspect-video bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-medium mb-4">{filter === 'mine' ? "You haven't uploaded any photos yet" : "No photos found"}</h2>
              <p className="text-muted-foreground mb-8">
                {filter === 'mine' ? "Get started by uploading your first photo" : "Try adjusting your search or filter."}
              </p>
              {filter === 'mine' && (
                <Button asChild>
                  <a href="/upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="overflow-hidden group rounded-lg bg-card shadow">
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={photo.image_url} 
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-medium mb-1">{photo.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-2">{photo.caption}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(photo.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {photo.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {typeof photo.comments_count === 'number' ? photo.comments_count : 0}
                      </span>
                    </div>
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {photo.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {filter === 'mine' && (
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/edit-photo/${photo.id}`} className="flex items-center gap-1">
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo.id, photo.image_path)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PrivateGallery; 