import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { FixedSizeGrid as Grid } from 'react-window';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/home/FooterSection';
import Logo from '@/components/ui/Logo';

function EditAlbumModal({ album, open, onClose, onSave }: { album: any, open: boolean, onClose: () => void, onSave: (data: { title: string, description: string, tags: string[] }) => void }) {
  const [title, setTitle] = useState(album?.title || '');
  const [description, setDescription] = useState(album?.description || '');
  const [tags, setTags] = useState<string>(album?.tags?.join(', ') || '');
  useEffect(() => {
    setTitle(album?.title || '');
    setDescription(album?.description || '');
    setTags(album?.tags?.join(', ') || '');
  }, [album]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Album</h2>
        <input className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <textarea className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <input className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" />
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded bg-gray-700 text-white" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => onSave({ title, description, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })}>Save</button>
        </div>
      </div>
    </div>
  );
}

function TagChip({ tag, active, onClick }: { tag: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      className={`px-2 py-1 rounded-full text-xs font-medium mr-2 mb-2 border ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-indigo-700 hover:text-white'} transition`}
      onClick={onClick}
      type="button"
    >
      {tag}
    </button>
  );
}

export default function GalleryPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ALBUMS_PER_PAGE = 24;
  const [editAlbum, setEditAlbum] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string>('');
  const gridRef = useRef<any>(null);

  const columnCount =
    window.innerWidth >= 1024 ? 4 :
    window.innerWidth >= 768 ? 3 :
    window.innerWidth >= 640 ? 2 : 1;
  const rowCount = Math.ceil(albums.length / columnCount);
  const gridWidth = Math.min(window.innerWidth - 32, 1280);
  const gridHeight = Math.min(800, rowCount * 340);
  const cellWidth = gridWidth / columnCount;
  const cellHeight = 340;

  useEffect(() => {
    setLoading(true);
    setAlbums([]);
    setPage(0);
    setHasMore(true);
    fetchAlbums(0, true);
    // eslint-disable-next-line
  }, [search, activeTag]);

  const fetchAlbums = async (pageNum = 0, replace = false) => {
    let query = (supabase as any)
      .from('albums')
      .select('id, title, tags, cover_photo_id, cover_photo:cover_photo_id(image_url,thumbnail_url)');
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (activeTag) {
      query = query.contains('tags', [activeTag]);
    }
    const from = pageNum * ALBUMS_PER_PAGE;
    const to = from + ALBUMS_PER_PAGE - 1;
    query = query.range(from, to);
    const { data } = await query;
    if (replace) {
      setAlbums(data || []);
    } else {
      setAlbums(prev => [...prev, ...(data || [])]);
    }
    setHasMore((data?.length || 0) === ALBUMS_PER_PAGE);
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchAlbums(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleDelete = async (albumId: string) => {
    if (!window.confirm('Are you sure you want to delete this album?')) return;
    setLoading(true);
    await (supabase as any).from('albums').delete().eq('id', albumId);
    const { data } = await (supabase as any)
      .from('albums')
      .select('*, cover_photo:cover_photo_id(image_url)');
    setAlbums(data || []);
    setLoading(false);
  };

  const handleEdit = (album: any) => {
    setEditAlbum(album);
    setEditOpen(true);
  };

  const handleSaveEdit = async (data: { title: string, description: string, tags: string[] }) => {
    setLoading(true);
    await (supabase as any).from('albums').update(data).eq('id', editAlbum.id);
    const { data: updated } = await (supabase as any)
      .from('albums')
      .select('*, cover_photo:cover_photo_id(image_url)');
    setAlbums(updated || []);
    setEditOpen(false);
    setEditAlbum(null);
    setLoading(false);
  };

  // Collect all unique tags
  const allTags = useMemo(() => Array.from(new Set(albums.flatMap((a: any) => a.tags || []))).sort(), [albums]);

  const filteredAlbums = useMemo(() => albums.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || (album.tags || []).includes(activeTag);
    return matchesSearch && matchesTag;
  }), [albums, search, activeTag]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Watermark Logo - background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none flex items-center justify-center">
        <Logo 
          width="100vw" 
          height="100vh" 
          className="opacity-10 blur-sm"
          style={{ maxWidth: '100vw', maxHeight: '100vh' }}
        />
      </div>
      <Navbar />
      <main className="container mx-auto px-6 py-20 flex-1 bg-background rounded-t-3xl shadow-lg -mt-8 relative z-10 container-type-inline container-query">
        <h1 className="text-3xl font-bold mb-8 text-center">Gallery Albums</h1>
        <EditAlbumModal album={editAlbum} open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSaveEdit} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search albums..."
          className="mb-8 px-4 py-3 border border-gray-700 rounded-xl w-full max-w-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mx-auto block shadow-sm relative z-10"
        />
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2 justify-center">
            <TagChip tag="All" active={!activeTag} onClick={() => setActiveTag('')} />
            {allTags.map(tag => (
              <TagChip key={tag} tag={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)} />
            ))}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center text-gray-400 py-32">
            <div className="text-5xl mb-4">😕</div>
            <div className="text-xl font-medium">No albums found.</div>
          </div>
        ) : (
          <>
            <Grid
              ref={gridRef}
              columnCount={columnCount}
              rowCount={rowCount}
              columnWidth={cellWidth}
              rowHeight={cellHeight}
              width={gridWidth}
              height={gridHeight}
              itemData={{
                albums: filteredAlbums,
                isAdmin,
                loading,
                handleEdit,
                handleDelete,
              }}
            >
              {({ columnIndex, rowIndex, style, data }) => {
                const idx = rowIndex * columnCount + columnIndex;
                if (idx >= data.albums.length) return null;
                const album = data.albums[idx];
                return (
                  <div style={style} key={album.id} className="p-2">
                    <div className="rounded-xl shadow bg-gray-900 border border-gray-800 p-0 flex flex-col items-center relative group transition-transform hover:-translate-y-1 hover:shadow-2xl">
                      <Link to={`/albums/${album.id}`} className="block w-full">
                        <img src={album.cover_photo?.thumbnail_url || album.cover_photo?.image_url || '/default-cover.jpg'} alt={album.title} loading="lazy" className="w-full h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform" />
                        <div className="text-base font-medium text-white text-center py-3 truncate px-2" title={album.title}>{album.title}</div>
                        <div className="flex flex-wrap justify-center px-2 pb-2">
                          {(album.tags || []).map((tag: string) => (
                            <TagChip key={tag} tag={tag} />
                          ))}
                        </div>
                      </Link>
                      {data.isAdmin && (
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button
                            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition text-xs shadow"
                            onClick={() => data.handleEdit(album)}
                            disabled={data.loading}
                          >Edit</button>
                          <button
                            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition text-xs shadow"
                            onClick={() => data.handleDelete(album.id)}
                            disabled={data.loading}
                          >Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            </Grid>
            {hasMore && (
              <div className="w-full flex justify-center mt-6">
                <button
                  className="px-6 py-2 rounded bg-gray-800 text-white hover:bg-indigo-600 transition disabled:opacity-50"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></span> Loading...</span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <FooterSection />
    </div>
  );
} 