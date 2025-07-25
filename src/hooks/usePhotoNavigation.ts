import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Photo {
  id: string;
  title: string;
  image_url: string;
  profiles: {
    username: string;
    avatar_url: string;
    full_name?: string;
  };
}

interface PhotoCache {
  [key: string]: {
    prev: Photo | null;
    next: Photo | null;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function usePhotoNavigation(currentPhotoId: string) {
  const [previousPhoto, setPreviousPhoto] = useState<Photo | null>(null);
  const [nextPhoto, setNextPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const photoCache = useRef<PhotoCache>({});
  const prefetchController = useRef<AbortController | null>(null);

  const clearOldCache = useCallback(() => {
    const now = Date.now();
    Object.keys(photoCache.current).forEach(key => {
      if (now - photoCache.current[key].timestamp > CACHE_DURATION) {
        delete photoCache.current[key];
      }
    });
  }, []);

  const prefetchPhoto = useCallback(async (photo: Photo | null) => {
    if (!photo) return;
    
    // Cancel any existing prefetch
    if (prefetchController.current) {
      prefetchController.current.abort();
    }

    prefetchController.current = new AbortController();

    try {
      const img = new Image();
      img.src = photo.image_url;
      await img.decode();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      console.error('Error prefetching image:', error);
    }
  }, []);

  const fetchAdjacentPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      clearOldCache();

      // Check cache first
      if (photoCache.current[currentPhotoId]) {
        const cached = photoCache.current[currentPhotoId];
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          setPreviousPhoto(cached.prev);
          setNextPhoto(cached.next);
          // Prefetch images even when using cache
          prefetchPhoto(cached.prev);
          prefetchPhoto(cached.next);
          setIsLoading(false);
          return;
        }
      }

      // Fetch the current photo's created_at timestamp
      const { data: currentPhoto } = await supabase
        .from('photos')
        .select('created_at')
        .eq('id', currentPhotoId)
        .single();

      if (!currentPhoto) return;

      // Fetch previous and next photos based on created_at timestamp
      const [prevResult, nextResult] = await Promise.all([
        supabase
          .from('photos')
          .select(`
            id, 
            title, 
            image_url,
            profile:profiles(
              username,
              avatar_url,
              full_name
            )
          `)
          .lt('created_at', currentPhoto.created_at)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('photos')
          .select(`
            id, 
            title, 
            image_url,
            profile:profiles(
              username,
              avatar_url,
              full_name
            )
          `)
          .gt('created_at', currentPhoto.created_at)
          .order('created_at', { ascending: true })
          .limit(1)
          .single()
      ]);

      const prevPhoto = prevResult.error ? null : {
        ...prevResult.data,
        profiles: prevResult.data?.profile || {
          username: 'unknown',
          avatar_url: '',
          full_name: 'Unknown User'
        }
      };
      
      const nextPhoto = nextResult.error ? null : {
        ...nextResult.data,
        profiles: nextResult.data?.profile || {
          username: 'unknown',
          avatar_url: '',
          full_name: 'Unknown User'
        }
      };

      // Update cache
      photoCache.current[currentPhotoId] = {
        prev: prevPhoto,
        next: nextPhoto,
        timestamp: Date.now()
      };

      setPreviousPhoto(prevPhoto);
      setNextPhoto(nextPhoto);

      // Prefetch images
      prefetchPhoto(prevPhoto);
      prefetchPhoto(nextPhoto);
    } catch (error) {
      console.error('Error fetching adjacent photos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPhotoId, clearOldCache, prefetchPhoto]);

  useEffect(() => {
    fetchAdjacentPhotos();

    return () => {
      if (prefetchController.current) {
        prefetchController.current.abort();
      }
    };
  }, [fetchAdjacentPhotos]);

  const navigateToPhoto = useCallback((photoId: string) => {
    navigate(`/photo/${photoId}`, { replace: true });
  }, [navigate]);

  const handleKeyNavigation = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && previousPhoto) {
      navigateToPhoto(previousPhoto.id);
    } else if (e.key === 'ArrowRight' && nextPhoto) {
      navigateToPhoto(nextPhoto.id);
    }
  }, [previousPhoto, nextPhoto, navigateToPhoto]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  return {
    previousPhoto,
    nextPhoto,
    isLoading,
    navigateToPhoto
  };
} 