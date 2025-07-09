import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced error handling
const handleError = (error: unknown, context: string) => {
  console.error(`${context} error:`, error);
  let message = 'An unexpected error occurred';
  
  if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  }
  
  toast.error(`${context}: ${message}`);
  return message;
};

// Photo API functions
export const photoAPI = {
  // Get photos with pagination and search
  async getPhotos(page = 1, limit = 12, search?: string, userId?: string) {
    try {
      let query = supabase
        .from('photos')
        .select(`
          id, title, caption, image_url, created_at, tags, likes_count, comments_count,
          user_id, profiles(id, username, avatar_url, full_name)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,caption.ilike.%${search}%`);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      handleError(error, 'Failed to load photos');
      return { data: [], count: 0 };
    }
  },

  // Get trending photos
  async getTrendingPhotos(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          id, title, caption, image_url, created_at, likes_count,
          user_id, profiles(id, username, avatar_url, full_name)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'Failed to load trending photos');
      return [];
    }
  },

  // Get single photo with details
  async getPhoto(id: string) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles(id, username, avatar_url, full_name),
          comments(
            id, content, created_at,
            profiles(id, username, avatar_url, full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Failed to load photo');
      return null;
    }
  },

  // Upload photo
  async uploadPhoto(photoData: {
    title: string;
    caption?: string;
    image_url: string;
    image_path: string;
    tags?: string[];
  }) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .insert([photoData])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Photo uploaded successfully!');
      return data;
    } catch (error) {
      handleError(error, 'Failed to upload photo');
      return null;
    }
  },

  // Update photo
  async updatePhoto(id: string, updates: Partial<{
    title: string;
    caption: string;
    tags: string[];
  }>) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Photo updated successfully!');
      return data;
    } catch (error) {
      handleError(error, 'Failed to update photo');
      return null;
    }
  },

  // Delete photo
  async deletePhoto(id: string) {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Photo deleted successfully!');
      return true;
    } catch (error) {
      handleError(error, 'Failed to delete photo');
      return false;
    }
  }
};

// User API functions
export const userAPI = {
  // Get user profile
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'Failed to load profile');
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<{
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
  }>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      handleError(error, 'Failed to update profile');
      return null;
    }
  },

  // Get user statistics
  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('id, likes_count, comments_count')
        .eq('user_id', userId);

      if (error) throw error;
      
      const photos = data || [];
      const totalPhotos = photos.length;
      const totalLikes = photos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0);
      const totalComments = photos.reduce((sum, photo) => sum + (photo.comments_count || 0), 0);
      const avgLikesPerPhoto = totalPhotos > 0 ? totalLikes / totalPhotos : 0;

      return {
        total_photos: totalPhotos,
        total_likes: totalLikes,
        total_comments: totalComments,
        avg_likes_per_photo: avgLikesPerPhoto
      };
    } catch (error) {
      handleError(error, 'Failed to load user statistics');
      return null;
    }
  }
};

// Social API functions
export const socialAPI = {
  // Like/unlike photo
  async toggleLike(photoId: string, userId: string) {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', userId);

        if (error) throw error;
        toast.success('Photo unliked');
        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([{ photo_id: photoId, user_id: userId }]);

        if (error) throw error;
        toast.success('Photo liked!');
        return true;
      }
    } catch (error) {
      handleError(error, 'Failed to update like');
      return null;
    }
  },

  // Add comment
  async addComment(photoId: string, userId: string, content: string) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          photo_id: photoId,
          user_id: userId,
          content
        }])
        .select(`
          *,
          profiles(id, username, avatar_url, full_name)
        `)
        .single();

      if (error) throw error;
      
      toast.success('Comment added!');
      return data;
    } catch (error) {
      handleError(error, 'Failed to add comment');
      return null;
    }
  },

  // Delete comment
  async deleteComment(commentId: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      
      toast.success('Comment deleted');
      return true;
    } catch (error) {
      handleError(error, 'Failed to delete comment');
      return false;
    }
  }
};

// Search API functions
export const searchAPI = {
  // Search photos with full-text search
  async searchPhotos(query: string, page = 1, limit = 12) {
    try {
      const { data, error, count } = await supabase
        .from('photos')
        .select(`
          id, title, caption, image_url, created_at, tags, likes_count,
          user_id, profiles(id, username, avatar_url, full_name)
        `, { count: 'exact' })
        .textSearch('search_vector', query)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      handleError(error, 'Failed to search photos');
      return { data: [], count: 0 };
    }
  }
};
