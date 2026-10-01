import { useMemo, useState } from 'react'
import { Footer, NavBar } from '@/components/layout'
import { GoalCard, GoalFormModal, StatsCards } from '@/components/goals'
import { Badge, Button, FilterChip, Icon, Input, Select } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useGoals } from '@/hooks/useGoals'
import { CATEGORY_LABELS } from '@/lib/categories'
import type { GoalCategory, GoalFormValues, GoalRow } from '@/lib/database.types'

type FilterTab = 'all' | 'active' | 'priority'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { goals, loading, error, addGoal, updateGoal, deleteGoal, toggleStatus } = useGoals()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'ALL' | GoalCategory>('ALL')
  const [tab, setTab] = useState<FilterTab>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalRow | null>(null)

  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active'), [goals])
  const completedGoals = useMemo(() => goals.filter((g) => g.status === 'completed'), [goals])

  const query = search.toLowerCase().trim()
  const matchesBase = (g: GoalRow) =>
    (g.title + ' ' + (g.description ?? '')).toLowerCase().includes(query) &&
    (category === 'ALL' || g.category === category)
  const visibleActive = activeGoals.filter((g) => matchesBase(g) && (tab !== 'priority' || g.priority === 'high'))
  const visibleCompleted = tab === 'active' ? [] : completedGoals.filter(matchesBase)

  const handleCreate = async (values: GoalFormValues) => (await addGoal(values)) !== null

  const handleUpdate = async (values: GoalFormValues) => {
    if (!editingGoal) return false
    return (await updateGoal(editingGoal.id, values)) !== null
  }

  const handleDelete = async (goal: GoalRow) => {
    if (window.confirm(`Delete "${goal.title}" from your bucket list?`)) {
      await deleteGoal(goal.id)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingGoal(null)
  }

  const greeting = getGreeting()
  const firstName = profile?.display_name?.split(' ')[0] ?? profile?.username ?? 'there'

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <div className="pointer-events-none fixed left-1/4 top-0 -z-10 h-[350px] w-[600px] rounded-full bg-primary-container/5 blur-[140px]" />
      <div className="pointer-events-none fixed right-10 top-1/2 -z-10 h-[400px] w-[500px] rounded-full bg-accent-rust/5 blur-[160px]" />

      <NavBar completedCount={completedGoals.length} totalCount={goals.length} />

      <main className="w-full min-h-[calc(100vh-4rem)] flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-8 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="flex max-w-2xl flex-col gap-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone="amber">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-container shadow-sm shadow-primary-container/60" />
                  Sanctuary Mode • Apex Tier
                </Badge>
                <span className="text-xs font-medium leading-4 text-on-surface-variant">Sync: Moments ago</span>
              </div>
              <h1 className="text-[36px] font-bold leading-[44px] tracking-tight text-on-surface lg:text-[56px] lg:leading-[64px]">
                {greeting},{' '}
                <span className="font-semibold text-primary-container underline decoration-wavy decoration-1 decoration-primary-container/50 underline-offset-4">
                  {firstName}
                </span>
                .
              </h1>
              <p className="text-xl font-normal leading-7 text-on-surface-variant">
                What mountain will you climb next? You are {activeGoals.length} intermediate leaps away from this
                quarter's apex.
              </p>
            </div>
            <StatsCards active={activeGoals.length} completed={completedGoals.length} total={goals.length} />
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-error/30 bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container dark:bg-error/15 dark:text-error">
              {error}
            </div>
          )}

          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm dark:bg-surface-container-low lg:flex-row">
            <div className="flex w-full flex-col items-center gap-2 sm:flex-row lg:w-7/12">
              <Input
                icon="search"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search aspirations, regions, skills, or tags..."
                value={search}
              />
              <Select
                className="flex-shrink-0 sm:w-64"
                onChange={(e) => setCategory(e.target.value as 'ALL' | GoalCategory)}
                value={category}
              >
                <option value="ALL">All Categories</option>
                {(Object.entries(CATEGORY_LABELS) as [GoalCategory, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex w-full items-center justify-between gap-2 overflow-x-auto pb-1 sm:justify-end lg:w-auto lg:pb-0">
              <div className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low p-1 dark:bg-surface-container-lowest">
                {(['all', 'active', 'priority'] as FilterTab[]).map((t) => (
                  <FilterChip key={t} active={tab === t} onClick={() => setTab(t)}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </FilterChip>
                ))}
              </div>
              <Button className="group flex-shrink-0 font-bold" onClick={() => setModalOpen(true)}>
                <Icon className="text-[18px] font-bold transition-transform duration-300 group-hover:rotate-90" name="add" />
                <span>Add Dream</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">
                progress_activity
              </span>
            </div>
          ) : (
            <>
              {!loading && goals.length === 0 && (
                <div className="mb-8 rounded-xl border border-dashed border-outline-variant/60 p-10 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    Empty Summit
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-8 tracking-tight text-on-surface">
                    Your bucket list awaits.
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Architect your first dream to begin the ascent.
                  </p>
                  <Button className="mt-6 font-bold" onClick={() => setModalOpen(true)}>
                    <Icon className="text-[18px] font-bold" name="add" /> Add Dream
                  </Button>
                </div>
              )}

              <section className="mb-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">Active Horizons</h2>
                    <Badge tone="amber">{visibleActive.length} in flight</Badge>
                  </div>
                  <span className="hidden text-xs font-medium leading-4 text-on-surface-variant sm:inline-block">
                    Click checkbox to complete & archive
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {visibleActive.map((goal) => (
                    <GoalCard goal={goal} key={goal.id} onDelete={handleDelete} onEdit={(g) => { setEditingGoal(g); setModalOpen(true) }} onToggle={toggleStatus} />
                  ))}
                  {visibleActive.length === 0 && (
                    <div className="rounded-xl border border-dashed border-outline-variant/60 p-8 text-center text-sm text-on-surface-variant">
                      No active aspirations match your filters.
                    </div>
                  )}
                </div>
              </section>

              <div className="mb-8 h-px w-full bg-outline-variant/50" />

              <section className="mb-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="text-2xl text-success-olive dark:text-emerald-glow" name="verified" />
                    <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">Conquered Summits</h2>
                    <Badge tone="success">{visibleCompleted.length} summits sealed</Badge>
                  </div>
                  <button
                    className="flex cursor-pointer items-center gap-1 text-xs font-medium leading-4 font-semibold text-primary transition-colors hover:text-on-surface"
                    type="button"
                  >
                    <span>View Full Hall of Fame</span>
                    <Icon className="text-[13px]" name="arrow_forward" />
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {visibleCompleted.map((goal) => (
                    <GoalCard goal={goal} key={goal.id} onDelete={handleDelete} onEdit={(g) => { setEditingGoal(g); setModalOpen(true) }} onToggle={toggleStatus} />
                  ))}
                  {visibleCompleted.length === 0 && (
                    <div className="rounded-xl border border-dashed border-outline-variant/60 p-8 text-center text-sm text-on-surface-variant">
                      Nothing matches here — clear your filters to see conquered summits.
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />

      <GoalFormModal
        initial={
          editingGoal
            ? {
                title: editingGoal.title,
                description: editingGoal.description ?? '',
                category: editingGoal.category,
                priority: editingGoal.priority,
                progress: editingGoal.progress,
                target_date: editingGoal.target_date ?? '',
              }
            : null
        }
        key={editingGoal?.id ?? 'new'}
        mode={editingGoal ? 'edit' : 'add'}
        onClose={closeModal}
        onSubmit={editingGoal ? handleUpdate : handleCreate}
        open={modalOpen}
      />
    </div>
  )
}
