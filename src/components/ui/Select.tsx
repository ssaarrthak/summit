import type { SelectHTMLAttributes } from 'react'
import { Icon } from './Icon'

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative w-full ${className}`}>
      <select
        className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 pr-9 font-sans text-[15px] leading-[22px] text-on-surface shadow-sm transition-all duration-200 hover:border-amber-deep/60 focus:border-walnut focus:outline-none focus:ring-1 focus:ring-walnut dark:bg-surface-container-lowest dark:focus:border-primary dark:focus:ring-primary"
        {...props}
      >
        {children}
      </select>
      <Icon name="unfold_more" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-primary" />
    </div>
  )
}
