import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Upload, 
  Edit, 
  Trash2, 
  Calendar, 
  Heart, 
  MessageCircle,
  Eye,
  MoreVertical,
  Plus,
  Camera
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';

interface Photo {
  id: string;
  title: string;
  caption?: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  tags?: string[];
  album_id?: string;
  album?: {
    title: string;
  };
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const MyPhotos = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'title'>('date');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (user) {
      fetchMyPhotos();
    }
  }, [user, debouncedSearch, filter, sortBy]);

  const fetchMyPhotos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('photos')
        .select(`
          *,
          albums (
            title
          )
        `)
        .eq('user_id', user.id);

      // Apply search
      if (debouncedSearch) {
        query = query.or(
          `title.ilike.%${debouncedSearch}%,caption.ilike.%${debouncedSearch}%,tags.cs.{${debouncedSearch}}`
        );
      }

      // Apply filters
      switch (filter) {
        case 'recent':
          query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
          break;
        case 'popular':
          query = query.gte('likes_count', 5);
          break;
      }

      // Apply sorting
      switch (sortBy) {
        case 'date':
          query = query.order('created_at', { ascending: false });
          break;
        case 'likes':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching photos:', err);
      toast.error('Failed to load your photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
      
      toast.success('Photo deleted successfully');
      fetchMyPhotos();
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Failed to delete photo');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col pt-24">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">My Photos</h1>
            <p className="text-muted-foreground mb-6">Please log in to view your photos.</p>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-24">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Photos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your photos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {filter === 'all' ? 'All' : filter === 'recent' ? 'Recent' : 'Popular'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Photos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('recent')}>
                  Recent (7 days)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('popular')}>
                  Popular (5+ likes)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort by {sortBy === 'date' ? 'Date' : sortBy === 'likes' ? 'Likes' : 'Title'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('likes')}>
                  Likes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('title')}>
                  Title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/upload">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Photos Grid */}
        {loading ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </motion.div>
        ) : photos.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">No photos yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">Start sharing your moments by uploading your first photo.</p>
            <Link to="/upload">
              <Button className="bg-primary hover:bg-primary/90 text-lg px-8 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Upload Your First Photo
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="overflow-hidden hover-lift border-border">
                    <div className="relative">
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                          <Link to={`/photo/${photo.id}`}>
                            <Button size="sm" variant="secondary">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/edit-photo/${photo.id}`}>
                            <Button size="sm" variant="secondary">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-sm line-clamp-1">{photo.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                              <Link to={`/photo/${photo.id}`}>View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/edit-photo/${photo.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {photo.caption}
                        </p>
                      )}
                      
                      <Separator className="mb-3" />
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{photo.likes_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{photo.comments_count || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(photo.created_at)}</span>
                        </div>
                      </div>
                      
                      {photo.tags && photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {photo.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {photo.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{photo.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default MyPhotos; 