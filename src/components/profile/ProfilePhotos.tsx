import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Photo = Database['public']['Tables']['photos']['Row'];

const ProfilePhotos = ({ userId }: { userId: string }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) setPhotos(data);
      setLoading(false);
    }
    fetchPhotos();
  }, [userId]);

  if (loading) return <div>Loading photos...</div>;
  if (!photos.length) return <div>No photos yet.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map(photo => (
        <img
          key={photo.id}
          src={photo.image_url}
          alt={photo.title}
          className="rounded-lg object-cover aspect-[4/5] w-full"
        />
      ))}
    </div>
  );
};

export default ProfilePhotos; 