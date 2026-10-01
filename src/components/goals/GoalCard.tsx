import { Badge, CategoryChip, Checkbox, ProgressBar } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { CATEGORY_LABELS } from '@/lib/categories'
import type { GoalRow } from '@/lib/database.types'

interface GoalCardProps {
  goal: GoalRow
  cloned?: boolean
  cloning?: boolean
  readOnly?: boolean
  onToggle?: (goal: GoalRow) => void
  onEdit?: (goal: GoalRow) => void
  onDelete?: (goal: GoalRow) => void
  onClone?: (goal: GoalRow) => void
}

function formatConquered(completedAt: string | null): string {
  if (!completedAt) return '✓ Conquered'
  const d = new Date(completedAt)
  return `✓ Conquered ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`
}

export function GoalCard({
  goal,
  cloned = false,
  cloning = false,
  readOnly = false,
  onToggle,
  onEdit,
  onDelete,
  onClone,
}: GoalCardProps) {
  const completed = goal.status === 'completed'
  return (
    <article
      className={`group relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 ${
        completed
          ? 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low dark:bg-[#1a1511] dark:hover:bg-[#1e1813]'
          : 'bg-surface-container-lowest hover:-translate-y-0.5 hover:border-primary-container/40 hover:shadow-md dark:bg-surface-container-low dark:hover:bg-surface-container'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {!readOnly && onToggle && (
            <Checkbox
              ariaLabel={completed ? 'Mark as active' : 'Mark completed'}
              checked={completed}
              onToggle={() => onToggle(goal)}
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              {completed ? (
                <Badge tone="success">{formatConquered(goal.completed_at)}</Badge>
              ) : (
                <CategoryChip label={CATEGORY_LABELS[goal.category]} />
              )}
              {goal.is_collaborative && (
                <Badge tone="neutral">
                  <Icon className="text-[12px]" name="group" />
                  Collaborative
                </Badge>
              )}
              {goal.cloned_from && <Badge tone="amber">Cloned from @{goal.cloned_from}</Badge>}
              {!completed && goal.target_date && (
                <span className="inline-flex items-center gap-1 text-xs font-medium leading-4 text-on-surface-variant">
                  <Icon className="text-[14px] text-primary-container" name="calendar_today" />
                  Target: {goal.target_date}
                </span>
              )}
              {!completed && goal.priority === 'high' && <Badge tone="danger">High Priority</Badge>}
            </div>
            <h3
              className={`truncate text-xl font-semibold leading-7 tracking-tight transition-colors ${
                completed
                  ? 'text-on-surface-variant line-through decoration-on-surface-variant/50'
                  : 'text-on-surface group-hover:text-primary'
              }`}
            >
              {goal.title}
            </h3>
            {goal.description && (
              <p
                className={`line-clamp-1 text-[15px] leading-[22px] ${
                  completed ? 'text-on-surface-variant/70' : 'text-on-surface-variant'
                }`}
              >
                {goal.description}
              </p>
            )}
            {!completed && goal.progress > 0 && <ProgressBar value={goal.progress} />}
          </div>
        </div>
        <div className={`flex items-center gap-2 ${readOnly ? '' : 'pl-10'} md:pl-0`}>
          {onClone && (
            <button
              aria-label={cloned ? 'Already in your list' : 'Clone goal'}
              className={
                cloned
                  ? 'cursor-default rounded-md p-1.5 text-success-olive dark:text-emerald-glow'
                  : 'cursor-pointer rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface'
              }
              disabled={cloned || cloning}
              onClick={() => onClone(goal)}
              title={cloned ? 'Already in your list' : cloning ? 'Cloning...' : 'Add to your bucket list'}
              type="button"
            >
              {cloning && !cloned ? (
                <Icon className="animate-spin text-[18px]" name="progress_activity" />
              ) : (
                <Icon className="text-[18px]" name={cloned ? 'check' : 'content_copy'} />
              )}
            </button>
          )}
          {!readOnly && onEdit && (
            <button
              aria-label="Edit goal"
              className="cursor-pointer rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              onClick={() => onEdit(goal)}
              type="button"
            >
              <Icon className="text-[18px]" name="edit" />
            </button>
          )}
          {!readOnly && onDelete && (
            <button
              aria-label="Delete goal"
              className="cursor-pointer rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-error-container/50 hover:text-error"
              onClick={() => onDelete(goal)}
              type="button"
            >
              <Icon className="text-[18px]" name="delete" />
            </button>
          )}
          <div
            className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border ${
              completed ? 'border-outline-variant/50' : 'border-outline-variant'
            }`}
          >
            {goal.imageUrl ? (
              <img
                alt=""
                className={`h-full w-full object-cover transition-all duration-300 ${
                  completed
                    ? 'opacity-80 grayscale-[35%] group-hover:opacity-100 group-hover:grayscale-0'
                    : 'group-hover:scale-105'
                }`}
                src={goal.imageUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-container-low dark:bg-surface-container-lowest">
                <Icon
                  className={`text-[22px] ${completed ? 'text-on-surface-variant/40' : 'text-on-surface-variant/50'}`}
                  name={completed ? 'verified' : 'landscape'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
