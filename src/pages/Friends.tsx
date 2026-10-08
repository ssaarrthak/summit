import { useState } from 'react'
import type { FormEvent } from 'react'
import { Footer, NavBar } from '@/components/layout'
import { Badge, Button, Icon, Input } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useFriends } from '@/hooks/useFriends'
import type { FriendEntry } from '@/hooks/useFriends'
import type { Profile } from '@/lib/database.types'

export default function Friends() {
  const { session } = useAuth()
  const {
    friends,
    incoming,
    outgoing,
    loading,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendship,
    removeFriendship,
  } = useFriends()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const knownEntries = new Map<string, FriendEntry>()
  for (const entry of [...friends, ...incoming, ...outgoing]) {
    knownEntries.set(entry.profile.id, entry)
  }

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSearching(true)
    const found = await searchUsers(query)
    setResults(found)
    setSearched(true)
    setSearching(false)
  }

  const handleAdd = async (profile: Profile) => {
    await sendFriendRequest(profile)
  }

  const handleAccept = async (entry: FriendEntry) => {
    await acceptFriendship(entry)
  }

  const handleRemove = async (entry: FriendEntry, label: string) => {
    if (window.confirm(`Remove ${label} from your connections?`)) {
      await removeFriendship(entry)
    }
  }

  const initialOf = (profile: Profile) => (profile.display_name?.[0] ?? profile.username[0]).toUpperCase()
  const nameOf = (profile: Profile) => profile.display_name ?? profile.username

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <NavBar completedCount={0} totalCount={0} />

      <main className="w-full min-h-[calc(100vh-4rem)] flex-1 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="mb-8 flex flex-col gap-1">
            <Badge className="w-fit" tone="amber">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container shadow-sm shadow-primary-container/60" />
              Connections
            </Badge>
            <h1 className="text-[36px] font-bold leading-[44px] tracking-tight text-on-surface">Fellow Explorers</h1>
            <p className="text-xl font-normal leading-7 text-on-surface-variant">
              Find friends by username — once connected, you can team up on collaborative goals.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-error/30 bg-error-container/50 px-4 py-2.5 text-sm text-on-error-container dark:bg-error/15 dark:text-error">
              {error}
            </div>
          )}

          <form className="mb-8 flex flex-col gap-2 sm:flex-row" onSubmit={handleSearch}>
            <Input
              icon="search"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search explorers by username or name..."
              value={query}
            />
            <Button className="flex-shrink-0 font-bold sm:w-36" disabled={searching || query.trim().length < 2}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-3xl text-on-surface-variant">
                progress_activity
              </span>
            </div>
          ) : (
            <>
              {searched && (
                <section className="mb-8 flex flex-col gap-4">
                  <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">Search Results</h2>
                  <div className="flex flex-col gap-3">
                    {results.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-outline-variant/60 p-6 text-center text-sm text-on-surface-variant">
                        No explorers found for "{query}" — try a different username.
                      </div>
                    ) : (
                      results.map((profile) => {
                        const known = knownEntries.get(profile.id)
                        return (
                          <div
                            className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm dark:bg-surface-container-low"
                            key={profile.id}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high ring-1 ring-primary-container/30">
                                <span className="text-sm font-semibold text-on-surface">{initialOf(profile)}</span>
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-[15px] font-semibold leading-[22px] text-on-surface">
                                  {nameOf(profile)}
                                </span>
                                <span className="truncate text-xs leading-4 text-on-surface-variant">
                                  @{profile.username}
                                </span>
                              </div>
                            </div>
                            {!known ? (
                              <Button className="flex-shrink-0" size="sm" onClick={() => handleAdd(profile)}>
                                <Icon className="text-[16px]" name="person_add" />
                                Add Friend
                              </Button>
                            ) : known.friendship.status === 'accepted' ? (
                              <Badge className="flex-shrink-0" tone="success">
                                <Icon className="text-[12px]" name="check" />
                                Friends
                              </Badge>
                            ) : known.friendship.addressee_id === session?.user.id ? (
                              <Badge className="flex-shrink-0" tone="amber">
                                Wants to connect
                              </Badge>
                            ) : (
                              <Badge className="flex-shrink-0" tone="neutral">
                                Request sent
                              </Badge>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </section>
              )}

              {incoming.length > 0 && (
                <section className="mb-8 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">
                      Friend Requests
                    </h2>
                    <Badge tone="amber">{incoming.length} pending</Badge>
                  </div>
                  <div className="flex flex-col gap-3">
                    {incoming.map((entry) => (
                      <div
                        className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm dark:bg-surface-container-low"
                        key={entry.friendship.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high ring-1 ring-primary-container/30">
                            <span className="text-sm font-semibold text-on-surface">{initialOf(entry.profile)}</span>
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[15px] font-semibold leading-[22px] text-on-surface">
                              {nameOf(entry.profile)}
                            </span>
                            <span className="truncate text-xs leading-4 text-on-surface-variant">
                              @{entry.profile.username}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <Button size="sm" onClick={() => handleAccept(entry)}>
                            <Icon className="text-[16px]" name="check" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(entry, nameOf(entry.profile))}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {outgoing.length > 0 && (
                <section className="mb-8 flex flex-col gap-4">
                  <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">Sent Requests</h2>
                  <div className="flex flex-col gap-3">
                    {outgoing.map((entry) => (
                      <div
                        className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm dark:bg-surface-container-low"
                        key={entry.friendship.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high ring-1 ring-primary-container/30">
                            <span className="text-sm font-semibold text-on-surface">{initialOf(entry.profile)}</span>
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[15px] font-semibold leading-[22px] text-on-surface">
                              {nameOf(entry.profile)}
                            </span>
                            <span className="truncate text-xs leading-4 text-on-surface-variant">
                              @{entry.profile.username}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <Badge tone="neutral">
                            <Icon className="text-[12px]" name="schedule" />
                            Pending
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(entry, nameOf(entry.profile))}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-8 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Icon className="text-2xl text-primary-container" name="group" />
                  <h2 className="text-2xl font-semibold leading-8 tracking-tight text-on-surface">My Friends</h2>
                  <Badge tone="neutral">{friends.length} connected</Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {friends.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-outline-variant/60 p-8 text-center text-sm text-on-surface-variant">
                      No friends yet — search for explorers above and send your first request.
                    </div>
                  ) : (
                    friends.map((entry) => (
                      <div
                        className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm dark:bg-surface-container-low"
                        key={entry.friendship.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high ring-1 ring-primary-container/30">
                            <span className="text-sm font-semibold text-on-surface">{initialOf(entry.profile)}</span>
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[15px] font-semibold leading-[22px] text-on-surface">
                              {nameOf(entry.profile)}
                            </span>
                            <span className="truncate text-xs leading-4 text-on-surface-variant">
                              @{entry.profile.username}
                            </span>
                          </div>
                        </div>
                        <button
                          aria-label={`Remove ${nameOf(entry.profile)}`}
                          className="flex-shrink-0 cursor-pointer rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-error-container/50 hover:text-error"
                          onClick={() => handleRemove(entry, nameOf(entry.profile))}
                          type="button"
                        >
                          <Icon className="text-[18px]" name="person_remove" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
