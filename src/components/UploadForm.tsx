import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Image, X, Phone, Camera, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { PhotoUploadGate } from '@/components/ui/PermissionGate';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const UploadForm = () => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  // Check if user has upload permission
  const canUpload = hasPermission('photos.create');

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB.';
    }
    return null;
  };

  const handleImageChange = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      // Generate preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setImageFile(file);

      // Clean up the object URL when component unmounts or when preview changes
      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canUpload) {
      toast.error('You do not have permission to upload photos.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Validate form
    if (!title || !caption || !imageFile || !user) {
      toast.error('Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Process tags
      const tagArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      // Generate unique filename
      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      // Generate date-based folder structure
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const filePath = `${year}/${month}/${day}/${user.id}/${fileName}`;
      
      toast.info('Uploading image...');
      
      // Upload to storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          contentType: imageFile.type,
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Save photo metadata to the database
      const photoData = {
        user_id: user.id,
        title,
        caption,
        tags: tagArray,
        image_url: publicUrl,
        image_path: filePath
      };
      
      const { data: insertedPhoto, error: photoError } = await supabase
        .from('photos')
        .insert(photoData)
        .select()
        .single();
      
      if (photoError) {
        throw photoError;
      }
      
      toast.success('Photo uploaded successfully!');
      setIsSubmitting(false);
      navigate(`/photo/${insertedPhoto.id}`);
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      let message = 'Unknown error';
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        message = (error as { message: string }).message;
      }
      toast.error(`Failed to upload image: ${message}`);
      setIsSubmitting(false);
    }
  };

  // If user doesn't have upload permission, show restricted access
  if (!canUpload) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-500" />
            Upload Restricted
          </CardTitle>
          <CardDescription>
            You don't have permission to upload photos. Please contact an administrator to request upload access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Upload functionality is restricted to users with appropriate permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PhotoUploadGate>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4 max-w-3xl"
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Upload className="h-6 w-6" />
                Upload a New Photo
              </CardTitle>
              <CardDescription>
                Share your moments with the community. Upload high-quality photos with descriptions and tags.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <Label htmlFor="image" className="text-base font-medium">
                  Photo
                </Label>
                
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-gray-300 dark:border-gray-600 hover:border-primary/50",
                    preview && "border-green-500 bg-green-50 dark:bg-green-900/20"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Upload image file"
                  />
                  
                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="space-y-4"
                      >
                        <div className="relative inline-block">
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-h-64 rounded-lg shadow-lg"
                          />
                                                      <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✓ Image selected successfully
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                          <Camera className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">
                            Drop your photo here or click to browse
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Supports JPEG, PNG, and WebP up to 10MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleUploadClick}
                          className="mt-4"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Form Fields */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter photo title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="caption">Caption *</Label>
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Describe your photo..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter tags separated by commas (e.g., nature, landscape, sunset)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tags help others discover your photos
                  </p>
                </div>
              </motion.div>
            </CardContent>

            <CardFooter>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3 w-full"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !imageFile || !title || !caption}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </PhotoUploadGate>
  );
};

export default UploadForm;
