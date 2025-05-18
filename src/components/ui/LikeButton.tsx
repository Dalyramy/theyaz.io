import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showBurst, setShowBurst] = useState(false);

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
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 600);
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

  // Burst animation variants
  const burstVariants = {
    initial: { scale: 0, opacity: 1 },
    animate: (i: number) => ({
      scale: [0, 1.2, 1],
      opacity: [1, 1, 0],
      x: 24 * Math.cos((i / 6) * 2 * Math.PI),
      y: 24 * Math.sin((i / 6) * 2 * Math.PI),
      transition: { duration: 0.6, ease: 'easeOut' },
    }),
    exit: { opacity: 0 },
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "flex items-center gap-1 transition-all duration-200 group relative overflow-visible",
        isLoading && "opacity-50 cursor-not-allowed",
        !user && "hover:text-primary"
      )}
      onClick={handleClick}
      disabled={isLoading}
      title={!user ? "Sign in to like photos" : undefined}
    >
      <span className="relative inline-block">
        <Heart
          className={cn(
            'h-5 w-5 transition-all duration-200',
            isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-500 group-hover:text-red-500/70',
            isLoading && 'animate-pulse'
          )}
        />
        <AnimatePresence>
          {showBurst &&
            Array.from({ length: 6 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full bg-red-400 pointer-events-none"
                style={{ zIndex: 1, marginLeft: -4, marginTop: -4 }}
                custom={i}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={burstVariants}
              />
            ))}
        </AnimatePresence>
      </span>
      <span className="text-sm">{count}</span>
    </Button>
  );
} 