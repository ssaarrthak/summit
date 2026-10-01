import type { InputHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  trailing?: ReactNode
}

export function Input({ icon, trailing, className = '', ...props }: InputProps) {
  const inputClasses = [
    'w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 font-sans text-[15px] leading-[22px] text-on-surface shadow-sm transition-all duration-200 placeholder:text-on-surface-variant/60 focus:border-walnut focus:bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-walnut dark:bg-surface-container-lowest dark:focus:border-primary dark:focus:ring-primary',
    icon ? 'pl-11' : '',
    trailing ? 'pr-11' : '',
    '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={`relative flex w-full items-center ${className}`}>
      {icon && (
        <Icon name={icon} className="pointer-events-none absolute left-3.5 text-[19px] text-on-surface-variant" />
      )}
      <input {...props} className={inputClasses} />
      {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  )
}
