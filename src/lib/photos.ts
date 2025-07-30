import { supabase } from './supabase'

export interface Photo {
  id: string
  title: string
  caption?: string
  image_url: string
  image_path: string
  thumbnail_url?: string
  tags?: string[]
  likes_count: number
  comments_count: number
  user_id?: string
  album_id?: string
  created_at: string
  updated_at: string
}

export interface Album {
  id: string
  title: string
  description?: string
  user_id?: string
  category_id?: string
  cover_photo_id?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  cover_photo_id?: string
}

export interface PhotoUpload {
  title: string
  caption?: string
  image: File
  tags?: string[]
  album_id?: string
}

// Photo service
export class PhotoService {
  // Get all photos with pagination
  static async getPhotos(page: number = 1, limit: number = 20): Promise<{ photos: Photo[]; hasMore: boolean }> {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: photos, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching photos:', error)
        return { photos: [], hasMore: false }
      }

      const hasMore = photos.length === limit
      return { photos: photos || [], hasMore }
    } catch (error) {
      console.error('Error fetching photos:', error)
      return { photos: [], hasMore: false }
    }
  }

  // Get photo by ID
  static async getPhoto(id: string): Promise<Photo | null> {
    try {
      const { data: photo, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching photo:', error)
        return null
      }

      return photo
    } catch (error) {
      console.error('Error fetching photo:', error)
      return null
    }
  }

  // Upload photo
  static async uploadPhoto(upload: PhotoUpload, userId: string): Promise<{ photo: Photo | null; error: string | null }> {
    try {
      // Upload image to Supabase Storage
      const fileExt = upload.image.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, upload.image)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return { photo: null, error: uploadError.message }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      // Create photo record
      const { data: photo, error: insertError } = await supabase
        .from('photos')
        .insert({
          title: upload.title,
          caption: upload.caption,
          image_url: publicUrl,
          image_path: fileName,
          tags: upload.tags || [],
          user_id: userId,
          album_id: upload.album_id,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating photo record:', insertError)
        return { photo: null, error: insertError.message }
      }

      return { photo, error: null }
    } catch (error) {
      console.error('Error uploading photo:', error)
      return { photo: null, error: 'An unexpected error occurred' }
    }
  }

  // Delete photo
  static async deletePhoto(id: string, userId: string): Promise<{ error: string | null }> {
    try {
      // Get photo to delete from storage
      const { data: photo } = await supabase
        .from('photos')
        .select('image_path, user_id')
        .eq('id', id)
        .single()

      if (!photo) {
        return { error: 'Photo not found' }
      }

      // Check if user owns the photo or is admin
      if (photo.user_id !== userId) {
        return { error: 'Unauthorized' }
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([photo.image_path])

      if (storageError) {
        console.error('Error deleting from storage:', storageError)
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting photo:', deleteError)
        return { error: deleteError.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting photo:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Get albums
  static async getAlbums(): Promise<Album[]> {
    try {
      const { data: albums, error } = await supabase
        .from('albums')
        .select(`
          *,
          categories:category_id(name),
          cover_photo:cover_photo_id(image_url)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching albums:', error)
        return []
      }

      return albums || []
    } catch (error) {
      console.error('Error fetching albums:', error)
      return []
    }
  }

  // Get album by ID
  static async getAlbum(id: string): Promise<{ album: Album | null; photos: Photo[] }> {
    try {
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select(`
          *,
          categories:category_id(name),
          cover_photo:cover_photo_id(image_url)
        `)
        .eq('id', id)
        .single()

      if (albumError) {
        console.error('Error fetching album:', albumError)
        return { album: null, photos: [] }
      }

      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url)
        `)
        .eq('album_id', id)
        .order('created_at', { ascending: false })

      if (photosError) {
        console.error('Error fetching album photos:', photosError)
        return { album, photos: [] }
      }

      return { album, photos: photos || [] }
    } catch (error) {
      console.error('Error fetching album:', error)
      return { album: null, photos: [] }
    }
  }

  // Create album
  static async createAlbum(title: string, description?: string, userId?: string): Promise<{ album: Album | null; error: string | null }> {
    try {
      const { data: album, error } = await supabase
        .from('albums')
        .insert({
          title,
          description,
          user_id: userId,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating album:', error)
        return { album: null, error: error.message }
      }

      return { album, error: null }
    } catch (error) {
      console.error('Error creating album:', error)
      return { album: null, error: 'An unexpected error occurred' }
    }
  }

  // Get categories
  static async getCategories(): Promise<Category[]> {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      return categories || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Like/unlike photo
  static async toggleLike(photoId: string, userId: string): Promise<{ error: string | null }> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', userId)

        if (error) {
          console.error('Error unliking photo:', error)
          return { error: error.message }
        }
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            photo_id: photoId,
            user_id: userId,
          })

        if (error) {
          console.error('Error liking photo:', error)
          return { error: error.message }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Error toggling like:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Check if user liked photo
  static async isLiked(photoId: string, userId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('photo_id', photoId)
        .eq('user_id', userId)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }
} 