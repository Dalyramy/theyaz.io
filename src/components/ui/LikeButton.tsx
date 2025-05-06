import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LikeButtonProps {
  photoId: string;
  initialLiked?: boolean;
  likeCount: number;
  onLike: (photoId: string) => Promise<void>;
  onUnlike: (photoId: string) => Promise<void>;
}

export function LikeButton({
  photoId,
  initialLiked = false,
  likeCount,
  onLike,
  onUnlike,
}: LikeButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when props change
  useEffect(() => {
    setIsLiked(initialLiked);
    setCount(likeCount);
  }, [initialLiked, likeCount]);

  const handleClick = async () => {
    if (!user) {
      toast('Please sign in to like photos', {
        action: {
          label: 'Sign In',
          onClick: () => navigate('/login')
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        await onUnlike(photoId);
        setCount((prev) => prev - 1);
        toast.success('Removed like');
      } else {
        await onLike(photoId);
        setCount((prev) => prev + 1);
        toast.success('Added like');
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
      // Reset to previous state
      setIsLiked(initialLiked);
      setCount(likeCount);
    }
    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-1 transition-all duration-200 group",
        isLoading && "opacity-50 cursor-not-allowed",
        !user && "hover:text-primary"
      )}
      onClick={handleClick}
      disabled={isLoading}
      title={!user ? "Sign in to like photos" : undefined}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all duration-200',
          isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-500 group-hover:text-red-500/70',
          isLoading && 'animate-pulse'
        )}
      />
      <span className="text-sm">{count}</span>
    </Button>
  );
} 