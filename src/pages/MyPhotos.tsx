
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Edit, Trash2, Upload, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MyPhotos = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserPhotos = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setPhotos(data || []);
      } catch (err: any) {
        console.error('Error fetching user photos:', err);
        toast.error(`Error loading photos: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPhotos();
  }, [user]);
  
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
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      toast.error(`Error deleting photo: ${err.message}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Photos</h1>
            <p className="text-lg text-muted-foreground">
              Manage your uploaded photos
            </p>
          </div>
          
          <Button asChild>
            <Link to="/upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload New</span>
            </Link>
          </Button>
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
              <Card key={photo.id} className="overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={photo.image_url} 
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="text-xl font-medium mb-1">{photo.title}</h3>
                  <p className="text-muted-foreground line-clamp-2">{photo.caption}</p>
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
