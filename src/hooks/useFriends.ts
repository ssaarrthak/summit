import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/lib/database.types'

export interface FriendshipRow {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted'
  created_at: string
}

export interface FriendEntry {
  friendship: FriendshipRow
  profile: Profile
}

export function useFriends() {
  const { session } = useAuth()
  const [friends, setFriends] = useState<FriendEntry[]>([])
  const [incoming, setIncoming] = useState<FriendEntry[]>([])
  const [outgoing, setOutgoing] = useState<FriendEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const uid = session.user.id
    const load = async () => {
      const { data, error: err } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
      if (cancelled) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      const rows = (data ?? []) as FriendshipRow[]
      const otherIds = [...new Set(rows.map((r) => (r.requester_id === uid ? r.addressee_id : r.requester_id)))]
      let profiles: Profile[] = []
      if (otherIds.length > 0) {
        const { data: pData } = await supabase.from('profiles').select('*').in('id', otherIds)
        if (cancelled) return
        profiles = (pData ?? []) as Profile[]
      }
      const profileMap = new Map(profiles.map((p) => [p.id, p]))
      const entries: FriendEntry[] = []
      for (const row of rows) {
        const otherId = row.requester_id === uid ? row.addressee_id : row.requester_id
        const profile = profileMap.get(otherId)
        if (profile) entries.push({ friendship: row, profile })
      }
      if (cancelled) return
      setFriends(entries.filter((e) => e.friendship.status === 'accepted'))
      setIncoming(entries.filter((e) => e.friendship.status === 'pending' && e.friendship.addressee_id === uid))
      setOutgoing(entries.filter((e) => e.friendship.status === 'pending' && e.friendship.requester_id === uid))
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session])

  const searchUsers = async (query: string): Promise<Profile[]> => {
    const trimmed = query.trim()
    if (trimmed.length < 2 || !session) return []
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.*${trimmed}*,display_name.ilike.*${trimmed}*`)
      .neq('id', session.user.id)
      .limit(8)
    if (err) {
      setError(err.message)
      return []
    }
    return (data ?? []) as Profile[]
  }

  const sendFriendRequest = async (addressee: Profile): Promise<'ok' | 'duplicate' | 'error'> => {
    if (!session) return 'error'
    const { data, error: err } = await supabase
      .from('friendships')
      .insert({ requester_id: session.user.id, addressee_id: addressee.id })
      .select()
      .single()
    if (err) {
      if (err.code === '23505') return 'duplicate'
      setError(err.message)
      return 'error'
    }
    setOutgoing((prev) => [...prev, { friendship: data as FriendshipRow, profile: addressee }])
    return 'ok'
  }

  const acceptFriendship = async (entry: FriendEntry): Promise<boolean> => {
    const { error: err } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', entry.friendship.id)
    if (err) {
      setError(err.message)
      return false
    }
    setIncoming((prev) => prev.filter((e) => e.friendship.id !== entry.friendship.id))
    setFriends((prev) => [...prev, { ...entry, friendship: { ...entry.friendship, status: 'accepted' } }])
    return true
  }

  const removeFriendship = async (entry: FriendEntry): Promise<boolean> => {
    const { error: err } = await supabase.from('friendships').delete().eq('id', entry.friendship.id)
    if (err) {
      setError(err.message)
      return false
    }
    setIncoming((prev) => prev.filter((e) => e.friendship.id !== entry.friendship.id))
    setOutgoing((prev) => prev.filter((e) => e.friendship.id !== entry.friendship.id))
    setFriends((prev) => prev.filter((e) => e.friendship.id !== entry.friendship.id))
    return true
  }

  return {
    friends,
    incoming,
    outgoing,
    loading,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendship,
    removeFriendship,
  }
}
