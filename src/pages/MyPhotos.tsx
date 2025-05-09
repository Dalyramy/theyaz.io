import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Edit, Trash2, Upload, ExternalLink, Calendar, Heart, MessageCircle, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

type SortOption = 'newest' | 'oldest' | 'most_liked' | 'most_commented';

type Photo = {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  profile?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
  // Add other fields as needed
};

const MyPhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { user } = useAuth();
  
  const getSortQuery = (option: SortOption) => {
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
    const fetchUserPhotos = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const sort = getSortQuery(sortBy);
        const { data, error } = await supabase
          .from('photos')
          .select(`
            *,
            profile:profiles(
              username,
              avatar_url,
              full_name
            )
          `)
          .eq('user_id', user.id)
          .order(sort.column, { ascending: sort.ascending });
        
        if (error) throw error;
        
        // Transform the data to match the expected format
        const transformedData = (data || []).map(photo => ({
          ...photo,
          profiles: photo.profile
        }));
        
        setPhotos(transformedData);
      } catch (err: unknown) {
        console.error('Error fetching user photos:', err);
        let message = 'Unknown error';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        toast.error(`Error loading photos: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPhotos();
  }, [user, sortBy]);
  
  const handleDeletePhoto = async (id: string, imagePath: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      // Delete the image from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([imagePath]);
      
      if (storageError) throw storageError;
      
      // Delete the photo metadata
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;
      
      // Update the UI
      setPhotos(photos => photos.filter(photo => photo.id !== id));
      toast.success('Photo deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting photo:', err);
      let message = 'Unknown error';
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
      ) {
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Photos</h1>
            <p className="text-lg text-muted-foreground">
              Manage your uploaded photos
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Sort by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('most_liked')}>
                  Most liked
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('most_commented')}>
                  Most commented
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button asChild>
              <Link to="/upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload New</span>
              </Link>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="pt-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium mb-4">You haven't uploaded any photos yet</h2>
            <p className="text-muted-foreground mb-8">
              Get started by uploading your first photo
            </p>
            <Button asChild>
              <Link to="/upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload Photo</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
              <Card key={photo.id} className="overflow-hidden group">
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={photo.image_url} 
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardContent className="pt-4">
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
                      {photo.comments_count || 0}
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
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/edit-photo/${photo.id}`} className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </Link>
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/photo/${photo.id}`} className="flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPhotos;
