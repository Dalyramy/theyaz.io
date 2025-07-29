import React, { useState, useEffect } from 'react';
import FlickrStyleGallery from '../FlickrStyleGallery';
import { supabase } from '@/integrations/supabase/client';

interface CompactGalleryProps {
  className?: string;
  limit?: number;
}

interface Photo {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  tags: string[];
  profiles: {
    username: string;
    avatar_url: string;
    full_name?: string;
  };
  created_at: string;
  likes_count?: number;
  comments_count?: number;
}

const CompactGallery: React.FC<CompactGalleryProps> = ({ 
  className = "", 
  limit = 6 
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select(`
            id,
            title,
            image_url,
            caption,
            tags,
            created_at,
            likes_count,
            comments_count,
            profiles:user_id (
              username,
              avatar_url,
              full_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setPhotos(data || []);
      } catch (err) {
        console.error('Error fetching photos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [limit]);

  return (
    <div className={`mobile-optimized ${className}`}>
      <FlickrStyleGallery photos={photos} loading={loading} />
    </div>
  );
};

export default CompactGallery; 