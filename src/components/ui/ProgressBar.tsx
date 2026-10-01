interface ProgressBarProps {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const width = `${Math.min(100, Math.max(0, value))}%`
  return (
    <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full border border-outline-variant/60 bg-surface-container-low dark:bg-surface-container-lowest">
      <div
        className="h-full rounded-full bg-walnut shadow-sm shadow-walnut/30 transition-all duration-500 dark:bg-gradient-to-r dark:from-amber-deep dark:to-primary-container dark:shadow-primary-container/30"
        style={{ width }}
      />
    </div>
  )
}
