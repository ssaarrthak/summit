import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { GoalRow, Profile } from '@/lib/database.types'

export type PublicProfileWithCount = Profile & { goals: { count: number }[] }

export function usePublicList(username: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    let cancelled = false
    const load = async () => {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle()
      if (cancelled) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      if (!data) {
        setError('not-found')
        setLoading(false)
        return
      }
      const ownerProfile = data as Profile
      setProfile(ownerProfile)
      const { data: goalsData, error: gErr } = await supabase
        .from('goals')
        .select('*')
        .eq('owner_id', ownerProfile.id)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (gErr) {
        setError(gErr.message)
        setLoading(false)
        return
      }
      setGoals((goalsData ?? []) as GoalRow[])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [username])

  return { profile, goals, loading, error }
}

export function usePublicProfiles() {
  const [profiles, setProfiles] = useState<PublicProfileWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*, goals(count)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      setProfiles((data ?? []) as PublicProfileWithCount[])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { profiles, loading, error }
}
