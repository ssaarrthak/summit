import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/database.types'

export type AuthActionError = string | null

export interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<AuthActionError>
  signIn: (email: string, password: string) => Promise<AuthActionError>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
