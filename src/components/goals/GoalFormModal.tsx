import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { CATEGORY_LABELS } from '@/lib/categories'
import type { GoalCategory, GoalFormValues, GoalPriority } from '@/lib/database.types'

interface GoalFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: GoalFormValues) => Promise<boolean>
  initial?: GoalFormValues | null
  mode: 'add' | 'edit'
}

const emptyForm: GoalFormValues = {
  title: '',
  description: '',
  category: 'TRAVEL',
  priority: 'normal',
  progress: 0,
  target_date: '',
}

const labelClasses = 'font-inter text-xs font-semibold uppercase tracking-wider text-on-surface-variant'

const errorBannerClass =
  'rounded-lg border border-error/30 bg-error-container/50 px-3 py-2 text-[13px] leading-[18px] text-on-error-container dark:bg-error/15 dark:text-error'

export function GoalFormModal({ open, onClose, onSubmit, initial, mode }: GoalFormModalProps) {
  const [values, setValues] = useState<GoalFormValues>(() => initial ?? emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!values.title.trim()) return
    setSubmitting(true)
    setError(null)
    const ok = await onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      target_date: values.target_date.trim(),
    })
    setSubmitting(false)
    if (ok) onClose()
    else setError('Something went wrong. Please try again.')
  }

  return (
    <Modal onClose={onClose} open={open} title={mode === 'edit' ? 'Refine This Summit' : 'Architect a New Summit'}>
      <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit}>
        {error && <div className={errorBannerClass}>{error}</div>}

        <div className="flex flex-col gap-1.5">
          <label className={labelClasses} htmlFor="goal-title">
            Dream Title / Horizon Peak
          </label>
          <Input
            id="goal-title"
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="e.g., Kayak with Bioluminescent Plankton in Vieques"
            required
            value={values.title}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClasses} htmlFor="goal-category">
              Category Realm
            </label>
            <Select
              id="goal-category"
              onChange={(e) => setValues((v) => ({ ...v, category: e.target.value as GoalCategory }))}
              value={values.category}
            >
              {(Object.entries(CATEGORY_LABELS) as [GoalCategory, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClasses} htmlFor="goal-date">
              Target Timeline
            </label>
            <Input
              id="goal-date"
              onChange={(e) => setValues((v) => ({ ...v, target_date: e.target.value }))}
              placeholder="e.g., Autumn 2026"
              value={values.target_date}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClasses} htmlFor="goal-priority">
            Priority
          </label>
          <Select
            id="goal-priority"
            onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value as GoalPriority }))}
            value={values.priority}
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClasses} htmlFor="goal-notes">
            Strategic Notes & Preparation
          </label>
          <Textarea
            id="goal-notes"
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="Key prerequisites, reservation lead times, physical checkpoints..."
            rows={3}
            value={values.description}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-outline-variant/60 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button className="px-6 font-bold" disabled={submitting} type="submit">
            {submitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Commit to Bucket List'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
