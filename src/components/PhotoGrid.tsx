import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PhotoCard from '@/components/photo/PhotoCard';
import PhotoLoading from '@/components/photo/PhotoLoading';
import EmptyState from '@/components/photo/EmptyState';
import { ArrowDown, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';

interface Photo {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  tags: string[];
}

interface PhotoGridProps {
  photos: Photo[];
  loading?: boolean;
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

const PhotoGrid = ({ photos, loading = false }: PhotoGridProps) => {
  const { displayedItems, lastItemRef, hasMore } = useInfiniteScroll({
    items: photos,
    itemsPerPage: ITEMS_PER_PAGE,
    loading
  });

  if (loading) {
    return <PhotoLoading />;
  }

  if (!photos.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10">
          <Logo size={16} className="drop-shadow-[0_0_8px_#3b82f6]" />
          <span className="text-sm font-medium text-secondary">Shot on iPhone 16 Pro Max</span>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayedItems.map((photo, index) => {
          const isLastPhoto = index === displayedItems.length - 1;
          
          return (
            <motion.div
              key={photo.id}
              ref={isLastPhoto ? lastItemRef : null}
              variants={itemVariants}
              className="group"
            >
              <div className="relative transform transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1">
                <PhotoCard photo={photo} />
                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 transition-opacity group-hover:ring-black/20" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
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

export default PhotoGrid;
