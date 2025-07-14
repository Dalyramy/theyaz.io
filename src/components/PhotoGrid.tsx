import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PhotoCard from '@/components/photo/PhotoCard';
import PhotoLoading from '@/components/photo/PhotoLoading';
import EmptyState from '@/components/photo/EmptyState';
import { ArrowDown, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import PhotoLightbox from '@/components/photo/PhotoLightbox';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  instagram_post_id?: string | null;
}

interface PhotoGridProps {
  photos: Photo[];
  loading?: boolean;
  isOwner?: boolean;
}

const ITEMS_PER_PAGE = 12;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most Liked', value: 'most_liked' },
];

const PhotoGrid = ({ photos, loading = false, isOwner = false }: PhotoGridProps) => {
  // Extract unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach(photo => photo.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [photos]);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('newest');

  // Filter photos by selected tag
  const filteredPhotos = useMemo(() => {
    if (!selectedTag) return photos;
    return photos.filter(photo => photo.tags?.includes(selectedTag));
  }, [photos, selectedTag]);

  // Sort filtered photos
  const sortedPhotos = useMemo(() => {
    const photosToSort = [...filteredPhotos];
    if (sortOption === 'oldest') {
      photosToSort.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'most_liked') {
      // Fallback to 0 if likes_count is undefined
      photosToSort.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else {
      // Newest
      photosToSort.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return photosToSort;
  }, [filteredPhotos, sortOption]);

  const { displayedItems, lastItemRef, hasMore } = useInfiniteScroll({
    items: sortedPhotos,
    itemsPerPage: ITEMS_PER_PAGE,
    loading
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);

  // DnD state
  const [dndPhotos, setDndPhotos] = useState(sortedPhotos);
  useEffect(() => {
    setDndPhotos(sortedPhotos);
  }, [sortedPhotos]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = dndPhotos.findIndex((p) => p.id === active.id);
      const newIndex = dndPhotos.findIndex((p) => p.id === over.id);
      setDndPhotos(arrayMove(dndPhotos, oldIndex, newIndex));
      // TODO: Persist new order to backend if needed
    }
  }

  // Sortable photo wrapper
  function SortablePhoto({ photo, children }: { photo: Photo; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
    return (
      <motion.div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 10 : undefined,
          breakInside: 'avoid',
          marginBottom: '1.5rem',
        }}
        {...attributes}
        {...listeners}
        variants={itemVariants}
        whileHover={{ scale: 1.04, zIndex: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        className={`relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 ${isDragging ? 'ring-2 ring-primary' : ''}`}
        onClick={() => {
          setLightboxPhotoId(photo.id);
          setLightboxOpen(true);
        }}
      >
        {children}
      </motion.div>
    );
  }

  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % displayedItems.length;
      photoRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + displayedItems.length) % displayedItems.length;
      photoRefs.current[prev]?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Move down a row (approximate by +4 for 4 columns)
      const down = (index + 4) % displayedItems.length;
      photoRefs.current[down]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const up = (index - 4 + displayedItems.length) % displayedItems.length;
      photoRefs.current[up]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLightboxPhotoId(displayedItems[index].id);
      setLightboxOpen(true);
    }
  }, [displayedItems]);

  if (loading) {
    return <PhotoLoading />;
  }

  if (!photos.length) {
    return <EmptyState />;
  }

  // Modern Masonry CSS
  const masonryClass = `gallery-masonry`;

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10">
          <span className="text-sm font-medium text-secondary">Shot on iPhone 16 Pro Max</span>
        </div>
      </motion.div>

      {/* Sort Bar */}
      <motion.div
        className="flex flex-wrap gap-2 justify-center mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {SORT_OPTIONS.map(option => (
          <button
            key={option.value}
            className={`px-3 py-1 rounded-full border text-sm font-medium transition-all ${sortOption === option.value ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-primary/10'}`}
            onClick={() => setSortOption(option.value)}
          >
            {option.label}
          </button>
        ))}
      </motion.div>

      {/* Filter Bar */}
      {allTags.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            className={`px-3 py-1 rounded-full border text-sm font-medium transition-all ${!selectedTag ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-primary/10'}`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full border text-sm font-medium transition-all ${selectedTag === tag ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-primary/10'}`}
              onClick={() => setSelectedTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </motion.div>
      )}

      <motion.div
        className={masonryClass}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ columnGap: '1.5rem' }}
        key={sortOption + (selectedTag || 'all')}
      >
        {isOwner ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={dndPhotos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {dndPhotos.map((photo, index) => {
                const isLastPhoto = index === dndPhotos.length - 1;
                return (
                  <SortablePhoto key={photo.id} photo={photo}>
                    <div className="relative">
                      <PhotoCard photo={photo} />
                      <motion.div
                        className="absolute inset-0 bg-black bg-opacity-0 pointer-events-none"
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.10)' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </SortablePhoto>
                );
              })}
            </SortableContext>
          </DndContext>
        ) : (
          displayedItems.map((photo, index) => {
            const isLastPhoto = index === displayedItems.length - 1;
            return (
              <motion.div
                key={photo.id}
                ref={el => {
                  if (isLastPhoto) lastItemRef(el);
                  photoRefs.current[index] = el;
                }}
                variants={itemVariants}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ breakInside: 'avoid', marginBottom: '1.5rem' }}
                whileHover={{ scale: 1.04, zIndex: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 outline-none focus:ring-2 focus:ring-primary"
                onClick={() => {
                  setLightboxPhotoId(photo.id);
                  setLightboxOpen(true);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open photo ${photo.title}`}
                onKeyDown={e => handleKeyDown(e, index)}
              >
                <div className="relative">
                  <PhotoCard photo={photo} />
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-0 pointer-events-none"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.10)' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            );
          })
        )}
        {/* Loading spinner for infinite scroll */}
        {hasMore && (
          <motion.div
            className="col-span-full flex justify-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
          </motion.div>
        )}
      </motion.div>

      {lightboxOpen && lightboxPhotoId && (
        <PhotoLightbox
          photos={sortedPhotos}
          initialPhotoId={lightboxPhotoId}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {loading && (
        <motion.div 
          className="col-span-full flex justify-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
        </motion.div>
      )}
      {!loading && hasMore && (
        <motion.div 
          className="col-span-full flex justify-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ArrowDown className="h-6 w-6 animate-bounce text-secondary" />
        </motion.div>
      )}
    </div>
  );
};

// Add CSS for masonry layout (can be in a global CSS file)
// .gallery-masonry {
//   column-count: 1;
//   column-gap: 1.5rem;
// }
// @media (min-width: 640px) { .gallery-masonry { column-count: 2; } }
// @media (min-width: 1024px) { .gallery-masonry { column-count: 3; } }
// @media (min-width: 1280px) { .gallery-masonry { column-count: 4; } }

export default PhotoGrid;
