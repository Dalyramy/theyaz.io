import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Filter, SlidersHorizontal, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import OptimizedImage from '@/components/ui/OptimizedImage';
import PhotoLightbox from '@/components/photo/PhotoLightbox';

interface Photo {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  tags: string[];
  created_at: string;
  likes: number;
  comments: number;
}

const ITEMS_PER_PAGE = 12;

const GalleryPage = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Fetch photos with React Query
  const {
    data: photosPages,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['photos', searchQuery, selectedTag, sortBy],
    queryFn: async ({ pageParam = null }) => {
      let query = supabase
        .from('photos')
        .select('id, title, caption, image_url, tags, created_at, likes, comments');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,caption.ilike.%${searchQuery}%`);
      }

      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }

      if (sortBy === 'latest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('likes', { ascending: false });
      }

      if (pageParam) {
        const compareField = sortBy === 'latest' ? 'created_at' : 'likes';
        query = query.lt(compareField, pageParam);
      }

      query = query.limit(ITEMS_PER_PAGE);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < ITEMS_PER_PAGE) return undefined;
      const compareField = sortBy === 'latest' ? 'created_at' : 'likes';
      return lastPage[lastPage.length - 1][compareField];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
  });

  // Fetch popular tags with React Query
  const { data: popularTags = [] } = useQuery({
    queryKey: ['popularTags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;

      const tagCounts = data.reduce((acc, photo) => {
        photo.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  // Flatten photos for virtualization
  const photos = photosPages?.pages.flat() || [];

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: hasNextPage ? photos.length + 1 : photos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated row height
    overscan: 5,
  });

  // Load more photos when reaching the bottom
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    const lastItem = virtualItems.at(-1);
    if (!lastItem) return;

    if (
      lastItem.index >= photos.length - 1 &&
      hasNextPage &&
      !isFetching
    ) {
      fetchNextPage();
    }
  }, [photos.length, isFetching, hasNextPage, fetchNextPage, virtualizer]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleTagSelect = useCallback((tag: string | null) => {
    setSelectedTag(tag);
  }, []);

  const handleSortChange = useCallback((sort: 'latest' | 'popular') => {
    setSortBy(sort);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent mb-4">
          Photo Gallery
        </h1>
        <div className="flex items-center gap-2 justify-center mb-6">
          <Phone className="h-5 w-5 text-emerald-600" />
          <span className="text-emerald-700 dark:text-emerald-300">
            Shot on iPhone 16 Pro Max
          </span>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedTag || 'Filter by Tag'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Popular Tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTagSelect(null)}>
                All Photos
              </DropdownMenuItem>
              {popularTags.map(tag => (
                <DropdownMenuItem key={tag} onClick={() => handleTagSelect(tag)}>
                  #{tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange('latest')}>
                Latest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('popular')}>
                Most Popular
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedTag || sortBy !== 'latest') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {selectedTag && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 cursor-pointer"
              onClick={() => handleTagSelect(null)}
            >
              #{selectedTag} ×
            </Badge>
          )}
          {sortBy !== 'latest' && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
            >
              Most Popular
            </Badge>
          )}
        </motion.div>
      )}

      {/* Gallery Grid with Virtual Scrolling */}
      <div
        ref={parentRef}
        className="h-[800px] overflow-auto"
        style={{
          contain: 'strict',
        }}
      >
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const photo = photos[virtualRow.index];
                if (!photo) {
                  return hasNextPage ? (
                    <div key={virtualRow.index} className="aspect-[4/5]">
                      <Skeleton className="w-full h-full rounded-2xl" />
                    </div>
                  ) : null;
                }

                return (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      onClick={() => setSelectedPhotoId(photo.id)}
                      className="block group relative aspect-[4/5] overflow-hidden rounded-2xl bg-black cursor-pointer"
                    >
                      <OptimizedImage
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-full"
                        width={400}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <h3 className="font-medium text-lg mb-1">{photo.title}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {photo.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {photo.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && photos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No photos found. Try adjusting your filters or search query.
          </p>
        </motion.div>
      )}

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhotoId && (
          <PhotoLightbox
            photos={photos}
            initialPhotoId={selectedPhotoId}
            onClose={() => setSelectedPhotoId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage; 