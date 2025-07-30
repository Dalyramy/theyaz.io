'use client'

import React, { useState, useEffect, useCallback } from 'react';
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
  User,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Upload,
  BookOpen,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import PeaceWatermark from '@/components/ui/PeaceWatermark';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PhotoService, type Photo } from '@/lib/photos';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AlbumData {
  id: string;
  title: string;
  description?: string;
  cover_image?: string | null;
  photo_count: number;
  photos: Photo[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  is_featured?: boolean;
  category_id?: string;
  cover_photo_id?: string;
}

const GalleryPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  
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
  const [activeTab, setActiveTab] = useState<'albums' | 'photos'>('albums');

  const fetchAlbumsAndPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch albums
      const albumsData = await PhotoService.getAlbums();
      
      if (!albumsData || albumsData.length === 0) {
        // No albums exist, create default albums
        console.log('No albums found, creating default albums...');
        await createDefaultAlbums();
        // Try to fetch albums again after creation
        const newAlbumsData = await PhotoService.getAlbums();
        
        if (!newAlbumsData || newAlbumsData.length === 0) {
          setError('No albums available.');
          setLoading(false);
          return;
        }
        
        // Transform Album[] to AlbumData[]
        const transformedAlbums = newAlbumsData.map(album => ({
          ...album,
          photo_count: 0, // Will be updated when we fetch photos
          photos: [],
          cover_image: album.cover_photo_id ? album.cover_photo_id : null
        }));
        
        setAlbums(transformedAlbums);
      } else {
        // Transform Album[] to AlbumData[]
        const transformedAlbums = albumsData.map(album => ({
          ...album,
          photo_count: 0, // Will be updated when we fetch photos
          photos: [],
          cover_image: album.cover_photo_id ? album.cover_photo_id : null
        }));
        
        setAlbums(transformedAlbums);
      }
    } catch (err) {
      console.error('Error fetching albums and photos:', err);
      setError('Failed to load albums/photos');
      setAlbums([]); // Set empty array to prevent undefined errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbumsAndPhotos();
  }, [fetchAlbumsAndPhotos]);

  const createDefaultAlbums = async () => {
    try {
      const defaultAlbums = [
        {
          title: 'Nature & Landscape',
          description: 'Breathtaking landscapes, wildlife, and natural wonders captured in their purest form.',
          is_featured: true
        },
        {
          title: 'Portrait & People',
          description: 'Intimate portraits and candid moments that capture the human spirit.',
          is_featured: true
        },
        {
          title: 'Street Photography',
          description: 'Urban life captured through the lens. Street scenes and city architecture.',
          is_featured: false
        },
        {
          title: 'Architecture & Design',
          description: 'Stunning architectural marvels and modern buildings.',
          is_featured: false
        },
        {
          title: 'Abstract & Artistic',
          description: 'Creative expressions and abstract compositions.',
          is_featured: false
        },
        {
          title: 'Minimal & Clean',
          description: 'Less is more. Clean lines and minimalist aesthetics.',
          is_featured: false
        },
        {
          title: 'Black & White',
          description: 'Timeless monochrome photography with powerful visual impact.',
          is_featured: true
        },
        {
          title: 'Color & Vibrant',
          description: 'Bold, colorful compositions that celebrate the full spectrum of life.',
          is_featured: false
        }
      ];

      for (const album of defaultAlbums) {
        const result = await PhotoService.createAlbum(album.title, album.description);
        if (result.error) {
          console.error('Error creating album:', album.title, result.error);
        }
      }
      
      console.log('Default albums created successfully');
    } catch (error) {
      console.error('Error creating default albums:', error);
    }
  };

  const handleCreateAlbum = async (albumData: { title: string; description: string }) => {
    if (!user) {
      // Show login prompt
      router.push('/login');
      return;
    }

    try {
      const result = await PhotoService.createAlbum(albumData.title.trim(), albumData.description.trim());
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the list
      fetchAlbumsAndPhotos();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating album:', error);
    }
  };

  const handleEditAlbum = async (albumData: { title: string; description: string }) => {
    if (!editingAlbum) return;

    try {
      // Update album logic would go here
      // For now, just refresh the list
      fetchAlbumsAndPhotos();
      setShowEditDialog(false);
      setEditingAlbum(null);
    } catch (error) {
      console.error('Error updating album:', error);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!user) return;

    try {
      // Delete album logic would go here
      // For now, just refresh the list
      fetchAlbumsAndPhotos();
    } catch (error) {
      console.error('Error deleting album:', error);
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

  const filteredAlbums = albums?.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (album.description && album.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterMode === 'my-albums' && user) {
      return matchesSearch && album.user_id === user.id;
    }
    
    if (filterMode === 'featured') {
      return matchesSearch && album.is_featured;
    }
    
    return matchesSearch;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24">
        <PeaceWatermark />
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
        <PeaceWatermark />
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-4">{error}</div>
            <Button onClick={fetchAlbumsAndPhotos}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Album Selection View
  if (!selectedAlbum) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <PeaceWatermark />
        
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center max-w-4xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="mb-6">
                  <Badge variant="secondary" className="mb-4 text-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                                          {t('gallery.curated_collections')}
                  </Badge>
                </motion.div>

                <motion.h1 
                  variants={fadeInUp}
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-6 leading-tight"
                >
                                      {t('gallery.explore_title')}
                </motion.h1>

                <motion.p 
                  variants={fadeInUp}
                  className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
                >
                                      {t('gallery.explore_desc')}
                </motion.p>
              </motion.div>
            </div>
          </section>

          <div className="container mx-auto px-4 pb-16">
            {/* Navigation Tabs */}
            <motion.div 
              className="mb-8"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'albums' | 'photos')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="albums" className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                                          {t('gallery.albums')}
                    </TabsTrigger>
                    <TabsTrigger value="photos" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {t('gallery.all_photos')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div 
              className="mb-12"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <Card className="overflow-hidden hover-lift rounded-2xl border-border">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Filter className="w-6 h-6 text-primary" />
                                          <CardTitle className="text-lg sm:text-2xl">{t('gallery.find_collection')}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">
                      {t('gallery.search_filter_desc')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                                                  placeholder={t('gallery.search_albums')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Tabs value={filterMode} onValueChange={(value) => setFilterMode(value as 'all' | 'my-albums' | 'featured')}>
                      <TabsList className="grid w-full grid-cols-3">
                                                  <TabsTrigger value="all">{t('gallery.all_albums')}</TabsTrigger>
                          <TabsTrigger value="featured">{t('gallery.featured')}</TabsTrigger>
                          {user && <TabsTrigger value="my-albums">{t('gallery.my_albums')}</TabsTrigger>}
                      </TabsList>
                    </Tabs>

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
                    
                    {user && (
                      <Button 
                        className="flex items-center gap-2"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <Plus className="w-4 h-4" />
                                                  {t('gallery.create_album')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {filteredAlbums.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                <div className="text-muted-foreground text-lg mb-4">
                                      {searchTerm ? t('gallery.no_albums_search') : t('gallery.no_albums')}
                  </div>
                  <div className="text-muted-foreground">
                    {searchTerm ? t('gallery.try_different_search') : t('gallery.check_back_later')}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {filteredAlbums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="group cursor-pointer overflow-hidden hover-lift rounded-2xl border-border transition-all duration-300 hover:shadow-xl"
                      onClick={() => handleAlbumSelect(album)}
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                        {album.cover_image ? (
                          <img
                            src={album.cover_image}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <span className="text-6xl">{getAlbumIcon(album.title)}</span>
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
                                {t('gallery.edit_album')}
                              </DropdownMenuItem>
                              {user && album.user_id === user.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm(t('gallery.delete_confirm'))) {
                                        handleDeleteAlbum(album.id);
                                      }
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('gallery.delete_album')}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              <Camera className="w-3 h-3 mr-1" />
                              {album.photo_count} {t('gallery.photos')}
                            </Badge>
                            {album.user_id && (
                              <Badge variant="outline">
                                <User className="w-3 h-3 mr-1" />
                                {t('gallery.personal')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-foreground line-clamp-1 flex-1">
                            {album.title}
                          </h3>
                          <span className="text-3xl ml-3">{getAlbumIcon(album.title)}</span>
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
              </motion.div>
            )}
          </div>
        </div>

        {/* Create Album Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('gallery.create_new_album')}</DialogTitle>
            </DialogHeader>
            <AlbumForm
              onSubmit={handleCreateAlbum}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Album Dialog */}
        {editingAlbum && (
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('gallery.edit_album')}</DialogTitle>
              </DialogHeader>
              <AlbumForm
                onSubmit={handleEditAlbum}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingAlbum(null);
                }}
                initialData={{
                  title: editingAlbum.title,
                  description: editingAlbum.description || ''
                }}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Album Detail View
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <PeaceWatermark />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Album Header */}
          <motion.div 
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Button 
              variant="ghost" 
              onClick={handleBackToAlbums}
              className="mb-6 flex items-center gap-2 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('gallery.back_to_albums')}
            </Button>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="text-6xl">{getAlbumIcon(selectedAlbum.title)}</div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                  {selectedAlbum.title}
                </h1>
                {selectedAlbum.description && (
                  <p className="text-xl text-muted-foreground leading-relaxed">{selectedAlbum.description}</p>
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
                      {t('gallery.edit_album')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (confirm(t('gallery.delete_confirm'))) {
                          handleDeleteAlbum(selectedAlbum.id);
                          handleBackToAlbums();
                        }
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('gallery.delete_album')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Badge variant="secondary" className="text-sm">
                  <Camera className="w-4 h-4 mr-2" />
                  {selectedAlbum.photo_count} {t('gallery.photos_in_collection')}
                </Badge>
                {selectedAlbum.user_id && (
                  <Badge variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    {t('gallery.personal_album')}
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
            <motion.div 
              className="text-center py-16"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
                              <div className="text-muted-foreground text-xl mb-4">{t('gallery.no_photos_yet')}</div>
                              <div className="text-muted-foreground mb-8">{t('gallery.photos_will_appear')}</div>
              {user && (
                <Button size="lg" onClick={() => router.push('/upload')}>
                  <Upload className="w-5 h-5 mr-2" />
                                      {t('gallery.upload_first_photo')}
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {selectedAlbum.photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          )}
        </div>

        {/* Edit Album Dialog */}
        {editingAlbum && (
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('gallery.edit_album')}</DialogTitle>
              </DialogHeader>
              <AlbumForm
                onSubmit={handleEditAlbum}
                onCancel={() => {
                  setShowEditDialog(false);
                  setEditingAlbum(null);
                }}
                initialData={{
                  title: editingAlbum.title,
                  description: editingAlbum.description || ''
                }}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

// Photo Card Component
const PhotoCard = ({ photo }: { photo: Photo }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(photo.likes_count);

  const handleLike = async () => {
    if (!user) return;
    
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(newLiked ? likesCount + 1 : likesCount - 1);
    
    await PhotoService.toggleLike(photo.id, user.id);
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={photo.image_url}
          alt={photo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg mb-1">{photo.title}</h3>
          {photo.caption && (
            <p className="text-sm text-gray-200 mb-3">{photo.caption}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="text-white hover:text-red-400"
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                {likesCount}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                <MessageSquare className="h-4 w-4 mr-1" />
                {photo.comments_count}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:text-green-400">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {photo.tags && photo.tags.length > 0 && (
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {photo.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Album Form Component
const AlbumForm = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  mode = 'create' 
}: { 
  onSubmit: (data: { title: string; description: string }) => void;
  onCancel: () => void;
  initialData?: { title: string; description: string };
  mode?: 'create' | 'edit';
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">{t('gallery.album_title')}</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder={t('gallery.album_title_placeholder')}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">{t('gallery.album_description')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('gallery.album_description_placeholder')}
          rows={3}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
                      {mode === 'create' ? t('gallery.create_album') : t('gallery.update_album')}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default GalleryPage; 