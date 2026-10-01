import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Footer, NavBar } from '@/components/layout'
import { FullScreenLoader } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import Dashboard from '@/pages/Dashboard'
import Explore from '@/pages/Explore'
import PublicList from '@/pages/PublicList'
import Welcome from '@/pages/Welcome'

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!session) return <Navigate replace to="/" />
  return children
}

function PublicListPage() {
  const { username } = useParams<{ username: string }>()
  return <PublicList key={username} username={username ?? ''} />
}

function ComingSoon() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <NavBar completedCount={0} totalCount={0} />
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center pt-16">
        <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center shadow-sm dark:bg-surface-container-low">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">Coming soon</p>
          <h1 className="mt-2 text-2xl font-semibold leading-8 tracking-tight">
            This horizon opens in a later phase.
          </h1>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Welcome />} path="/" />
      <Route
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
        path="/dashboard"
      />
      <Route
        element={
          <RequireAuth>
            <Explore />
          </RequireAuth>
        }
        path="/explore"
      />
      <Route element={<PublicListPage />} path="/u/:username" />
      <Route
        element={
          <RequireAuth>
            <ComingSoon />
          </RequireAuth>
        }
        path="/active-goals"
      />
      <Route
        element={
          <RequireAuth>
            <ComingSoon />
          </RequireAuth>
        }
        path="/accomplishments"
      />
    </Routes>
  )
}
