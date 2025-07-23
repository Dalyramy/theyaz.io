import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function EnhancedGallery() {
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('albums')
      .select('*, cover_photo:cover_photo_id(image_url)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setAlbums(data || []));
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center">Albums</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {albums.map(album => (
          <Link key={album.id} to={`/albums/${album.id}`} className="block w-64">
            <picture>
              <source srcSet={(album.cover_photo?.image_url || '/default-cover.jpg').replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp" />
              <img src={album.cover_photo?.image_url || '/default-cover.jpg'} alt={album.title} className="w-64 h-48 object-cover rounded-lg shadow-lg border border-white/10" loading="lazy" />
            </picture>
            <div className="p-2 text-center text-lg font-semibold text-white/90 truncate" title={album.title}>{album.title}</div>
          </Link>
        ))}
        {albums.length === 0 && (
          <div className="text-gray-400 italic text-center w-full py-12">No albums found.</div>
        )}
      </div>
    </div>
  );
} 