import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';

// Type for our photo data
interface PhotoData {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  likes_count: number | null;
  comments_count: number | null;
  album_name?: string | null;
}

const Gallery: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch photos from Supabase
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching photos from Supabase...');
      
      // Fetch photos first
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select(`
          id,
          title,
          caption,
          image_url,
          likes_count,
          comments_count,
          album_id
        `)
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Error fetching photos:', photosError);
        setError('Failed to load photos');
        return;
      }

      // Fetch albums separately
      const { data: albumsData, error: albumsError } = await supabase
        .from('albums')
        .select('id, title');

      if (albumsError) {
        console.error('Error fetching albums:', albumsError);
        setError('Failed to load albums');
        return;
      }

      // Create a map of album titles
      const albumMap = new Map(albumsData?.map(album => [album.id, album.title]) || []);

      console.log('Photos fetched:', photosData?.length || 0, 'photos');
      if (!photosData) {
        setPhotos([]);
        return;
      }

      // Transform the data to match our Photo type
      const transformedPhotos = photosData.map(photo => ({
        id: photo.id,
        title: photo.title,
        caption: photo.caption,
        image_url: photo.image_url,
        likes_count: photo.likes_count,
        comments_count: photo.comments_count,
        album_name: photo.album_id ? albumMap.get(photo.album_id) || null : null
      }));

      console.log('Final photos:', transformedPhotos.length);
      setPhotos(transformedPhotos);
    } catch (err) {
      console.error('Error in fetchPhotos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for likes_count updates
  useEffect(() => {
    fetchPhotos();

    // Subscribe to changes in the photos table
    const subscription = supabase
      .channel('photos_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'photos'
        },
        (payload) => {
          setPhotos(prevPhotos => 
            prevPhotos.map(photo => 
              photo.id === payload.new.id 
                ? { ...photo, likes_count: payload.new.likes_count }
                : photo
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Loading state with consistent styling
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted aspect-square rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-4">{error}</div>
            <button
              onClick={fetchPhotos}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-4">No photos available</div>
            <div className="text-muted-foreground">Check back later for new content</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Gallery Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4">
            <Eye className="w-3 h-3 mr-1" />
            Photo Gallery
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Discover Beautiful Moments
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Explore a curated collection of stunning photographs captured in time
          </p>
        </motion.div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden hover-lift rounded-2xl border-border">
                {/* Photo Container */}
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>

                {/* Photo Info */}
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                      {photo.title}
                    </h3>
                    {photo.caption && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {photo.caption}
                      </p>
                    )}
                    {photo.album_name && (
                      <Badge variant="outline" className="text-xs">
                        {photo.album_name}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Social Stats */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {photo.likes_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {photo.comments_count || 0}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Refresh Button */}
        {photos.length > 0 && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              onClick={fetchPhotos}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Refresh Gallery
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery; 