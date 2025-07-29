import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';

interface Comment {
  id: string;
  photo_id: string;
  user_id: string;
  user: {
    name: string;
    avatar_url: string;
  };
  content: string;
  created_at: string;
  likes: number;
}

interface PhotoCommentsProps {
  photoId: string;
  className?: string;
}

const PhotoComments = ({ photoId, className = '' }: PhotoCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch comments
  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ['comments', photoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          photo_id,
          user_id,
          user:users(name, avatar_url),
          content,
          created_at,
          likes
        `)
        .eq('photo_id', photoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  // Fetch which comments the current user has liked
  const { data: likedComments = [] } = useQuery({
    queryKey: ['comment_likes', photoId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', comments.map(c => c.id));
      if (error) throw error;
      return data?.map(like => like.comment_id) || [];
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            photo_id: photoId,
            content,
            // Note: user_id would come from auth context in a real app
            user_id: 'demo-user',
          },
        ])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Like/unlike comment mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) return;
      if (likedComments.includes(commentId)) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
      queryClient.invalidateQueries({ queryKey: ['comment_likes', photoId, user?.id] });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Comments are temporarily unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Comment input */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-full"
            disabled={addCommentMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="rounded-full px-6"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4" data-testid="comments-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-3 items-start"
                >
                  <Avatar>
                    <Link to={comment.user.name ? `/profile/${comment.user.name}` : '#'}>
                      <AvatarImage src={comment.user.avatar_url} />
                      <AvatarFallback>
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Link>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Link to={comment.user.name ? `/profile/${comment.user.name}` : '#'} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors">
                          {comment.user.name}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <button
                        onClick={() => toggleLikeMutation.mutate(comment.id)}
                        className={`flex items-center gap-1 transition-colors hover:text-emerald-600 ${likedComments.includes(comment.id) ? 'text-emerald-600' : ''}`}
                        disabled={!user}
                      >
                        <Heart className={`h-4 w-4 ${likedComments.includes(comment.id) ? 'fill-current' : ''}`} />
                        <span className="text-xs">{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && comments.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoComments; 