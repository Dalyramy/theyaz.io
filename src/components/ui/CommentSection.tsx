import { useState } from 'react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Comment } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Link } from 'react-router-dom';
import UserProfileLink from './UserProfileLink';

interface CommentSectionProps {
  photoId: string;
  comments: Comment[];
  onAddComment: (photoId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  currentUserId: string | null;
}

export function CommentSection({
  photoId,
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setIsSubmitting(true);
    try {
      await onAddComment(photoId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSubmitting || !newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Please sign in to leave a comment.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <UserProfileLink user={comment.user_profile} avatarClassName="h-8 w-8" nameClassName="text-sm font-medium" />
              </div>
              {currentUserId === comment.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteComment(comment.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm pl-10">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 