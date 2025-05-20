import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [albumsByCategory, setAlbumsByCategory] = useState<{ [key: string]: any[] }>({});
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // @ts-ignore
    const { data: cats } = await (supabase as any).from('categories').select('*');
    setCategories(cats || []);
    if (cats) {
      const albumsMap: { [key: string]: any[] } = {};
      for (const cat of cats) {
        // @ts-ignore
        const { data: albums } = await (supabase as any)
          .from('albums')
          .select('id, title, cover_photo:cover_photo_id(image_url)')
          .eq('category_id', cat.id);
        albumsMap[cat.id] = albums || [];
      }
      setAlbumsByCategory(albumsMap);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setLoading(true);
    await (supabase as any).from('categories').delete().eq('id', categoryId);
    await fetchCategories();
    setLoading(false);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search categories..."
        className="mb-6 px-4 py-2 border border-gray-700 rounded-lg w-full max-w-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      {filteredCategories.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <div className="text-3xl mb-2">📂</div>
          <div className="text-lg">No categories found.</div>
        </div>
      ) : (
        filteredCategories.map(cat => (
          <div key={cat.id} className="mb-10 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">{cat.name}</h2>
                <p className="text-gray-400 mb-2 text-sm">{cat.description}</p>
              </div>
              {isAdmin && (
                <button
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition text-xs shadow"
                  onClick={() => handleDelete(cat.id)}
                  disabled={loading}
                >Delete</button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {(albumsByCategory[cat.id] || []).length === 0 ? (
                <div className="text-gray-500 italic p-4">No albums in this category.</div>
              ) : (
                (albumsByCategory[cat.id] || []).map(album => (
                  <Link key={album.id} to={`/albums/${album.id}`} className="block w-32">
                    <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition border border-white/10 bg-white/10">
                      <img src={album.cover_photo?.image_url || '/default-cover.jpg'} alt={album.title} className="w-32 h-24 object-cover" />
                      <div className="p-2 text-center text-sm font-medium text-white/90 truncate" title={album.title}>{album.title}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
} 