import { Icon } from './Icon'

interface CheckboxProps {
  checked: boolean
  onToggle: () => void
  ariaLabel?: string
}

export function Checkbox({ checked, onToggle, ariaLabel }: CheckboxProps) {
  const classes = [
    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-all duration-200 focus:outline-none',
    checked
      ? 'bg-primary-container text-canvas-cream shadow-sm shadow-primary-container/20 dark:text-[#16120f]'
      : 'border border-outline-variant bg-surface-container-low hover:border-primary dark:bg-surface-container-lowest',
  ].join(' ')
  return (
    <button
      aria-label={ariaLabel ?? (checked ? 'Mark as active' : 'Mark completed')}
      className={classes}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      type="button"
    >
      <Icon
        name="check"
        className={`text-[18px] font-bold transition-all ${checked ? 'opacity-100' : 'text-transparent opacity-0'}`}
      />
    </button>
  )
}
