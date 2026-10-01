import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/lib/database.types'
import { AuthContext } from '@/context/auth-context'
import type { AuthContextValue } from '@/context/auth-context'

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Incorrect email or password.'
  if (message.includes('already registered')) return 'An account with this email already exists.'
  if (message.includes('Database error saving new user'))
    return 'Could not create account — the username may be taken. Try another.'
  if (message.includes('Email not confirmed')) return 'Please confirm your email before signing in.'
  if (message.includes('Password should be at least'))
    return 'Password must be at least 6 characters.'
  return message
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const load = async () => {
      let p = await fetchProfile(session.user.id)
      if (!p && !cancelled) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        p = await fetchProfile(session.user.id)
      }
      if (!cancelled) setProfile(p)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session])

  const activeProfile = session ? profile : null

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (data) return 'That username is already taken.'
    if (error && error.code !== 'PGRST116') return error.message

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: displayName } },
    })
    if (signUpError) return translateAuthError(signUpError.message)
    return null
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return translateAuthError(error.message)
    return null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!session) return false
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single()
    if (error || !data) return false
    setProfile(data as Profile)
    return true
  }

  const value: AuthContextValue = { session, profile: activeProfile, loading, signUp, signIn, signOut, updateProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
