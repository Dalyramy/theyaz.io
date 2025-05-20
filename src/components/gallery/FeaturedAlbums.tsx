import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function FeaturedAlbums() {
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('albums')
      .select('*, cover_photo:cover_photo_id(image_url)')
      .eq('is_featured', true)
      .then(({ data }) => setAlbums(data || []));
  }, []);

  return (
    <div>
      <h2>Featured Albums</h2>
      <div className="flex flex-wrap gap-4">
        {albums.map(album => (
          <Link key={album.id} to={`/albums/${album.id}`}>
            <img src={album.cover_photo?.image_url || '/default-cover.jpg'} alt={album.title} className="w-48 h-32 object-cover" />
            <div>{album.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
} 