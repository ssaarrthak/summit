import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import type { GoalFormValues, GoalRow } from '@/lib/database.types'

export function useGoals() {
  const { session } = useAuth()
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const load = async () => {
      const { data, error: err } = await supabase
        .from('goals')
        .select('*')
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

  const cloneGoal = async (goal: GoalRow, sourceUsername: string) => {
    if (!session) return null
    const { data, error: err } = await supabase
      .from('goals')
      .insert({
        title: goal.title,
        description: goal.description ?? '',
        category: goal.category,
        priority: goal.priority,
        progress: 0,
        target_date: goal.target_date ?? '',
        status: 'active',
        owner_id: session.user.id,
        cloned_from: sourceUsername,
      })
      .select()
      .single()
    if (err) {
      setError(err.message)
      return null
    }
    return data as GoalRow
  }

  return { goals: session ? goals : [], loading, error, addGoal, updateGoal, deleteGoal, toggleStatus, cloneGoal }
}
