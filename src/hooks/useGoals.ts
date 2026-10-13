import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import type { GoalFormValues, GoalRow } from '@/lib/database.types'

export function useGoals() {
  const { session } = useAuth()
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cloning, setCloning] = useState(false)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const load = async () => {
      const { data, error: err } = await supabase
        .from('goals')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (err) setError(err.message)
      else {
        setGoals((data ?? []) as GoalRow[])
        setError(null)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session])

  const addGoal = async (input: GoalFormValues) => {
    if (!session) return null
    const { data, error: err } = await supabase
      .from('goals')
      .insert({ ...input, owner_id: session.user.id })
      .select()
      .single()
    if (err) {
      setError(err.message)
      return null
    }
    setGoals((gs) => [data as GoalRow, ...gs])
    return data as GoalRow
  }

  const updateGoal = async (id: string, updates: Partial<GoalRow>) => {
    const { data, error: err } = await supabase.from('goals').update(updates).eq('id', id).select().single()
    if (err) {
      setError(err.message)
      return null
    }
    setGoals((gs) => gs.map((g) => (g.id === id ? (data as GoalRow) : g)))
    return data as GoalRow
  }

  const deleteGoal = async (id: string) => {
    const { error: err } = await supabase.from('goals').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return false
    }
    setGoals((gs) => gs.filter((g) => g.id !== id))
    return true
  }

  const toggleStatus = async (goal: GoalRow) => {
    const toCompleted = goal.status === 'active'
    await updateGoal(goal.id, {
      status: toCompleted ? 'completed' : 'active',
      completed_at: toCompleted ? new Date().toISOString() : null,
    })
  }

  const cloneGoal = async (goal: GoalRow, sourceUsername: string): Promise<'ok' | 'duplicate' | 'error'> => {
    if (!session || cloning) return 'error'
    setCloning(true)
    try {
      const { data: existing } = await supabase
        .from('goals')
        .select('id')
        .eq('owner_id', session.user.id)
        .eq('cloned_from', sourceUsername)
        .eq('title', goal.title)
        .maybeSingle()
      if (existing) return 'duplicate'
      const { error: err } = await supabase
        .from('goals')
        .insert({
          title: goal.title,
          description: goal.description ?? '',
          category: goal.category,
          priority: goal.priority,
          progress: 0,
          target_date: goal.target_date ?? '',
          status: 'active',
          visibility: 'private',
          owner_id: session.user.id,
          cloned_from: sourceUsername,
        })
      if (err) {
        setError(err.message)
        return 'error'
      }
      return 'ok'
    } finally {
      setCloning(false)
    }
  }

  return {
    goals: session ? goals : [],
    loading,
    error,
    cloning,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleStatus,
    cloneGoal,
  }
}
