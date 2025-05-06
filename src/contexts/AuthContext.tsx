import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

// Define response types for Supabase auth methods
type SignUpResponse = Awaited<ReturnType<typeof supabase.auth.signUp>>
type SignInResponse = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>
type SignOutResponse = Awaited<ReturnType<typeof supabase.auth.signOut>>

interface AuthContextType {
  user: User | null
  signUp: (email: string, password: string) => Promise<SignUpResponse>
  signIn: (email: string, password: string) => Promise<SignInResponse>
  signOut: () => Promise<SignOutResponse>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signUp = (email: string, password: string) => {
    return supabase.auth.signUp({ email, password })
  }

  const signIn = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = () => {
    return supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 