import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PhotoDetail from '@/components/PhotoDetail';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

// Define the expected photo type
interface Photo {
  id: string;
  title: string;
  caption: string;
  tags: string[];
  image_url: string;
  created_at: string;
  user_id: string;
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
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Photo not found');
        
        // Transform the data to match the expected format
        const transformedData = {
          ...data,
          profiles: data.profile
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
        <div className="mb-6">
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
        </div>
        <PhotoDetail photo={photo} />
      </main>
    </div>
  );
};

export default PhotoView;
