
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchSection = ({ searchQuery, setSearchQuery }: SearchSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-16"
    >
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search photos by title or caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-white dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-gray-300 dark:focus:border-gray-700 rounded-xl shadow-sm"
            />
          </div>
          <Button 
            variant="outline" 
            className="h-12 px-6 border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 rounded-xl shadow-sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchSection;
