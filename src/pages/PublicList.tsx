import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GoalCard } from '@/components/goals'
import { Footer, NavBar } from '@/components/layout'
import { Badge } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useGoals } from '@/hooks/useGoals'
import { usePublicList } from '@/hooks/usePublicList'
import type { GoalRow } from '@/lib/database.types'

function formatMemberSince(iso: string): string {
  return String(new Date(iso).getFullYear())
}

interface PublicListProps {
  username: string
}

export default function PublicList({ username }: PublicListProps) {
  const { session } = useAuth()
  const { cloneGoal, cloning, error: cloneError } = useGoals()
  const { profile, goals, loading, error } = usePublicList(username)
  const [clonedIds, setClonedIds] = useState<Set<string>>(new Set())

  const isOwnView = profile?.id === session?.user.id
  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const isPrivate = profile !== null && !profile.is_public && !isOwnView

  const handleClone = async (goal: GoalRow) => {
    if (!profile) return
    const result = await cloneGoal(goal, profile.username)
    if (result === 'ok' || result === 'duplicate') {
      setClonedIds((prev) => new Set(prev).add(goal.id))
    }
  }

  const initial = (profile?.display_name?.[0] ?? profile?.username?.[0] ?? 'S').toUpperCase()

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <NavBar completedCount={0} totalCount={0} />

      <main className="w-full min-h-[calc(100vh-4rem)] flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">
                progress_activity
              </span>
            </div>
          ) : error === 'not-found' ? (
            <div className="rounded-xl border border-dashed border-outline-variant/60 p-12 text-center">
              <Icon className="text-3xl text-on-surface-variant" name="search_off" />
              <h1 className="mt-3 text-2xl font-semibold leading-8 tracking-tight text-on-surface">
                No bucket list found for @{username}.
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">Check the username or explore other lists.</p>
              <Link
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-on-surface"
                to="/explore"
              >
                Explore Inspiration
                <Icon className="text-[14px]" name="arrow_forward" />
              </Link>
            </div>
          ) : isPrivate ? (
            <div className="rounded-xl border border-dashed border-outline-variant/60 p-12 text-center">
              <Icon className="text-3xl text-on-surface-variant" name="lock" />
              <h1 className="mt-3 text-2xl font-semibold leading-8 tracking-tight text-on-surface">
                This bucket list is private.
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                The explorer has kept their summits to themselves.
              </p>
              <Link
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-on-surface"
                to="/explore"
              >
                Explore Inspiration
                <Icon className="text-[14px]" name="arrow_forward" />
              </Link>
            </div>
          ) : (
            profile && (
              <>
                <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high ring-1 ring-primary-container/30">
                      <span className="text-2xl font-semibold text-on-surface">{initial}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className="mb-1 w-fit" tone="amber">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-container shadow-sm shadow-primary-container/60" />
                        Public Bucket List
                      </Badge>
                      <h1 className="text-[34px] font-bold leading-[42px] tracking-tight text-on-surface">
                        {profile.display_name ?? profile.username}
                      </h1>
                      <p className="text-sm text-on-surface-variant">
                        @{profile.username} • exploring since {formatMemberSince(profile.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-3 shadow-sm dark:bg-surface-container-low">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                        Dreams
                      </span>
                      <span className="text-2xl font-bold leading-8 text-on-surface">{goals.length}</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-3 shadow-sm dark:bg-surface-container-low">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-success-olive dark:text-emerald-glow">
                        Conquered
                      </span>
                      <span className="text-2xl font-bold leading-8 text-success-olive dark:text-emerald-glow">
                        {completedGoals.length}
                      </span>
                    </div>
                  </div>
                </div>

                {isOwnView && (
                  <div className="mb-8 flex items-center gap-2 rounded-lg border border-primary-container/30 bg-amber-deep/10 px-4 py-2.5 text-sm text-primary">
                    <Icon className="text-[18px]" name="visibility" />
                    This is how others see your list — manage it from your dashboard.
                  </div>
                )}

                {cloneError && (
                  <div className="mb-6 rounded-lg border border-error/30 bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container dark:bg-error/15 dark:text-error">
                    {cloneError}
                  </div>
                )}

                <section className="mb-8 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">
                      Active Horizons
                    </h2>
                    <Badge tone="amber">{activeGoals.length} in flight</Badge>
                  </div>
                  <div className="flex flex-col gap-4">
                    {activeGoals.map((goal) => (
                      <GoalCard
                        cloning={cloning}
                        cloned={clonedIds.has(goal.id)}
                        goal={goal}
                        key={goal.id}
                        onClone={isOwnView ? undefined : handleClone}
                        readOnly
                      />
                    ))}
                    {activeGoals.length === 0 && (
                      <div className="rounded-xl border border-dashed border-outline-variant/60 p-8 text-center text-sm text-on-surface-variant">
                        No active aspirations right now.
                      </div>
                    )}
                  </div>
                </section>

                <div className="mb-8 h-px w-full bg-outline-variant/50" />

                <section className="mb-8 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Icon className="text-2xl text-success-olive dark:text-emerald-glow" name="verified" />
                    <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">
                      Conquered Summits
                    </h2>
                    <Badge tone="success">{completedGoals.length} summits sealed</Badge>
                  </div>
                  <div className="flex flex-col gap-4">
                    {completedGoals.map((goal) => (
                      <GoalCard
                        cloning={cloning}
                        cloned={clonedIds.has(goal.id)}
                        goal={goal}
                        key={goal.id}
                        onClone={isOwnView ? undefined : handleClone}
                        readOnly
                      />
                    ))}
                    {completedGoals.length === 0 && (
                      <div className="rounded-xl border border-dashed border-outline-variant/60 p-8 text-center text-sm text-on-surface-variant">
                        No conquered summits yet.
                      </div>
                    )}
                  </div>
                </section>
              </>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
