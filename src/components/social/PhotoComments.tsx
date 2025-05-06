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

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ likes: comments.find(c => c.id === commentId)?.likes + 1 })
        .eq('id', commentId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading comments</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Comment input */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!newComment.trim() || addCommentMutation.isPending}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Post
        </Button>
      </form>

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
                    <AvatarImage src={comment.user.avatar_url} />
                    <AvatarFallback>
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="font-medium text-sm mb-1">{comment.user.name}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <button
                        onClick={() => likeCommentMutation.mutate(comment.id)}
                        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        {comment.likes}
                      </button>
                      <span className="text-xs">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!isLoading && comments.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoComments; 