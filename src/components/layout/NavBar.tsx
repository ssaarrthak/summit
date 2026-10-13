import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/active-goals', label: 'Active Goals' },
  { path: '/accomplishments', label: 'Accomplishments' },
  { path: '/explore', label: 'Explore Inspiration' },
]

interface NavBarProps {
  totalCount: number
  completedCount: number
}

export function NavBar({ totalCount, completedCount }: NavBarProps) {
  const { session, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const initial = (profile?.display_name?.[0] ?? profile?.username?.[0] ?? 'S').toUpperCase()
  const displayName = profile?.display_name ?? profile?.username ?? 'Summit User'

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/60 bg-surface-container/90 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-6 xl:gap-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-container to-[#a87948] p-0.5 shadow-sm shadow-primary-container/20">
              <Icon name="terrain" className="text-[20px] text-canvas-cream" />
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">Summit</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-1.5 text-[15px] transition-colors ${
                    isActive
                      ? 'border border-outline-variant bg-surface-container-high font-semibold text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {totalCount > 0 && (
            <div className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low inset-shadow-2xs px-4 py-1.5 sm:flex dark:bg-surface-container-lowest">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
              <span className="text-sm leading-5 text-on-surface">
                {completedCount} / {totalCount} Completed
              </span>
              <span className="text-xs font-bold leading-4 text-primary-container">{percent}%</span>
            </div>
          )}
          <button
            aria-label="Toggle theme"
            className="cursor-pointer rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            onClick={toggleTheme}
            type="button"
          >
            <Icon className="text-[20px]" name={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
          </button>
          <button
            aria-label="Notifications"
            className="relative cursor-pointer rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            type="button"
          >
            <Icon className="text-[20px]" name="notifications" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-container shadow-sm shadow-primary-container/50" />
          </button>
          <div className="relative flex items-center gap-1 pl-1">
            <button
              aria-label="Account menu"
              className="flex cursor-pointer items-center gap-1 focus:outline-none"
              onClick={() => setMenuOpen((v) => !v)}
              type="button"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high ring-1 ring-primary-container/30">
                <span className="text-sm font-semibold text-on-surface">{initial}</span>
              </div>
              <Icon className="text-on-surface-variant transition-colors hover:text-on-surface" name="expand_more" />
            </button>
            {menuOpen && session && (
              <div className="absolute right-0 top-12 w-64 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-modal dark:bg-surface-container-low">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold leading-5 text-on-surface">{displayName}</p>
                  <p className="truncate text-xs leading-4 text-on-surface-variant">@{profile?.username ?? 'unknown'}</p>
                </div>
                <div className="my-1 h-px bg-outline-variant/50" />
                <button
                  className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error-container/50"
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
