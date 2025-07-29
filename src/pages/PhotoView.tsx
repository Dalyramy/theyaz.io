import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PhotoDetail from '@/components/PhotoDetail';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Define the expected photo type
interface Photo {
  id: string;
  title: string;
  caption: string;
  tags: string[];
  image_url: string;
  created_at: string;
  user_id: string;
  album_id?: string;
  album_title?: string;
  profiles: {
    username: string;
    avatar_url: string;
    full_name?: string;
  };
  // Add other fields as needed
}

const PhotoView = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPhoto = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Fetch photo data without embeds to avoid PGRST201 error
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .select('*')
          .eq('id', id)
          .single();
        
        if (photoError) throw photoError;
        if (!photoData) throw new Error('Photo not found');
        
        // Fetch user profile separately
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name')
          .eq('id', photoData.user_id)
          .single();
        
        // Fetch album title separately
        let albumTitle = 'Unknown Album';
        if (photoData.album_id) {
          const { data: albumData, error: albumError } = await supabase
            .from('albums')
            .select('title')
            .eq('id', photoData.album_id)
            .single();
          
          if (!albumError && albumData) {
            albumTitle = albumData.title;
          }
        }
        
        const data = {
          ...photoData,
          profiles: profileData || {
            username: 'user',
            avatar_url: '',
            full_name: 'User'
          },
          album_title: albumTitle
        };
        
        if (error) throw error;
        if (!data) throw new Error('Photo not found');
        
        // Transform the data to match the expected format
        const transformedData = {
          ...data,
          profiles: data.profiles || {
            username: 'user',
            avatar_url: '',
            full_name: 'User'
          },
          album_title: data.albums?.title || 'Unknown Album'
        };
        
        setPhoto(transformedData);
      } catch (err: unknown) {
        console.error('Error fetching photo:', err);
        let message = 'Unknown error';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhoto();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24">
        <Navbar />
        <div className="container py-8">
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Gallery
              </Link>
            </Button>
          </div>
          <div className="w-full">
            <div className="relative aspect-video md:aspect-[16/9] lg:aspect-[16/10] overflow-hidden bg-muted rounded-xl">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
            <div className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/4 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !photo) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24">
        <Navbar />
        <div className="container py-20 text-center prose dark:prose-invert">
          <h1 className="text-3xl font-bold mb-4">Photo Not Found</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {error || "The photo you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild variant="default">
            <Link to="/">Return to Gallery</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <Navbar />
      <main className="container py-8 container-type-inline container-query">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            asChild
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Link>
          </Button>
          
          {photo.album_id && (
            <Link 
              to="/gallery" 
              state={{ selectedAlbumId: photo.album_id }}
              className="inline-flex items-center gap-2"
            >
              <Badge variant="secondary" className="hover:bg-secondary transition-colors">
                <FolderOpen className="w-3 h-3 mr-1" />
                View in {photo.album_title}
              </Badge>
            </Link>
          )}
        </div>
        <PhotoDetail photo={photo} />
      </main>
    </div>
  );
};

export default PhotoView;
