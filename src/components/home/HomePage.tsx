import React, { useEffect, useState, useRef, useCallback } from 'react';
import HeroSection from './HeroSection';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FolderOpen } from 'lucide-react';
import HomePagePhotoCard from '@/components/photo/HomePagePhotoCard';
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
      // Fetch photos without embeds to avoid PGRST201 error
      const { data: photosData, error } = await supabase
        .from('photos')
        .select(`
          id, 
          title, 
          image_url, 
          album_id, 
          likes_count, 
          comments_count
        `)
        .order('created_at', { ascending: false })
        .range(page.current * PHOTOS_PER_LOAD, (page.current + 1) * PHOTOS_PER_LOAD - 1);

      if (error) {
        throw error;
      }

      if (!photosData || photosData.length === 0) {
        setHasMore(false);
        return;
      }

      // Get album titles for photos that have album_id
      const albumIds = [...new Set(photosData?.filter(p => p.album_id).map(p => p.album_id) || [])];
      const albumTitles: Record<string, string> = {};
      
      if (albumIds.length > 0) {
        const { data: albumsData } = await supabase
          .from('albums')
          .select('id, title')
          .in('id', albumIds);
        
        if (albumsData) {
          albumsData.forEach(album => {
            albumTitles[album.id] = album.title;
          });
        }
      }
      
      const mappedPhotos = photosData?.map((photo: any) => ({
        id: photo.id,
        title: photo.title,
        image_url: photo.image_url,
        album_id: photo.album_id,
        album_title: photo.album_id ? (albumTitles[photo.album_id] || 'Unknown Album') : 'No Album',
        likes_count: photo.likes_count,
        comments_count: photo.comments_count,
      })) || [];

      if (isInitial) {
        setPhotos(mappedPhotos);
        page.current = 1;
      } else {
        setPhotos(prev => [...prev, ...mappedPhotos]);
        page.current += 1;
      }

      if (photosData.length < PHOTOS_PER_LOAD) {
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
  }, []); // Remove loading and hasMore from dependencies

  // Initial load
  useEffect(() => {
    fetchPhotos(true);
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchPhotos]);

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
  }, [hasMore, loading, initialLoading]); // Remove fetchPhotos from dependencies



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
            <p className="text-muted-foreground mb-4">Explore our curated collection of moments</p>
            <Link 
              to="/gallery"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors hover-lift"
            >
              <FolderOpen className="w-4 h-4" />
              View All Albums
            </Link>
          </div>
          
          {photos.length === 0 && !loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No photos available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
              {photos.map((photo, index) => (
                <HomePagePhotoCard key={photo.id} photo={photo} index={index} />
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