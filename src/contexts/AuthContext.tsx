'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, type AuthUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  updateProfile: (updates: { username?: string; full_name?: string; avatar_url?: string; bio?: string }) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    AuthService.getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const authUser = await AuthService.getCurrentUser()
          setUser(authUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await AuthService.signIn({ email, password })
    if (!result.error) {
      setUser(result.user)
    }
    return { error: result.error }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const result = await AuthService.signUp({ email, password, firstName, lastName })
    if (!result.error) {
      setUser(result.user)
    }
    return { error: result.error }
  }

  const signOut = async () => {
    const result = await AuthService.signOut()
    if (!result.error) {
      setUser(null)
    }
    return { error: result.error }
  }

  const updateProfile = async (updates: { username?: string; full_name?: string; avatar_url?: string; bio?: string }) => {
    if (!user) return { error: 'No user logged in' }
    const result = await AuthService.updateProfile(user.id, updates)
    if (!result.error) {
      setUser({ ...user, ...updates })
    }
    return { error: result.error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
