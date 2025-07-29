import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Eye, 
  Filter, 
  Grid, 
  List, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Camera,
  Calendar,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { toast } from 'sonner';
import AlbumForm from '@/components/gallery/AlbumForm';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import PeaceWatermark from '@/components/ui/PeaceWatermark';

interface PhotoData {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  likes_count: number | null;
  comments_count: number | null;
  tags: string[];
  created_at: string;
  user_id?: string;
  profiles?: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

interface AlbumData {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  photo_count: number;
  photos: PhotoData[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const Gallery: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'my-albums' | 'featured'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumData | null>(null);

  useEffect(() => {
    fetchAlbumsAndPhotos();
  }, []);

  // Handle navigation state from HomePage
  useEffect(() => {
    if (location.state?.selectedAlbumId && albums.length > 0) {
      const albumToSelect = albums.find(album => album.id === location.state.selectedAlbumId);
      if (albumToSelect) {
        setSelectedAlbum(albumToSelect);
        // Clear the state to prevent re-selection on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.selectedAlbumId, albums]);

  const fetchAlbumsAndPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Build query based on filter mode
      let query = supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterMode === 'my-albums' && user) {
        query = query.eq('user_id', user.id);
      }

      const { data: albumsData, error: albumsError } = await query;
      
      if (albumsError) {
        console.error('Error fetching albums:', albumsError);
        setError('Failed to load albums. Please try again later.');
        setLoading(false);
        return;
      }
      
      if (!albumsData || albumsData.length === 0) {
        // No albums exist, create default ones
        console.log('No albums found, creating default albums...');
        await createDefaultAlbums();
        // Try to fetch albums again after creation
        const { data: newAlbumsData, error: newAlbumsError } = await supabase
          .from('albums')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (newAlbumsError) {
          console.error('Error fetching albums after creation:', newAlbumsError);
          setError('Failed to create default albums.');
          setLoading(false);
          return;
        }
        
        if (!newAlbumsData || newAlbumsData.length === 0) {
          setError('No albums available.');
          setLoading(false);
          return;
        }
        
        const updatedAlbumsData = newAlbumsData;
      }

      // For each album, fetch its photos with user data
      const albumsWithPhotos: AlbumData[] = [];
      for (const album of albumsData) {
        try {
          const result = await supabase
            .from('photos')
            .select(`
              id, 
              title, 
              caption, 
              image_url, 
              likes_count, 
              comments_count, 
              tags, 
              created_at,
              user_id
            `)
            .eq('album_id', album.id)
            .order('created_at', { ascending: false });
          
          const photosData = result.data || [];
          
          albumsWithPhotos.push({ 
            ...album, 
            photo_count: photosData.length,
            photos: photosData as PhotoData[],
            cover_image: null
          });
        } catch (error) {
          console.warn(`Error fetching photos for album ${album.id}:`, error);
          albumsWithPhotos.push({ 
            ...album, 
            photo_count: 0,
            photos: [],
            cover_image: null
          });
        }
      }
      
      setAlbums(albumsWithPhotos);
    } catch (err) {
      console.error('Error fetching albums and photos:', err);
      setError('Failed to load albums/photos');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAlbums = async () => {
    try {
      const defaultAlbums = [
        {
          title: 'Nature & Landscape',
          description: 'Breathtaking landscapes, wildlife, and natural wonders captured in their purest form.',
          cover_image: null,
          user_id: null // System albums
        },
        {
          title: 'Portrait & People',
          description: 'Intimate portraits and candid moments that capture the human spirit.',
          cover_image: null,
          user_id: null
        },
        {
          title: 'Street Photography',
          description: 'Urban life captured through the lens. Street scenes and city architecture.',
          cover_image: null,
          user_id: null
        },
        {
          title: 'Architecture & Design',
          description: 'Stunning architectural marvels and modern buildings.',
          cover_image: null,
          user_id: null
        },
        {
          title: 'Abstract & Artistic',
          description: 'Creative expressions and abstract compositions.',
          cover_image: null,
          user_id: null
        },
        {
          title: 'Minimal & Clean',
          description: 'Less is more. Clean lines and minimalist aesthetics.',
          cover_image: null,
          user_id: null
        },
        {
          title: 'Black & White',
          description: 'Timeless monochrome photography with powerful visual impact.',
          cover_image: null,
          user_id: null
        },
        {
          title: 'Color & Vibrant',
          description: 'Bold, colorful compositions that celebrate the full spectrum of life.',
          cover_image: null,
          user_id: null
        }
      ];

      const { data, error } = await supabase
        .from('albums')
        .insert(defaultAlbums)
        .select();

      if (error) {
        console.error('Error creating default albums:', error);
      } else {
        console.log('Default albums created successfully');
      }
    } catch (error) {
      console.error('Error creating default albums:', error);
    }
  };

  const handleCreateAlbum = async (albumData: { title: string; description: string }) => {
    if (!user) {
      toast.error('Please log in to create albums');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('albums')
        .insert({
          title: albumData.title.trim(),
          description: albumData.description.trim(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Album created successfully!');
      fetchAlbumsAndPhotos(); // Refresh the list
    } catch (error) {
      console.error('Error creating album:', error);
      toast.error('Failed to create album. Please try again.');
    }
  };

  const handleEditAlbum = async (albumData: { title: string; description: string }) => {
    if (!editingAlbum) return;

    try {
      const { error } = await supabase
        .from('albums')
        .update({
          title: albumData.title.trim(),
          description: albumData.description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAlbum.id);

      if (error) throw error;

      toast.success('Album updated successfully!');
      fetchAlbumsAndPhotos(); // Refresh the list
    } catch (error) {
      console.error('Error updating album:', error);
      toast.error('Failed to update album. Please try again.');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!user) return;

    try {
      // First delete all photos in the album
      const { error: photosError } = await supabase
        .from('photos')
        .delete()
        .eq('album_id', albumId);

      if (photosError) throw photosError;

      // Then delete the album
      const { error: albumError } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (albumError) throw albumError;

      toast.success('Album deleted successfully!');
      fetchAlbumsAndPhotos(); // Refresh the list
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album. Please try again.');
    }
  };

  const handleAlbumSelect = (album: AlbumData) => {
    setSelectedAlbum(album);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
  };

  const getAlbumIcon = (albumTitle: string) => {
    const title = albumTitle.toLowerCase();
    if (title.includes('nature')) return '🌿';
    if (title.includes('portrait')) return '👤';
    if (title.includes('street')) return '🏙️';
    if (title.includes('architecture')) return '🏛️';
    if (title.includes('abstract')) return '🎨';
    if (title.includes('minimal')) return '⚪';
    if (title.includes('black')) return '⚫';
    if (title.includes('color')) return '🌈';
    return '📸';
  };

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         album.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted aspect-square rounded-lg mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24">
        <Navbar />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-4">{error}</div>
            <button
              onClick={fetchAlbumsAndPhotos}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Album Selection View
  if (!selectedAlbum) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Peace Sign Background Watermark */}
        <PeaceWatermark />
        
        <div className="relative z-10">
          <Navbar />
          <div className="container mx-auto px-4 py-8 pt-24">
            <motion.div 
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Eye className="w-3 h-3 mr-1" />
                Photo Albums
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
                Choose Your Collection
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Explore specialized albums curated by theme and style
              </p>
            </motion.div>

            {/* Search and Filter Controls */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search albums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Tabs value={filterMode} onValueChange={(value) => setFilterMode(value as 'all' | 'my-albums' | 'featured')}>
                  <TabsList>
                    <TabsTrigger value="all">All Albums</TabsTrigger>
                    <TabsTrigger value="featured">Featured</TabsTrigger>
                    {user && <TabsTrigger value="my-albums">My Albums</TabsTrigger>}
                  </TabsList>
                </Tabs>
              </div>
              
              {user && (
                <>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Album
                  </Button>
                  <AlbumForm
                    isOpen={showCreateDialog}
                    onClose={() => setShowCreateDialog(false)}
                    onSubmit={handleCreateAlbum}
                    mode="create"
                  />
                </>
              )}
            </div>

            {filteredAlbums.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  {searchTerm ? 'No albums found matching your search' : 'No albums available'}
                </div>
                <div className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new collections'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlbums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card 
                      className="group cursor-pointer overflow-hidden hover-lift rounded-2xl border-border transition-all duration-300 hover:shadow-xl"
                      onClick={() => handleAlbumSelect(album)}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                        {album.cover_image ? (
                          <OptimizedImage
                            src={album.cover_image}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            priority={index < 3}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <span className="text-4xl">{getAlbumIcon(album.title)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 right-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setEditingAlbum(album);
                                setShowEditDialog(true);
                              }}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Album
                              </DropdownMenuItem>
                              {user && album.user_id === user.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Are you sure you want to delete this album? This action cannot be undone.')) {
                                        handleDeleteAlbum(album.id);
                                      }
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Album
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <Badge variant="secondary" className="mb-2">
                            {album.photo_count} photos
                          </Badge>
                          {album.user_id && (
                            <Badge variant="outline" className="ml-2">
                              <User className="w-3 h-3 mr-1" />
                              Personal
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-foreground line-clamp-1">
                            {album.title}
                          </h3>
                          <span className="text-2xl ml-2">{getAlbumIcon(album.title)}</span>
                        </div>
                        {album.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {album.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {album.created_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(album.created_at)}
                              </span>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Album Dialog */}
        {editingAlbum && (
          <AlbumForm
            isOpen={showEditDialog}
            onClose={() => {
              setShowEditDialog(false);
              setEditingAlbum(null);
            }}
            onSubmit={handleEditAlbum}
            initialData={{
              title: editingAlbum.title,
              description: editingAlbum.description
            }}
            mode="edit"
          />
        )}
      </div>
    );
  }

  // Album Detail View
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Peace Sign Background Watermark */}
      <PeaceWatermark />
      
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Album Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button 
              variant="ghost" 
              onClick={handleBackToAlbums}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Albums
            </Button>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{getAlbumIcon(selectedAlbum.title)}</span>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {selectedAlbum.title}
                </h1>
                {selectedAlbum.description && (
                  <p className="text-muted-foreground mt-2">{selectedAlbum.description}</p>
                )}
              </div>
              {user && selectedAlbum.user_id === user.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      setEditingAlbum(selectedAlbum);
                      setShowEditDialog(true);
                    }}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Album
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this album? This action cannot be undone.')) {
                          handleDeleteAlbum(selectedAlbum.id);
                          handleBackToAlbums();
                        }
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Album
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  <Camera className="w-3 h-3 mr-1" />
                  {selectedAlbum.photo_count} photos in this collection
                </Badge>
                {location.state?.selectedAlbumId && (
                  <Badge variant="outline" className="text-xs">
                    Navigated from photo
                  </Badge>
                )}
                {selectedAlbum.user_id && (
                  <Badge variant="outline">
                    <User className="w-3 h-3 mr-1" />
                    Personal Album
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Photos Grid/List */}
          {selectedAlbum.photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-4">No photos in this album yet</div>
              <div className="text-muted-foreground">Photos will appear here once uploaded</div>
              {user && (
                <Button className="mt-4" onClick={() => window.location.href = '/upload'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload First Photo
                </Button>
              )}
            </div>
          ) : (
            <PhotoGrid
              photos={selectedAlbum.photos}
              viewMode={viewMode}
              onPhotoClick={(photo) => {
                // Navigate to photo detail view
                window.location.href = `/photo/${photo.id}`;
              }}
              showUserInfo={true}
              showActions={true}
            />
          )}
        </div>

        {/* Edit Album Dialog */}
        {editingAlbum && (
          <AlbumForm
            isOpen={showEditDialog}
            onClose={() => {
              setShowEditDialog(false);
              setEditingAlbum(null);
            }}
            onSubmit={handleEditAlbum}
            initialData={{
              title: editingAlbum.title,
              description: editingAlbum.description
            }}
            mode="edit"
          />
        )}
      </div>
    </div>
  );
};

export default Gallery; 