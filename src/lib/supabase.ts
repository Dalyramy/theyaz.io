import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjrysayswbdqskynywkr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcnlzYXlzd2JkcXNreW55d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzkwNDgsImV4cCI6MjA2ODg1NTA0OH0.feYjlWxRpKk3q7Lp9fKMSv7Om5YKi0OLOIqelRF5pCA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (optional but recommended)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          is_admin: boolean | null
          updated_at: string
          created_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_admin?: boolean | null
          updated_at?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_admin?: boolean | null
          updated_at?: string
          created_at?: string | null
        }
      }
      photos: {
        Row: {
          id: string
          title: string
          caption: string | null
          image_url: string
          image_path: string
          tags: string[] | null
          likes_count: number | null
          comments_count: number | null
          user_id: string | null
          album_id: string | null
          created_at: string | null
          updated_at: string | null
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          title: string
          caption?: string | null
          image_url: string
          image_path: string
          tags?: string[] | null
          likes_count?: number | null
          comments_count?: number | null
          user_id?: string | null
          album_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          title?: string
          caption?: string | null
          image_url?: string
          image_path?: string
          tags?: string[] | null
          likes_count?: number | null
          comments_count?: number | null
          user_id?: string | null
          album_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          thumbnail_url?: string | null
        }
      }
      albums: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string | null
          category_id: string | null
          cover_photo_id: string | null
          is_featured: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id?: string | null
          category_id?: string | null
          cover_photo_id?: string | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string | null
          category_id?: string | null
          cover_photo_id?: string | null
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
} 