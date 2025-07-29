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

  // Refresh album covers periodically to catch new uploads
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlbumsAndPhotos();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
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
      // Fetch albums with photo counts and cover images
      const { data: albumsData, error: albumsError } = await supabase
        .from('albums')
        .select(`
          id,
          title,
          description,
          user_id,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (albumsError) {
        console.error('Error fetching albums:', albumsError);
        setError('Failed to load albums');
        return;
      }

      // Get photo counts and cover images for each album
      const albumsWithPhotos = await Promise.all(
        albumsData?.map(async (album) => {
          // Get photo count
          const { count } = await supabase
            .from('photos')
            .select('*', { count: 'exact', head: true })
            .eq('album_id', album.id);
          
          // Get the first photo as cover image
          const { data: coverPhoto } = await supabase
            .from('photos')
            .select('image_url')
            .eq('album_id', album.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          return {
            ...album,
            photo_count: count || 0,
            cover_image: coverPhoto?.image_url || null
          };
        }) || []
      );

      // Transform the data to match our interface
      const transformedAlbums: AlbumData[] = albumsWithPhotos.map(album => ({
        id: album.id,
        title: album.title,
        description: album.description || '',
        cover_image: album.cover_image,
        photo_count: album.photo_count,
        photos: [], // We'll fetch photos separately if needed
        created_at: album.created_at,
        updated_at: album.updated_at,
        user_id: album.user_id
      }));

      setAlbums(transformedAlbums);
      
      // If no albums exist, create default ones
      if (transformedAlbums.length === 0) {
        await createDefaultAlbums();
        // Fetch again after creating defaults
        fetchAlbumsAndPhotos();
      }
    } catch (error) {
      console.error('Error in fetchAlbumsAndPhotos:', error);
      setError('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbumPhotos = async (albumId: string) => {
    try {
      const { data: photosData, error: photosError } = await supabase
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
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Error fetching album photos:', photosError);
        return [];
      }

      // Transform to match PhotoData interface
      const transformedPhotos: PhotoData[] = (photosData || []).map(photo => ({
        id: photo.id,
        title: photo.title,
        caption: photo.caption,
        image_url: photo.image_url,
        likes_count: photo.likes_count,
        comments_count: photo.comments_count,
        tags: photo.tags || [],
        created_at: photo.created_at,
        user_id: photo.user_id,
        profiles: {
          username: 'Unknown',
          avatar_url: '',
          full_name: 'Unknown User'
        }
      }));

      return transformedPhotos;
    } catch (error) {
      console.error('Error fetching album photos:', error);
      return [];
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

  const handleAlbumSelect = async (album: AlbumData) => {
    setSelectedAlbum(album);
    
    // Fetch photos for this album
    const photos = await fetchAlbumPhotos(album.id);
    setSelectedAlbum(prev => prev ? { ...prev, photos } : null);
  };

  // Function to refresh album covers when photos are uploaded
  const refreshAlbumCovers = async () => {
    await fetchAlbumsAndPhotos();
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
  };

  const handleCreateAlbum = async (albumData: { title: string; description: string }) => {
    if (!user) {
      toast.error('Please log in to create albums');
      return;
    }

    if (!albumData.title.trim()) {
      toast.error('Please enter an album title');
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
      setShowCreateDialog(false);
      fetchAlbumsAndPhotos(); // Refresh the list
    } catch (error) {
      console.error('Error creating album:', error);
      toast.error('Failed to create album. Please try again.');
    }
  };

  const handleEditAlbum = async (albumData: { title: string; description: string }) => {
    if (!editingAlbum || !user) return;

    // Security check: ensure user can only edit their own albums
    if (editingAlbum.user_id !== user.id) {
      toast.error('You can only edit your own albums');
      return;
    }

    if (!albumData.title.trim()) {
      toast.error('Please enter an album title');
      return;
    }

    try {
      const { error } = await supabase
        .from('albums')
        .update({
          title: albumData.title.trim(),
          description: albumData.description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAlbum.id)
        .eq('user_id', user.id); // Additional security: only update user's own albums

      if (error) throw error;

      toast.success('Album updated successfully!');
      setShowEditDialog(false);
      setEditingAlbum(null);
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
                <Button 
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create New Album
                </Button>
              )}
            </div>

            {/* Create Album Dialog */}
            {user && (
              <AlbumForm
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSubmit={handleCreateAlbum}
                mode="create"
              />
            )}

            {filteredAlbums.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-muted-foreground text-lg mb-4">
                  {searchTerm ? 'No albums found matching your search' : 'No albums available'}
                </div>
                <div className="text-muted-foreground mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new collections'}
                </div>
                {user && !searchTerm && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Album
                  </Button>
                )}
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
                        ) : album.photo_count > 0 ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <div className="text-center">
                              <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Loading photos...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <div className="text-center">
                              <span className="text-4xl mb-2 block">{getAlbumIcon(album.title)}</span>
                              <p className="text-sm text-muted-foreground">No photos yet</p>
                            </div>
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
                              {user && album.user_id === user.id && (
                                <>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAlbum(album);
                                    setShowEditDialog(true);
                                  }}>
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit Album
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
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
        {editingAlbum && user && editingAlbum.user_id === user.id && (
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
                {user && selectedAlbum.user_id === user.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/upload'}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Photo
                  </Button>
                )}
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
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
                <p className="text-muted-foreground mb-6">
                  This album is empty. Start building your collection by uploading your first photo.
                </p>
                {user && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => window.location.href = '/upload'}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload First Photo
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/gallery'}
                    >
                      Browse Other Albums
                    </Button>
                  </div>
                )}
              </div>
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