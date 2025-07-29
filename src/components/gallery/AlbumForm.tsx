import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Camera, Image, Palette, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AlbumFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (albumData: { title: string; description: string }) => Promise<void>;
  initialData?: { title: string; description: string };
  mode: 'create' | 'edit';
}

const AlbumForm: React.FC<AlbumFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: '', description: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter an album title');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ title: '', description: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting album:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ title: '', description: '' });
      onClose();
    }
  };

  const getAlbumIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('nature')) return '🌿';
    if (titleLower.includes('portrait')) return '👤';
    if (titleLower.includes('street')) return '🏙️';
    if (titleLower.includes('architecture')) return '🏛️';
    if (titleLower.includes('abstract')) return '🎨';
    if (titleLower.includes('minimal')) return '⚪';
    if (titleLower.includes('black')) return '⚫';
    if (titleLower.includes('color')) return '🌈';
    return '📸';
  };

  const suggestedAlbums = [
    { title: 'Travel Adventures', description: 'Capturing memories from around the world', icon: '✈️' },
    { title: 'Food & Cuisine', description: 'Delicious dishes and culinary experiences', icon: '🍽️' },
    { title: 'Pets & Animals', description: 'Furry friends and wildlife encounters', icon: '🐾' },
    { title: 'Events & Celebrations', description: 'Special moments and gatherings', icon: '🎉' },
    { title: 'Art & Creativity', description: 'Creative expressions and artistic shots', icon: '🎨' },
    { title: 'Technology & Innovation', description: 'Modern gadgets and tech photography', icon: '💻' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {mode === 'create' ? 'Create New Album' : 'Edit Album'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="album-title">Album Title *</Label>
              <Input
                id="album-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your album"
                className="mt-1"
                required
              />
              {formData.title && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {getAlbumIcon(formData.title)} {formData.title}
                  </Badge>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="album-description">Description</Label>
              <Textarea
                id="album-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this album is about..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {mode === 'create' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Suggested Album Ideas
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedAlbums.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 text-left"
                    onClick={() => setFormData({
                      title: suggestion.title,
                      description: suggestion.description
                    })}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{suggestion.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">
                          {suggestion.title}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {suggestion.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              Album Tips
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use descriptive titles to help others discover your work</li>
              <li>• Add a description to explain the theme or story behind your photos</li>
              <li>• You can always edit your album later</li>
              <li>• Photos uploaded to this album will appear here automatically</li>
            </ul>
          </div>
        </form>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Album' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlbumForm; 