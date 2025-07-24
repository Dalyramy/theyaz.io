import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';

interface PhotoData {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  likes_count: number | null;
  comments_count: number | null;
}

interface AlbumData {
  id: string;
  title: string;
  photos: PhotoData[];
}

const Gallery: React.FC = () => {
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbumsAndPhotos();
  }, []);

  const fetchAlbumsAndPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all albums
      const { data: albumsData, error: albumsError } = await supabase
        .from('albums')
        .select('id, title')
        .order('title', { ascending: true });
      if (albumsError) throw albumsError;
      if (!albumsData || albumsData.length === 0) {
        setAlbums([]);
        setLoading(false);
        return;
      }
      // For each album, fetch its photos
      const albumsWithPhotos: AlbumData[] = [];
      for (const album of albumsData) {
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('id, title, caption, image_url, likes_count, comments_count')
          .eq('album_id', album.id)
          .order('created_at', { ascending: false });
        if (photosError) {
          albumsWithPhotos.push({ ...album, photos: [] });
        } else {
          albumsWithPhotos.push({ ...album, photos: photosData || [] });
        }
      }
      setAlbums(albumsWithPhotos);
    } catch (err) {
      setError('Failed to load albums/photos');
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-4">{error}</div>
            <button
              onClick={fetchAlbumsAndPhotos}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-4">No albums available</div>
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
            Explore albums and curated collections
          </p>
        </motion.div>
        {albums.map((album, idx) => (
          <div key={album.id} className="mb-16">
            <h2 className="text-3xl font-bold mb-4 text-primary/90">{album.title}</h2>
            {album.photos.length === 0 ? (
              <div className="text-muted-foreground mb-8">No photos in this album yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full mb-4">
                {album.photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden hover-lift rounded-2xl border-border w-full">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={photo.image_url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <CardContent className="p-4 sm:p-6">
                        <div className="mb-4">
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2">
                            {photo.title}
                          </h3>
                          {photo.caption && (
                            <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-3">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground mt-2">
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
                          <Button variant="ghost" size="sm" className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 