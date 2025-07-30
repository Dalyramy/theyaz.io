import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  is_admin?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface ProfileUpdate {
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
}

// Authentication service
export class AuthService {
  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email || '',
        username: profile?.username,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
        bio: profile?.bio,
        is_admin: profile?.is_admin || false
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Sign up
  static async signUp(credentials: RegisterCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      })

      if (signUpError || !user) {
        return { user: null, error: signUpError?.message || 'Sign up failed' }
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: `${credentials.firstName.toLowerCase()}${credentials.lastName.toLowerCase()}`,
          full_name: `${credentials.firstName} ${credentials.lastName}`,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't fail the signup if profile creation fails
      }

      return {
        user: {
          id: user.id,
          email: user.email || '',
          username: `${credentials.firstName.toLowerCase()}${credentials.lastName.toLowerCase()}`,
          full_name: `${credentials.firstName} ${credentials.lastName}`,
        },
        error: null
      }
    } catch (error) {
      console.error('Error during sign up:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Sign in
  static async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error || !user) {
        return { user: null, error: error?.message || 'Sign in failed' }
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        user: {
          id: user.id,
          email: user.email || '',
          username: profile?.username,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          bio: profile?.bio,
          is_admin: profile?.is_admin || false
        },
        error: null
      }
    } catch (error) {
      console.error('Error during sign in:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      console.error('Error during sign out:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Update profile
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      return { error: error?.message || null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error: error?.message || null }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Get session
  static async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        return null
      }
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }
} 