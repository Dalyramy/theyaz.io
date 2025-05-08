import { useState, useEffect } from 'react';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { ShareButton } from './ShareButton';
import { Comment, Like } from '@/lib/types';
import { useAuth } from '@/contexts/useAuth';
import {
  toggleLike,
  getLikes,
  addComment,
  getComments,
  deleteComment,
} from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PhotoSocialFeaturesProps {
  photoId: string;
  photoUrl: string;
}

export function PhotoSocialFeatures({ photoId, photoUrl }: PhotoSocialFeaturesProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSocialData = async () => {
      try {
        setIsLoading(true);
        const [likesData, commentsData] = await Promise.all([
          getLikes(photoId),
          getComments(photoId),
        ]);
        setLikes(likesData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading social data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialData();
  }, [photoId]);

  const handleLike = async () => {
    if (!user) {
      toast('Please sign in to like photos', {
        action: {
          label: 'Sign In',
          onClick: () => navigate('/login')
        },
      });
      return;
    }

    const previousLikes = [...likes];
    try {
      const isLiked = await toggleLike(photoId);
      if (isLiked) {
        // Optimistically update the UI
        const newLike: Like = {
          id: 'temp-id',
          user_id: user.id,
          photo_id: photoId,
          created_at: new Date().toISOString(),
        };
        setLikes((prev) => [...prev, newLike]);
      } else {
        // Remove the like
        setLikes((prev) => prev.filter((like) => like.user_id !== user.id));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert to previous state instead of trying to fetch again
      setLikes(previousLikes);
      toast.error('Failed to update like');
    }
  };

  const handleComment = async (content: string) => {
    if (!user) {
      toast('Please sign in to comment', {
        action: {
          label: 'Sign In',
          onClick: () => navigate('/login')
        },
      });
      return;
    }

    try {
      const newComment = await addComment(photoId, content);
      setComments((prev) => [newComment, ...prev]);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (isLoading) {
    return <div>Loading social features...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <LikeButton
          photoId={photoId}
          initialLiked={likes.some((like) => like.user_id === user?.id)}
          likeCount={likes.length}
          onLike={() => handleLike()}
          onUnlike={() => handleLike()}
        />
        <ShareButton photoId={photoId} photoUrl={photoUrl} />
      </div>
      <CommentSection
        photoId={photoId}
        comments={comments}
        onAddComment={handleComment}
        onDeleteComment={handleDeleteComment}
        currentUserId={user?.id || null}
      />
    </div>
  );
}
