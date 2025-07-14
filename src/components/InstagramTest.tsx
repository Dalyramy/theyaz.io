import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Instagram, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestPhoto {
  id: string;
  title: string;
  image_url: string;
  instagram_post_id: string | null;
  likes_count: number;
  comments_count: number;
}

const InstagramTest = () => {
  const [testPhotos, setTestPhotos] = useState<TestPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestPhotos();
  }, []);

  const fetchTestPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('photos')
        .select('id, title, image_url, instagram_post_id, likes_count, comments_count')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setTestPhotos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  const createTestPhoto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('photos')
        .insert({
          title: 'Instagram Test Photo',
          image_url: 'https://www.instagram.com/p/C7QwQk1J8kA/media/?size=l',
          image_path: '/photos/instagram_C7QwQk1J8kA.jpg',
          user_id: user.id,
          instagram_post_id: 'C7QwQk1J8kA',
          caption: 'A beautiful Instagram post showcasing amazing photography.',
          tags: ['instagram', 'social', 'photography']
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchTestPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test photo');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading test photos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={createTestPhoto} className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Create Test Photo
            </Button>
            <Button variant="outline" onClick={fetchTestPhotos}>
              Refresh
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Test Photos ({testPhotos.length})</h3>
            {testPhotos.length === 0 ? (
              <p className="text-muted-foreground">No test photos found. Create one to test Instagram integration.</p>
            ) : (
              <div className="space-y-3">
                {testPhotos.map((photo) => (
                  <div key={photo.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {photo.instagram_post_id ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{photo.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>ID: {photo.id.slice(0, 8)}...</span>
                          {photo.instagram_post_id && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Instagram className="h-3 w-3" />
                              {photo.instagram_post_id}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>❤️ {photo.likes_count || 0}</div>
                      <div>💬 {photo.comments_count || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramTest; 