import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PhotoCard from '@/components/photo/PhotoCard';
import PhotoLoading from '@/components/photo/PhotoLoading';
import EmptyState from '@/components/photo/EmptyState';
import { Phone } from 'lucide-react';
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

  // Free-form masonry layout
  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
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
            className={`px-4 py-2 min-h-[44px] rounded-full border text-sm font-medium transition-all ${sortOption === option.value ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-primary/10'} active:bg-primary/20`}
            onClick={() => setSortOption(option.value)}
          >
            {option.label}
          </button>
        ))}
      </motion.div>

      {/* Filter Bar */}
      {allTags.length > 0 && (
        <motion.div
          className="flex flex-nowrap gap-2 justify-start mb-2 overflow-x-auto pb-2 px-1 sm:justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            className={`px-4 py-2 min-h-[44px] rounded-full border text-sm font-medium transition-all ${!selectedTag ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-primary/10'} active:bg-primary/20`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`px-4 py-2 min-h-[44px] rounded-full border text-sm font-medium transition-all ${selectedTag === tag ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-primary/10'} active:bg-primary/20`}
              onClick={() => setSelectedTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </motion.div>
      )}

      {/* Free-form masonry layout */}
      <motion.div
        className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-6 w-full"
        style={{ columnGap: '1.5rem' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={sortOption + (selectedTag || 'all')}
      >
        {displayedItems.map((photo, index) => {
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
              className="outline-none focus:ring-2 focus:ring-primary w-full mb-6 break-inside-avoid"
              style={{ 
                display: 'inline-block',
                width: '100%',
                marginBottom: '1.5rem'
              }}
              tabIndex={0}
              role="button"
              aria-label={`Open photo ${photo.title}`}
              onKeyDown={e => handleKeyDown(e, index)}
            >
              <PhotoCard photo={photo} />
            </motion.div>
          );
        })}
        {/* Loading spinner for infinite scroll */}
        {hasMore && (
          <motion.div
            className="col-span-full flex justify-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ columnSpan: 'all' }}
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
    </div>
  );
};

export default PhotoGrid;
