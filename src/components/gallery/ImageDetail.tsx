import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Download, Share2, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

interface CloudinaryImage {
  public_id: string;
  filename: string;
  created_at: string;
  width: number;
  height: number;
  secure_url: string;
  bytes: number;
  format: string;
  resource_type: string;
}

interface ImageDetailProps {
  image: CloudinaryImage;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function ImageDetail({ 
  image, 
  onNavigate, 
  hasPrev = false, 
  hasNext = false 
}: ImageDetailProps) {
  const navigate = useNavigate();
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!onNavigate) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          if (hasPrev) {
            event.preventDefault();
            onNavigate('prev');
          }
          break;
        case 'ArrowRight':
          if (hasNext) {
            event.preventDefault();
            onNavigate('next');
          }
          break;
        case 'Escape':
          event.preventDefault();
          navigate(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, hasPrev, hasNext, navigate]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.secure_url;
    link.download = image.filename || `${image.public_id}.${image.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.filename || 'Gallery Image',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
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
        {/* Navigation Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="relative group">
                <motion.img
                  src={image.secure_url}
                  className="w-full rounded-xl shadow-2xl border border-border"
                  alt={image.filename || image.public_id.split('/').pop() || 'Gallery image'}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  loading="eager"
                />
                
                {/* Image Overlay Info */}
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
                    {image.width} × {image.height}
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {onNavigate && (
                  <>
                    {hasPrev && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onNavigate('prev')}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        >
                          <ArrowLeft className="w-6 h-6" />
                        </Button>
                      </motion.div>
                    )}
                    {hasNext && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onNavigate('next')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        >
                          <ArrowRight className="w-6 h-6" />
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
                
                {/* Navigation Progress */}
                {onNavigate && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                      Use ← → arrows or click to navigate
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Details */}
            <div className="space-y-6">
              <Card className="overflow-hidden hover-lift rounded-2xl border-border">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    <CardTitle className="text-lg sm:text-2xl">Image Details</CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    Technical information about this image
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {image.filename || image.public_id.split('/').pop()}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {image.public_id}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {new Date(image.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Dimensions:</span>
                        <p className="text-foreground">{image.width} × {image.height}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Format:</span>
                        <p className="text-foreground uppercase">{image.format}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">File Size:</span>
                        <p className="text-foreground">{formatFileSize(image.bytes)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="text-foreground capitalize">{image.resource_type}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="overflow-hidden hover-lift rounded-2xl border-border">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="w-6 h-6 text-primary" />
                    <CardTitle className="text-lg sm:text-2xl">Quick Actions</CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    Download and share this image
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleDownload}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Original
                  </Button>
                  <Button 
                    onClick={handleShare}
                    className="w-full"
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Image
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 