import type { ReactNode } from 'react'

type BadgeTone = 'amber' | 'success' | 'danger' | 'neutral'

const tones: Record<BadgeTone, string> = {
  amber: 'border-amber-deep/25 bg-amber-deep/10 text-primary',
  success:
    'border-success-olive/30 bg-success-olive/10 text-success-olive dark:border-emerald-glow/30 dark:bg-emerald-glow/10 dark:text-emerald-glow',
  danger:
    'border-error/30 bg-error-container/50 text-on-error-container dark:bg-error/15 dark:text-error',
  neutral: 'border-outline-variant bg-surface-container-high text-on-surface-variant',
}

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', className = '', children }: BadgeProps) {
  const classes = [
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-inter text-[10px] font-semibold uppercase tracking-[0.06em]',
    tones[tone],
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <span className={classes}>{children}</span>
}
