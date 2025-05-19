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

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg aspect-[4/5] w-full h-40" />
      ))}
    </div>
  );
  if (!photos.length) return (
    <div className="flex flex-col items-center justify-center py-12">
      <img src="/icons/empty-gallery.svg" alt="No photos" className="w-32 h-32 mb-4 opacity-60" />
      <p className="text-lg text-gray-500 mb-2">No photos yet.</p>
      <a href="/upload" className="px-4 py-2 bg-primary text-white rounded-full mt-2">Upload your first photo</a>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map(photo => (
        <div key={photo.id} className="flex flex-col items-center">
          <img
            src={photo.image_url}
            alt={photo.title}
            className="rounded-lg object-cover aspect-[4/5] w-full"
          />
          <div className="mt-2 w-full text-center">
            <div className="font-semibold text-sm truncate">{photo.title}</div>
            {photo.caption && <div className="text-xs text-gray-500 truncate">{photo.caption}</div>}
            <div className="text-[10px] text-gray-400 mt-1">{new Date(photo.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePhotos; 