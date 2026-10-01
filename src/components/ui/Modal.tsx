import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-all duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`relative w-full max-w-xl overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-modal transition-transform duration-300 dark:bg-surface-container ${
          open ? 'scale-100' : 'scale-95'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container/50 to-transparent" />
        <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-container-lowest p-6 dark:bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-container shadow-sm shadow-primary-container/50" />
            <h3 className="text-xl font-semibold tracking-tight text-on-surface">{title}</h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
