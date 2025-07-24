import React, { useEffect, useState, useRef, useCallback } from 'react';
import HeroSection from './HeroSection';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PhotoWithAlbum {
  id: string;
  title: string;
  image_url: string;
  album_id: string;
  album_title: string;
  likes_count: number | null;
  comments_count: number | null;
}

const PHOTOS_PER_LOAD = 12;

const HomePage: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoWithAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);
  const page = useRef(0);

  const fetchRandomPhotos = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    // Fetch random photos with their album info
    const { data, error } = await supabase
      .from('photos')
      .select('id, title, image_url, album_id, likes_count, comments_count, albums(title)')
      .order('created_at', { ascending: false })
      .range(page.current * PHOTOS_PER_LOAD, (page.current + 1) * PHOTOS_PER_LOAD - 1);
    if (error || !data || data.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }
    // Map album title
    const mapped = data.map((p: any) => ({
      id: p.id,
      title: p.title,
      image_url: p.image_url,
      album_id: p.album_id,
      album_title: p.albums?.title || 'Unknown Album',
      likes_count: p.likes_count,
      comments_count: p.comments_count,
    }));
    setPhotos(prev => [...prev, ...mapped]);
    page.current += 1;
    setLoading(false);
    if (data.length < PHOTOS_PER_LOAD) setHasMore(false);
  }, [loading, hasMore]);

  useEffect(() => {
    fetchRandomPhotos();
    // eslint-disable-next-line
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchRandomPhotos();
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [fetchRandomPhotos, hasMore, loading]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <div className="container mx-auto px-4 pt-32 pb-8">
        <h2 className="text-3xl font-bold mb-6 text-primary/90 text-center">Discover Random Photos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          {photos.map((photo, idx) => (
            <Card key={photo.id} className="group overflow-hidden hover-lift rounded-2xl border-border w-full">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl"
                  loading="lazy"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 line-clamp-2">{photo.title}</h3>
                  <Link to={`/albums/${photo.album_id}`} className="text-xs text-primary underline hover:text-secondary transition">
                    {photo.album_title}
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">{photo.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">{photo.comments_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div ref={loader} className="w-full flex justify-center py-8">
          {loading && <span className="text-muted-foreground">Loading...</span>}
          {!hasMore && <span className="text-muted-foreground">No more photos</span>}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 