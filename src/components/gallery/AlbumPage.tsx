import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/useAuth';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function EditPhotoModal({ photo, open, onClose, onSave }: { photo: any, open: boolean, onClose: () => void, onSave: (data: { title: string, caption: string, tags: string[] }) => void }) {
  const [title, setTitle] = useState(photo?.title || '');
  const [caption, setCaption] = useState(photo?.caption || '');
  const [tags, setTags] = useState<string>(photo?.tags?.join(', ') || '');
  useEffect(() => {
    setTitle(photo?.title || '');
    setCaption(photo?.caption || '');
    setTags(photo?.tags?.join(', ') || '');
  }, [photo]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Photo</h2>
        <input className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <textarea className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption" />
        <input className="w-full mb-3 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)" />
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded bg-gray-700 text-white" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => onSave({ title, caption, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })}>Save</button>
        </div>
      </div>
    </div>
  );
}

function TagChip({ tag }: { tag: string }) {
  return <span className="px-2 py-1 rounded-full text-xs font-medium mr-2 mb-2 border bg-gray-800 text-gray-200 border-gray-700">{tag}</span>;
}

function SortablePhoto({ photo, isAdmin, isCover, loading, onSetCover, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
      className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-900 border border-gray-800 group transition-transform hover:-translate-y-1 hover:shadow-2xl"
      {...attributes}
      {...listeners}
    >
      <a
        href={photo.src}
        data-pswp-width={photo.width}
        data-pswp-height={photo.height}
        data-pswp-title={photo.title}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          style={{ width: 200, height: 150, objectFit: 'cover', cursor: 'pointer' }}
          className="hover:shadow-lg transition"
        />
      </a>
      {isAdmin && (
        <>
          <button
            disabled={isCover || loading}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: isCover ? '#4ade80' : '#fff',
              color: isCover ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '2px 8px',
              cursor: isCover ? 'default' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
            onClick={onSetCover}
          >
            {isCover ? 'Cover' : 'Set as Cover'}
          </button>
          <button
            className="absolute bottom-2 right-2 px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-xs transition shadow"
            onClick={onEdit}
            disabled={loading}
          >Edit</button>
          <button
            className="absolute bottom-2 right-16 px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs transition shadow"
            onClick={onDelete}
            disabled={loading}
          >Delete</button>
        </>
      )}
      <div className="flex flex-wrap justify-center px-2 pb-2">
        {(photo.tags || []).map((tag: string) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </div>
    </div>
  );
}

export default function AlbumPage() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PHOTOS_PER_PAGE = 24;
  const galleryRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();
  const [editPhoto, setEditPhoto] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchAlbum();
    setPhotos([]);
    setPage(0);
    setHasMore(true);
    fetchPhotos(0, true);
    // eslint-disable-next-line
  }, [albumId]);

  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | undefined;
    if (galleryRef.current) {
      lightbox = new PhotoSwipeLightbox({
        gallery: '#' + galleryRef.current.id,
        children: 'a',
        pswpModule: () => import('photoswipe'),
      });
      lightbox.init();
    }
    return () => lightbox?.destroy();
  }, [photos]);

  const fetchAlbum = async () => {
    const { data } = await (supabase as any)
      .from('albums')
      .select('id, title, description, cover_photo_id')
      .eq('id', albumId)
      .single();
    setAlbum(data);
  };

  const fetchPhotos = async (pageNum = 0, replace = false) => {
    const from = pageNum * PHOTOS_PER_PAGE;
    const to = from + PHOTOS_PER_PAGE - 1;
    const { data } = await (supabase as any)
      .from('photos')
      .select('id, title, caption, tags, image_url, thumbnail_url, order, album_id')
      .eq('album_id', albumId)
      .order('order', { ascending: true })
      .range(from, to);
    if (replace) {
      setPhotos(data || []);
    } else {
      setPhotos(prev => [...prev, ...(data || [])]);
    }
    setHasMore((data?.length || 0) === PHOTOS_PER_PAGE);
  };

  const setCoverPhoto = async (photoId: string) => {
    setLoading(true);
    await (supabase as any)
      .from('albums')
      .update({ cover_photo_id: photoId })
      .eq('id', albumId);
    await fetchAlbum();
    setLoading(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    setLoading(true);
    await (supabase as any).from('photos').delete().eq('id', photoId);
    await fetchPhotos();
    setLoading(false);
  };

  const handleEditPhoto = (photo: any) => {
    setEditPhoto(photo);
    setEditOpen(true);
  };

  const handleSaveEditPhoto = async (data: { title: string, caption: string, tags: string[] }) => {
    setLoading(true);
    await (supabase as any).from('photos').update(data).eq('id', editPhoto.id);
    await fetchPhotos();
    setEditOpen(false);
    setEditPhoto(null);
    setLoading(false);
  };

  // Memoize sortedPhotos and photoItems
  const sortedPhotos = useMemo(() => [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [photos]);
  const photoItems = useMemo(() => sortedPhotos.map(photo => ({
    src: photo.thumbnail_url || photo.image_url,
    full: photo.image_url,
    width: 1200,
    height: 900,
    title: photo.title,
    id: photo.id,
    caption: photo.caption,
    order: photo.order,
    tags: photo.tags,
    thumbnail_url: photo.thumbnail_url,
    image_url: photo.image_url,
  })), [sortedPhotos]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedPhotos.findIndex(p => p.id === active.id);
    const newIndex = sortedPhotos.findIndex(p => p.id === over.id);
    const newPhotos = arrayMove(sortedPhotos, oldIndex, newIndex);
    // Update order in DB and state
    setPhotos(newPhotos.map((p, idx) => ({ ...p, order: idx })));
    await Promise.all(
      newPhotos.map((p, idx) =>
        (supabase as any).from('photos').update({ order: idx }).eq('id', p.id)
      )
    );
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchPhotos(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <EditPhotoModal photo={editPhoto} open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSaveEditPhoto} />
      <h1 className="text-2xl font-bold mb-2 text-white">{album?.title}</h1>
      <div className="mb-6 text-gray-300">
        <ReactMarkdown>{album?.description || ''}</ReactMarkdown>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photoItems.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div id="album-gallery" ref={galleryRef} className="flex flex-wrap gap-6 my-6">
            {loading ? (
              <div className="flex justify-center items-center py-16 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : photoItems.length === 0 ? (
              <div className="text-center text-gray-400 py-16 w-full">
                <div className="text-3xl mb-2">🖼️</div>
                <div className="text-lg">No photos in this album yet.</div>
              </div>
            ) : (
              <>
                {photoItems.map((photo, i) => {
                  const isCover = album?.cover_photo_id === photo.id;
                  return (
                    <SortablePhoto
                      key={photo.id}
                      photo={photo}
                      isAdmin={isAdmin}
                      isCover={isCover}
                      loading={loading}
                      onSetCover={() => setCoverPhoto(photo.id)}
                      onEdit={() => handleEditPhoto(photos.find(p => p.id === photo.id))}
                      onDelete={() => handleDeletePhoto(photo.id)}
                    />
                  );
                })}
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
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 