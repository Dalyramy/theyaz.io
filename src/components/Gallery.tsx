import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../integrations/supabase/client';
import type { Tables } from '../integrations/supabase/types';

// Type for Instagram embed response
interface InstagramEmbed {
  html: string;
  thumbnail_url?: string;
  title?: string;
}

// Type for our photo data - only the fields we need
interface PhotoData {
  id: string;
  title: string;
  image_url: string;
  instagram_post_id: string | null;
  likes_count: number | null;
  instagramEmbed?: InstagramEmbed;
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
      const { data, error: fetchError } = await supabase
        .from('photos')
        .select('id, title, image_url, instagram_post_id, likes_count')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching photos:', fetchError);
        setError('Failed to load photos');
        return;
      }

      console.log('Photos fetched:', data?.length || 0, 'photos');
      if (!data) {
        setPhotos([]);
        return;
      }

      // Fetch Instagram embeds for photos with instagram_post_id
      const photosWithEmbeds = await Promise.all(
        data.map(async (photo) => {
          if (photo.instagram_post_id) {
            console.log('Fetching Instagram embed for:', photo.instagram_post_id);
            try {
              // Note: Instagram oEmbed API may have CORS restrictions
              // In production, you might need a backend proxy
              const response = await axios.get(
                `https://api.instagram.com/oembed/?url=https://www.instagram.com/p/${photo.instagram_post_id}/`,
                {
                  timeout: 5000,
                  headers: {
                    'Accept': 'application/json',
                  }
                }
              );
              console.log('Instagram embed fetched successfully');
              return {
                ...photo,
                instagramEmbed: response.data
              };
            } catch (embedError) {
              console.error('Error fetching Instagram embed:', embedError);
              // Return photo without embed - will show as regular image
              return photo;
            }
          }
          return photo;
        })
      );

      console.log('Final photos with embeds:', photosWithEmbeds.length);
      setPhotos(photosWithEmbeds);
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
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
    );
  }

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-muted-foreground text-lg mb-4">No photos available</div>
          <div className="text-muted-foreground">Check back later for new content</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Gallery Header with consistent styling */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Gallery
          </h1>
          <p className="text-xl text-muted-foreground">Discover beautiful moments captured in time</p>
        </div>

        {/* Photo Grid - 1 column on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 border border-border"
            >
              {/* Photo/Embed Container */}
              <div className="aspect-square overflow-hidden bg-muted">
                {photo.instagramEmbed && photo.instagramEmbed.html ? (
                  // Instagram Embed
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: photo.instagramEmbed.html }}
                  />
                ) : (
                  // Regular Image (fallback for Instagram posts too)
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                )}
              </div>

              {/* Photo Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {photo.title}
                </h3>
                
                {/* Likes Count */}
                <div className="flex items-center text-muted-foreground">
                  <svg 
                    className="w-4 h-4 mr-1" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span className="text-sm">
                    {photo.likes_count || 0} {photo.likes_count === 1 ? 'like' : 'likes'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Refresh Button */}
        {photos.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={fetchPhotos}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Refresh Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery; 