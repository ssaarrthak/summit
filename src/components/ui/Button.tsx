import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text'
type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-inter text-sm font-semibold transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-container text-canvas-cream shadow-sm hover:bg-walnut dark:bg-gradient-to-r dark:from-primary-container dark:to-amber-deep dark:text-[#1e1712] dark:shadow-md dark:shadow-primary-container/20 dark:hover:from-surface-tint dark:hover:to-tertiary-container dark:hover:shadow-lg dark:hover:shadow-primary-container/30',
  secondary:
    'border border-outline-variant bg-surface-container text-on-surface hover:border-sandstone hover:bg-surface-container-high',
  ghost: 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
  text: 'text-primary hover:text-on-surface dark:hover:text-canvas-cream',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3.5',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  const classes = [base, variants[variant], sizes[size], className].filter(Boolean).join(' ')
  return <button className={classes} type={type} {...props} />
}
