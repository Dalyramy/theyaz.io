'use client'

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, Tag, Camera, Sparkles } from 'lucide-react';
import PeaceWatermark from '@/components/ui/PeaceWatermark';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PhotoService } from '@/lib/photos';
import { useRouter } from 'next/navigation';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function UploadPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await PhotoService.uploadPhoto({
        title: formData.title,
        caption: formData.caption,
        image: selectedFile,
        tags: tags.length > 0 ? tags : undefined,
      }, user.id);

      if (result.error) {
        setError(result.error);
      } else {
        // Redirect to gallery on success
        router.push('/gallery');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <PeaceWatermark />
      
      <main className="container mx-auto py-6 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="overflow-hidden hover-lift rounded-2xl border-border">
            <CardHeader className="text-center pb-6">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('upload.share_work', 'Share Your Work')}
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">
                {t('upload.title', 'Upload Photo')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('upload.description', 'Share your photography with the community')}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <Label htmlFor="photo">{t('upload.select_photo', 'Select Photo')}</Label>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeFile}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {t('upload.drag_drop', 'Drag and drop your image here, or click to browse')}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {t('upload.browse', 'Browse Files')}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('upload.file_types', 'PNG, JPG, GIF up to 5MB')}
                        </p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      aria-label="Select photo file"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">{t('upload.photo_title', 'Photo Title')} *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={t('upload.title_placeholder', 'Enter a descriptive title...')}
                    required
                  />
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <Label htmlFor="caption">{t('upload.caption', 'Caption')}</Label>
                  <Textarea
                    id="caption"
                    name="caption"
                    value={formData.caption}
                    onChange={handleInputChange}
                    placeholder={t('upload.caption_placeholder', 'Tell the story behind this photo...')}
                    rows={3}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">
                    <Tag className="h-4 w-4 inline mr-1" />
                    {t('upload.tags', 'Tags')}
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder={t('upload.tags_placeholder', 'nature, landscape, sunset (comma separated)')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('upload.tags_help', 'Add tags to help others discover your photo')}
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !selectedFile || !formData.title.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('upload.uploading', 'Uploading...')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-2" />
                      {t('upload.upload_photo', 'Upload Photo')}
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 