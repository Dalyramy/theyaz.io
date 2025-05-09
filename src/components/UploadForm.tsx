import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Image, X, Phone, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';

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
  const { user } = useAuth();

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
      const filePath = `${user.id}/${fileName}`;
      
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
        profile_id: user.id,
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

  return (
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
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Share Your iPhone Moment
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Logo size={16} className="drop-shadow-[0_0_8px_#3b82f6]" />
              Shot on iPhone 16 Pro Max
            </CardDescription>
          </motion.div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="image" className="text-sm font-medium">Photo</Label>
              <div 
                className="relative"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black"
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-white" />
                        <span className="text-sm font-medium text-white">iPhone 16 Pro Max</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={handleUploadClick}
                      className={cn(
                        "flex aspect-[4/5] w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200",
                        isDragging
                          ? "border-primary bg-primary/5 scale-[1.02]"
                          : "border-gray-200 hover:border-primary hover:bg-primary/5 dark:border-gray-700"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3 text-center p-8">
                        <div className={cn(
                          "rounded-full p-4 transition-colors",
                          isDragging ? "bg-primary/10" : "bg-gray-100 dark:bg-gray-800"
                        )}>
                          <Upload className={cn(
                            "h-6 w-6 transition-colors",
                            isDragging ? "text-primary" : "text-gray-400"
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isDragging ? "Drop your photo here" : "Click to upload or drag and drop"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            JPEG, PNG, or WebP up to 10MB
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your photo a title"
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                required
              />
            </motion.div>

            {/* Caption */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="caption" className="text-sm font-medium">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tell the story behind your photo"
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm resize-none"
                rows={4}
                required
              />
            </motion.div>

            {/* Tags */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by commas (e.g. nature, portrait, street)"
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Popular tags: #shotoniphone #iphonephotography #minimal #portrait
              </p>
            </motion.div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg"
            >
              {isSubmitting ? (
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.span
                    className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Uploading...
                </motion.div>
              ) : (
                <span className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Share Photo
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default UploadForm;
