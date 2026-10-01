import { Link } from 'react-router-dom'
import { Footer, NavBar } from '@/components/layout'
import { Badge } from '@/components/ui'
import { Icon } from '@/components/ui/Icon'
import { usePublicProfiles } from '@/hooks/usePublicList'
import type { PublicProfileWithCount } from '@/hooks/usePublicList'

export default function Explore() {
  const { profiles, loading, error } = usePublicProfiles()

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <NavBar completedCount={0} totalCount={0} />

      <main className="w-full min-h-[calc(100vh-4rem)] flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-8 flex flex-col gap-1">
            <Badge className="w-fit" tone="amber">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container shadow-sm shadow-primary-container/60" />
              Explore Inspiration
            </Badge>
            <h1 className="text-[36px] font-bold leading-[44px] tracking-tight text-on-surface lg:text-[56px] lg:leading-[64px]">
              Public Bucket Lists
            </h1>
            <p className="text-xl font-normal leading-7 text-on-surface-variant">
              Browse what others are conquering — open any list and clone the public goals that call to you.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-error/30 bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container dark:bg-error/15 dark:text-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">
                progress_activity
              </span>
            </div>
          ) : profiles.filter((p) => (p.goals?.[0]?.count ?? 0) > 0).length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/60 p-12 text-center">
              <Icon className="text-3xl text-on-surface-variant" name="explore" />
              <h2 className="mt-3 text-2xl font-semibold leading-8 tracking-tight text-on-surface">
                No public goals yet.
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Be the first — mark one of your goals Public from its edit menu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profiles
                .filter((p) => (p.goals?.[0]?.count ?? 0) > 0)
                .map((p) => (
                  <ExploreCard key={p.id} profile={p} />
                ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ExploreCard({ profile }: { profile: PublicProfileWithCount }) {
  const initial = (profile.display_name?.[0] ?? profile.username[0]).toUpperCase()
  const count = profile.goals?.[0]?.count ?? 0
  return (
    <Link
      className="group rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-container/40 hover:shadow-md dark:bg-surface-container-low dark:hover:bg-surface-container"
      to={`/u/${profile.username}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high ring-1 ring-primary-container/30">
          <span className="text-lg font-semibold text-on-surface">{initial}</span>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-semibold leading-6 text-on-surface transition-colors group-hover:text-primary">
            {profile.display_name ?? profile.username}
          </span>
          <span className="truncate text-xs leading-4 text-on-surface-variant">@{profile.username}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-outline-variant/50 pt-4">
        <span className="text-xs font-medium leading-4 text-on-surface-variant">
          {count} public dream{count === 1 ? '' : 's'}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold leading-4 text-primary">
          View list
          <Icon className="text-[14px]" name="arrow_forward" />
        </span>
      </div>
    </Link>
  )
}
