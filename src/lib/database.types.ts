export type GoalCategory = 'TRAVEL' | 'CREATIVE' | 'SKILLS' | 'ADRENALINE'
export type GoalPriority = 'high' | 'normal'
export type GoalStatus = 'active' | 'completed'
export type CollaborationStatus = 'pending' | 'accepted'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  is_public: boolean
  created_at: string
}

export interface GoalRow {
  id: string
  owner_id: string
  title: string
  description: string | null
  category: GoalCategory
  priority: GoalPriority
  status: GoalStatus
  progress: number
  target_date: string | null
  completed_at: string | null
  is_collaborative: boolean
  cloned_from: string | null
  created_at: string
  imageUrl?: string
}

export interface GoalFormValues {
  title: string
  description: string
  category: GoalCategory
  priority: GoalPriority
  progress: number
  target_date: string
}

export interface GoalCollaboratorRow {
  id: string
  goal_id: string
  user_id: string
  status: CollaborationStatus
  invited_by: string
  created_at: string
}
