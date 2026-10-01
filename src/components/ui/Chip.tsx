import type { ReactNode } from 'react'

export function CategoryChip({ label, className = '' }: { label: string; className?: string }) {
  const classes = [
    'inline-flex items-center rounded-full border border-amber-deep/30 bg-amber-deep/15 px-2 py-0.5 font-inter text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-deep',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <span className={classes}>{label}</span>
}

interface FilterChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

export function FilterChip({ active, onClick, children }: FilterChipProps) {
  const classes = [
    'cursor-pointer rounded-md px-3 py-1.5 font-inter text-xs transition-all focus:outline-none',
    active
      ? 'bg-primary font-semibold text-on-primary shadow-sm'
      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
  ].join(' ')
  return (
    <button className={classes} onClick={onClick} type="button">
      {children}
    </button>
  )
}
