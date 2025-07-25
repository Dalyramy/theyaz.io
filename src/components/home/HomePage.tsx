import React, { useEffect, useState, useRef, useCallback } from 'react';
import HeroSection from './HeroSection';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageSquare, Loader2 } from 'lucide-react';
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loader = useRef<HTMLDivElement | null>(null);
  const page = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  const fetchPhotos = useCallback(async (isInitial = false) => {
    if (loading || (!isInitial && !hasMore)) return;

    // Cancel previous request if it exists
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller
    abortController.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          id, 
          title, 
          image_url, 
          album_id, 
          likes_count, 
          comments_count, 
          albums(title)
        `)
        .order('created_at', { ascending: false })
        .range(page.current * PHOTOS_PER_LOAD, (page.current + 1) * PHOTOS_PER_LOAD - 1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      const mappedPhotos = data.map((photo: any) => ({
        id: photo.id,
        title: photo.title,
        image_url: photo.image_url,
        album_id: photo.album_id,
        album_title: photo.albums?.title || 'Unknown Album',
        likes_count: photo.likes_count,
        comments_count: photo.comments_count,
      }));

      if (isInitial) {
        setPhotos(mappedPhotos);
        page.current = 1;
      } else {
        setPhotos(prev => [...prev, ...mappedPhotos]);
        page.current += 1;
      }

      if (data.length < PHOTOS_PER_LOAD) {
        setHasMore(false);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Error fetching photos:', err);
      setError('Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [loading, hasMore]);

  // Initial load
  useEffect(() => {
    fetchPhotos(true);
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading || initialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPhotos(false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [fetchPhotos, hasMore, loading, initialLoading]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
    target.onerror = null; // Prevent infinite loop
  };

  const PhotoCard: React.FC<{ photo: PhotoWithAlbum; index: number }> = React.memo(({ photo, index }) => (
    <Card className="group overflow-hidden hover-lift rounded-2xl border-border w-full bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2">
            {photo.title}
          </h3>
          <Link 
            to={`/albums/${photo.album_id}`} 
            className="text-xs text-primary hover:text-secondary transition-colors duration-200 underline decoration-dotted"
          >
            {photo.album_title}
          </Link>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">{photo.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">{photo.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Peace Sign Background Watermark */}
        <div 
          className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
          style={{
            width: '300px',
            height: '300px',
            backgroundImage: 'url(/icons/peace-watermark.svg)',
            backgroundSize: 'contain',
            backgroundPosition: 'bottom left',
            backgroundRepeat: 'no-repeat',
            transform: 'rotate(-10deg)',
          }}
        />
        <div className="fixed inset-0 pointer-events-none z-0">
          <img
            src="/icons/yazio.svg"
            alt="Yazio Background"
            className="w-full h-full object-cover opacity-2"
          />
        </div>
        <div className="relative z-10">
          <HeroSection />
          <div className="container mx-auto px-4 pt-32 pb-8">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && photos.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Peace Sign Background Watermark */}
        <div 
          className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
          style={{
            width: '300px',
            height: '300px',
            backgroundImage: 'url(/icons/peace-watermark.svg)',
            backgroundSize: 'contain',
            backgroundPosition: 'bottom left',
            backgroundRepeat: 'no-repeat',
            transform: 'rotate(-10deg)',
          }}
        />
        <div className="fixed inset-0 pointer-events-none z-0">
          <img
            src="/icons/yazio.svg"
            alt="Yazio Background"
            className="w-full h-full object-cover opacity-2"
          />
        </div>
        <div className="relative z-10">
          <HeroSection />
          <div className="container mx-auto px-4 pt-32 pb-8">
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  page.current = 0;
                  setHasMore(true);
                  fetchPhotos(true);
                }}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Peace Sign Background Watermark */}
      <div 
        className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
        style={{
          width: '300px',
          height: '300px',
          backgroundImage: 'url(/icons/peace-watermark.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(-10deg)',
        }}
      />
      
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src="/icons/yazio.svg"
          alt="Yazio Background"
          className="w-full h-full object-cover opacity-2"
        />
      </div>
      
      {/* Content with higher z-index */}
      <div className="relative z-10">
        <HeroSection />
        <div className="container mx-auto px-4 pt-32 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-primary/90">Discover Random Photos</h2>
            <p className="text-muted-foreground">Explore our curated collection of moments</p>
          </div>
          
          {photos.length === 0 && !loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No photos available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
              {photos.map((photo, index) => (
                <PhotoCard key={photo.id} photo={photo} index={index} />
              ))}
            </div>
          )}
          
          {/* Loading indicator */}
          <div ref={loader} className="w-full flex justify-center py-8">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more photos...</span>
              </div>
            )}
            {!hasMore && photos.length > 0 && (
              <span className="text-muted-foreground">No more photos to load</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 