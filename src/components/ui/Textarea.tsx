import type { TextareaHTMLAttributes } from 'react'

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const classes = [
    'w-full resize-none rounded-lg border border-outline-variant bg-surface-container-low p-3.5 font-sans text-[15px] leading-[22px] text-on-surface shadow-sm transition-all duration-200 placeholder:text-on-surface-variant/60 focus:border-walnut focus:bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-walnut dark:bg-surface-container-lowest dark:focus:border-primary dark:focus:ring-primary',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <textarea {...props} className={classes} />
}
