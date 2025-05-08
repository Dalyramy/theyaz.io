import { supabase } from '@/integrations/supabase/client';
import { Comment, Like } from './types';

async function checkAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error('Authentication error:', error);
    throw new Error('User not authenticated');
  }
  return user;
}

export async function toggleLike(photoId: string) {
  const user = await checkAuth();

  try {
    // First, check if the photo exists
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('id')
      .eq('id', photoId)
      .single();

    if (photoError) {
      console.error('Error checking photo:', photoError);
      throw new Error('Photo not found');
    }

    const { data: existingLike, error: fetchError } = await supabase
      .from('likes')
      .select()
      .eq('photo_id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing like:', fetchError);
      throw fetchError;
    }

    if (existingLike) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('photo_id', photoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting like:', error);
        throw error;
      }
      return false;
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ photo_id: photoId, user_id: user.id });

      if (error) {
        console.error('Error inserting like:', error);
        throw error;
      }
      return true;
    }
  } catch (error) {
    console.error('Error in toggleLike:', error);
    throw new Error('Failed to toggle like');
  }
}

export async function getLikes(photoId: string): Promise<Like[]> {
  try {
    if (!photoId) {
      throw new Error('Photo ID is required');
    }

    // First, check if the photo exists
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('id')
      .eq('id', photoId)
      .single();

    if (photoError) {
      console.error('Error checking photo:', photoError);
      throw new Error('Photo not found');
    }

    const { data: likes, error } = await supabase
      .from('likes')
      .select('*')
      .eq('photo_id', photoId);

    if (error) {
      console.error('Supabase error in getLikes:', error);
      throw error;
    }

    return (likes || []) as Like[];
  } catch (error) {
    console.error('Error in getLikes:', error);
    return [];
  }
}

export async function addComment(photoId: string, content: string): Promise<Comment> {
  const user = await checkAuth();

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        photo_id: photoId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  } catch (error) {
    console.error('Error in addComment:', error);
    throw new Error('Failed to add comment');
  }
}

export async function getComments(photoId: string): Promise<Comment[]> {
  try {
    // We need to fix the relationship between comments and profiles
    // Instead of using the join, we'll fetch comments and then fetch profiles separately
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get all unique user IDs
    const userIds = [...new Set((comments || []).map(comment => comment.user_id))];
    
    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }
    
    // Create a lookup map for profiles
    const profileMap = (profiles || []).reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {} as Record<string, { id: string; username?: string; avatar_url?: string }>);
    
    // Attach profile data to comments
    const commentsWithProfiles = (comments || []).map(comment => {
      const profile = profileMap[comment.user_id];
      return {
        ...comment,
        user_profile: profile ? {
          username: profile.username || 'Anonymous',
          avatar_url: profile.avatar_url
        } : {
          username: 'Anonymous',
          avatar_url: ''
        }
      };
    });
    
    return commentsWithProfiles as Comment[];
  } catch (error) {
    console.error('Error in getComments:', error);
    throw new Error('Failed to fetch comments');
  }
}

export async function deleteComment(commentId: string) {
  const user = await checkAuth();

  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id); // Ensure user can only delete their own comments

    if (error) throw error;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    throw new Error('Failed to delete comment');
  }
}
