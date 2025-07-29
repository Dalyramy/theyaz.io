import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Upload, Filter, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PhotoList from '@/components/gallery/PhotoList';
import { searchImages } from '@/lib/cloudinary';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface CloudinaryImage {
  public_id: string;
  filename: string;
  created_at: string;
  width: number;
  height: number;
  secure_url: string;
}

export default function CloudinaryGallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedFolder, setSelectedFolder] = useState(searchParams.get('folder') || 'gallery');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Available folders - you can customize this based on your Cloudinary setup
  const availableFolders = [
    { value: 'gallery', label: 'Main Gallery' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'artwork', label: 'Artwork' },
    { value: 'photography', label: 'Photography' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' }
  ];

  useEffect(() => {
    fetchImages();
  }, [selectedFolder, sortBy]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll use a mock implementation since Cloudinary search requires server-side setup
      // In a real implementation, you'd call the searchImages function
      const mockImages: CloudinaryImage[] = [
        {
          public_id: 'gallery/sample-1',
          filename: 'sample-1.jpg',
          created_at: new Date().toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        },
        {
          public_id: 'gallery/sample-2',
          filename: 'sample-2.jpg',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
        },
        {
          public_id: 'gallery/sample-3',
          filename: 'sample-3.jpg',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center'
        },
        {
          public_id: 'gallery/sample-4',
          filename: 'sample-4.jpg',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center'
        },
        {
          public_id: 'gallery/sample-5',
          filename: 'sample-5.jpg',
          created_at: new Date(Date.now() - 345600000).toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=top'
        },
        {
          public_id: 'gallery/sample-6',
          filename: 'sample-6.jpg',
          created_at: new Date(Date.now() - 432000000).toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=bottom'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImages(mockImages);
    } catch (err) {
      setError('Failed to load images. Please try again.');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set('search', value);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
  };

  const handleFolderChange = (value: string) => {
    setSelectedFolder(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('folder', value);
    setSearchParams(newSearchParams);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', value);
    setSearchParams(newSearchParams);
  };

  const filteredImages = images.filter(image => 
    !searchTerm || 
    image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.public_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <Navbar />
      
      {/* Peace Sign Background Watermark */}
      <div 
        className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
        style={{
          width: '300px',
          height: '300px',
          backgroundImage: 'url(/icons/peace-watermark.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
          backgroundRepeat: 'no-repeat',
          transform: 'rotate(-10deg)',
        }}
      />

      <main className="container mx-auto pb-8 px-2 sm:px-4 flex flex-col gap-6">
        {/* Hero Section */}
        <motion.div 
          className="max-w-2xl mx-auto text-center mb-10 sm:mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Photography Gallery
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 sm:mb-6 break-words">
              ⴳⴰⵍⵍⴻⵔⵢ
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Browse and explore your uploaded images
            </p>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
          {/* Gallery Controls */}
          <motion.section 
            className="mb-8 sm:mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl border-border w-full">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Filter className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg sm:text-2xl">Gallery Controls</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Search, filter, and organize your images
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Folder Select */}
                  <Select value={selectedFolder} onValueChange={handleFolderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFolders.map((folder) => (
                        <SelectItem key={folder.value} value={folder.value}>
                          {folder.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort Select */}
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Upload Button */}
                  <Button className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Images
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Error State */}
          {error && (
            <motion.section 
              className="mb-8 sm:mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="overflow-hidden hover-lift rounded-2xl border-red-500 w-full">
                <CardContent className="pt-6">
                  <div className="text-red-400 text-center">
                    <p className="font-semibold">Error Loading Images</p>
                    <p className="text-sm mt-1">{error}</p>
                    <Button 
                      onClick={fetchImages} 
                      className="mt-4"
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Gallery Stats */}
          {!loading && !error && (
            <motion.div 
              className="mb-6 text-sm text-muted-foreground text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  Showing {filteredImages.length} of {images.length} images
                </span>
                {searchTerm && (
                  <span className="text-primary">
                    matching "{searchTerm}"
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Photo Grid */}
          <motion.section 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <PhotoList images={filteredImages} loading={loading} />
          </motion.section>
        </div>
      </main>
    </div>
  );
} 