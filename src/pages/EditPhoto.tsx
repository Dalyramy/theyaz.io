import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const EditPhoto = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!id || !user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        if (!data) {
          toast.error('Photo not found or you do not have permission to edit it');
          navigate('/my-photos');
          return;
        }
        
        setTitle(data.title);
        setCaption(data.caption || '');
        setTags(data.tags ? data.tags.join(', ') : '');
        setImageUrl(data.image_url);
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
        toast.error(`Error loading photo: ${message}`);
        navigate('/my-photos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhoto();
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!title || !caption) {
      toast.error('Please fill all required fields.');
      setIsSaving(false);
      return;
    }
    
    try {
      // Process tags
      const tagArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      // Update photo in the database
      const { error } = await supabase
        .from('photos')
        .update({
          title,
          caption,
          tags: tagArray,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast.success('Photo updated successfully!');
      navigate(`/photo/${id}`);
    } catch (error: unknown) {
      console.error('Error updating photo:', error);
      let message = 'Unknown error';
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        message = (error as { message: string }).message;
      }
      toast.error(`Failed to update photo: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8">
          <div className="w-full max-w-2xl mx-auto">
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate('/my-photos')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Photos
        </Button>
        
        <Card className="w-full max-w-2xl mx-auto bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Photo</CardTitle>
            <CardDescription>Update your photo's details</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="w-full aspect-video overflow-hidden rounded-md bg-muted">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter photo title"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell a story about this photo"
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="nature, landscape, travel"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default EditPhoto;
