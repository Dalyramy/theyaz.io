import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function RelatedAlbums({ categoryId, currentAlbumId }: { categoryId: string, currentAlbumId: string }) {
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    if (!categoryId) return;
    supabase
      .from('albums')
      .select('id, title, cover_photo:cover_photo_id(image_url)')
      .eq('category_id', categoryId)
      .neq('id', currentAlbumId)
      .limit(4)
      .then(({ data }) => setAlbums(data || []));
  }, [categoryId, currentAlbumId]);

  if (!albums.length) return null;

  return (
    <div>
      <h3>Related Albums</h3>
      <div className="flex gap-4">
        {albums.map(album => (
          <Link key={album.id} to={`/albums/${album.id}`}>
            <img src={album.cover_photo?.image_url || '/default-cover.jpg'} alt={album.title} className="w-32 h-24 object-cover" />
            <div>{album.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
} 