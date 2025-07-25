
import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  initialPage?: number;
  loadMoreOnMount?: boolean;
  disabled?: boolean;
}

export interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage: number;
  loading?: boolean;
  options?: UseInfiniteScrollOptions;
}

export interface UseInfiniteScrollResult<T> {
  displayedItems: T[];
  lastItemRef: (node: HTMLDivElement | null) => void;
  hasMore: boolean;
  loadMore: () => void;
  page: number;
  resetScroll: () => void;
  isLoadingMore: boolean;
}

export function useInfiniteScroll<T>({
  items,
  itemsPerPage,
  loading = false,
  options = {},
}: UseInfiniteScrollProps<T>): UseInfiniteScrollResult<T> {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    initialPage = 1,
    loadMoreOnMount = false,
    disabled = false,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Update displayed items when source items or page changes
  useEffect(() => {
    const start = 0;
    const end = page * itemsPerPage;
    const newItems = items.slice(start, end);
    
    setDisplayedItems(newItems);
    setHasMore(end < items.length);
    setIsLoadingMore(false);
  }, [items, page, itemsPerPage]);
  
  // Reset scroll when items change completely (like on search)
  useEffect(() => {
    if (items.length > 0 && !loading) {
      // Only reset if it's not just adding more items
      const resetToFirstPage = () => {
        setPage(initialPage);
      };
      
      // Use a more sophisticated approach to detect if items array has been replaced
      // This is a simplified approach - a real implementation might use item IDs
      if (page > initialPage && items.length <= itemsPerPage) {
        resetToFirstPage();
      }
    }
  }, [items, loading, initialPage, itemsPerPage, page]);
  
  // Load more items function
  const loadMore = useCallback(() => {
    if (loading || !hasMore || disabled) return;
    
    setIsLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  }, [loading, hasMore, disabled]);
  
  // Reset scroll state
  const resetScroll = useCallback(() => {
    setPage(initialPage);
    setIsLoadingMore(false);
  }, [initialPage]);
  
  // Handle intersection observer for infinite scrolling
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || disabled) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { 
        threshold, 
        rootMargin 
      }
    );
    
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, isLoadingMore, loadMore, threshold, rootMargin, disabled]);
  
  // Initial load more if specified
  useEffect(() => {
    if (loadMoreOnMount && items.length > 0 && page === initialPage) {
      loadMore();
    }
  }, [loadMoreOnMount, items.length, page, initialPage, loadMore]);

  return {
    displayedItems,
    lastItemRef,
    hasMore,
    loadMore,
    page,
    resetScroll,
    isLoadingMore,
  };
}
