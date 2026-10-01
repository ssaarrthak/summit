import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FullScreenLoader, Icon, Input } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

type AuthMode = 'login' | 'signup'

export default function Welcome() {
  const { session, loading, signUp, signIn } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const labelClasses = 'font-inter text-xs font-semibold uppercase tracking-wider text-on-surface-variant'

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')

    setSubmitting(true)
    if (mode === 'signup') {
      const username = String(fd.get('username') ?? '').trim()
      const displayName = String(fd.get('name') ?? '').trim()
      if (!/^[a-z0-9_]{3,24}$/i.test(username)) {
        setSubmitting(false)
        setError('Username must be 3-24 characters: letters, numbers, underscores.')
        return
      }
      const err = await signUp(email, password, username, displayName || username)
      setSubmitting(false)
      if (err) {
        setError(err)
        return
      }
    } else {
      const err = await signIn(email, password)
      setSubmitting(false)
      if (err) {
        setError(err)
        return
      }
    }
    navigate('/dashboard')
  }

  if (loading) return <FullScreenLoader />
  if (session) return <Navigate replace to="/dashboard" />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-on-surface">
      <main className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="relative flex w-full select-none flex-col items-center justify-center overflow-hidden px-4 py-12">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[650px] -translate-x-1/2 rounded-full bg-primary-container/10 blur-[140px]" />
          <div className="pointer-events-none absolute -left-36 top-1/3 h-[450px] w-[450px] rounded-full bg-surface-container-high/60 blur-[150px]" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-[380px] w-[500px] rounded-full bg-primary-container/[0.08] blur-[140px]" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20">
            <defs>
              <pattern height="48" id="ambient-grid" patternUnits="userSpaceOnUse" width="48">
                <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="0.75" className="stroke-primary-container/20" />
              </pattern>
            </defs>
            <rect fill="url(#ambient-grid)" height="100%" width="100%" />
          </svg>

          <div className="relative z-10 flex w-full max-w-md flex-col items-center">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="group relative mb-4 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-primary-container/20 blur-xl transition-all duration-700 ease-out group-hover:bg-primary-container/35" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low p-2.5 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.5)]">
                  <Icon className="text-[28px] text-primary-container" name="terrain" />
                </div>
              </div>
              <h1 className="mb-1 text-[34px] font-bold uppercase leading-[42px] tracking-[0.24em] text-on-surface">
                Summit
              </h1>
              <p className="max-w-xs text-[15px] leading-[22px] tracking-tight text-on-surface-variant">
                Design your life. Conquer your dreams.
              </p>
            </div>

            <div className="relative w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-modal sm:p-8 dark:bg-surface-container-low">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container/50 to-transparent" />

              <div className="relative mb-6 flex w-full items-center rounded-xl border border-outline-variant bg-surface-container-low inset-shadow-2xs dark:bg-surface-container-lowest">
                <div
                  className={`absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-lg border border-outline-variant bg-surface-container-high shadow-sm transition-transform duration-300 ease-out ${
                    mode === 'signup' ? 'translate-x-full' : ''
                  }`}
                />
                <button
                  className={`relative z-10 flex-1 py-2 text-center text-[15px] leading-[22px] font-semibold transition-colors duration-200 focus:outline-none ${
                    mode === 'login' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => switchMode('login')}
                  type="button"
                >
                  Log In
                </button>
                <button
                  className={`relative z-10 flex-1 py-2 text-center text-[15px] leading-[22px] font-semibold transition-colors duration-200 focus:outline-none ${
                    mode === 'signup' ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => switchMode('signup')}
                  type="button"
                >
                  Create Account
                </button>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg border border-error/30 bg-error-container/50 px-3 py-2 text-[13px] leading-[18px] text-on-error-container dark:bg-error/15 dark:text-error">
                    {error}
                  </div>
                )}

                {mode === 'signup' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClasses} htmlFor="input-name">
                        Full Name
                      </label>
                      <Input icon="person" name="name" id="input-name" placeholder="Elena Vance" type="text" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClasses} htmlFor="input-username">
                        Username
                      </label>
                      <Input
                        icon="badge"
                        name="username"
                        id="input-username"
                        placeholder="elena_v"
                        required
                        type="text"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className={labelClasses} htmlFor="input-email">
                    Email
                  </label>
                  <Input
                    icon="alternate_email"
                    id="input-email"
                    name="email"
                    placeholder="elena@summit.app"
                    required
                    type="email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className={labelClasses} htmlFor="input-password">
                      Password
                    </label>
                    {mode === 'login' && (
                      <a
                        className="font-inter text-xs font-semibold text-on-surface-variant underline-offset-2 transition-colors hover:text-on-surface hover:underline"
                        href="#"
                      >
                        Forgot?
                      </a>
                    )}
                  </div>
                  <Input
                    icon="lock"
                    id="input-password"
                    name="password"
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    trailing={
                      <button
                        aria-label="Toggle password visibility"
                        className="flex cursor-pointer items-center justify-center p-1 text-on-surface-variant transition-colors hover:text-on-surface focus:outline-none"
                        onClick={() => setShowPassword((v) => !v)}
                        type="button"
                      >
                        <Icon className="text-[19px]" name={showPassword ? 'visibility_off' : 'visibility'} />
                      </button>
                    }
                    type={showPassword ? 'text' : 'password'}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer select-none items-center gap-2">
                    <input
                      checked={remember}
                      className="sr-only"
                      onChange={(e) => setRemember(e.target.checked)}
                      type="checkbox"
                    />
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded shadow-inner transition-colors ${
                        remember
                          ? 'border border-primary-container bg-primary-container'
                          : 'border border-outline-variant bg-surface-container-low'
                      }`}
                    >
                      <Icon
                        className={`text-[14px] font-bold text-canvas-cream transition-opacity dark:text-[#16120f] ${
                          remember ? 'opacity-100' : 'opacity-0'
                        }`}
                        name="check"
                      />
                    </div>
                    <span
                      className={`text-xs font-medium leading-4 transition-colors ${
                        remember ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      Remember this device
                    </span>
                  </label>
                </div>

                <button
                  className="group relative mt-2 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-deep via-primary-container to-amber-deep px-5 py-3.5 text-[15px] leading-[22px] font-bold text-[#201711] shadow-[0_8px_20px_rgba(226,186,134,0.25)] transition-all duration-200 hover:shadow-[0_10px_26px_rgba(226,186,134,0.38)] active:scale-[0.99] focus:outline-none disabled:pointer-events-none disabled:opacity-70"
                  disabled={submitting}
                  type="submit"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
                  <span className="relative z-10">
                    {submitting
                      ? 'Authenticating...'
                      : mode === 'login'
                        ? 'Log In to Your Journey'
                        : 'Begin Your Odyssey'}
                  </span>
                  {!submitting && (
                    <Icon
                      className="relative z-10 text-[18px] font-bold transition-transform duration-200 group-hover:translate-x-0.5"
                      name="arrow_forward"
                    />
                  )}
                </button>
              </form>

              <div className="relative my-6 flex items-center">
                <div className="h-px flex-grow bg-outline-variant" />
                <span className="mx-3 flex-shrink font-inter text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                  or continue with
                </span>
                <div className="h-px flex-grow bg-outline-variant" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sign in with Google', icon: 'google' },
                  { label: 'Sign in with Apple', icon: 'apple' },
                  { label: 'Sign in with GitHub', icon: 'github' },
                ].map((provider) => (
                  <button
                    aria-label={provider.label}
                    className="flex cursor-not-allowed items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 opacity-60 shadow-sm transition-colors focus:outline-none"
                    disabled
                    key={provider.label}
                    title="Coming soon"
                    type="button"
                  >
                    <svg className="h-4 w-4 fill-current text-on-surface" viewBox="0 0 24 24">
                      {provider.icon === 'google' && (
                        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                      )}
                      {provider.icon === 'apple' && (
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.62-.75 1.04-1.79.92-2.83-.89.04-1.99.6-2.63 1.35-.56.64-1.05 1.7-1.05 2.76 1 .08 2.05-.53 2.76-1.28z" />
                      )}
                      {provider.icon === 'github' && (
                        <path
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          fillRule="evenodd"
                        />
                      )}
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-full border border-outline-variant bg-surface-container-high/90 px-4 py-2 shadow-sm backdrop-blur-md">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-high ring-2 ring-surface-container-lowest">
                  <Icon className="text-[11px] text-on-surface" name="landscape" />
                </div>
                <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-highest ring-2 ring-surface-container-lowest">
                  <Icon className="text-[11px] text-primary-container" name="bolt" />
                </div>
                <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-walnut ring-2 ring-surface-container-lowest">
                  <Icon className="text-[11px] text-primary-container" name="star" />
                </div>
              </div>
              <p className="text-[13px] leading-[18px] text-on-surface-variant">
                Join <span className="font-semibold text-primary-container">18,400+</span> dreamers tracking life's
                summits.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4 font-inter text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
              <a className="transition-colors hover:text-primary" href="#">
                Privacy
              </a>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <a className="transition-colors hover:text-primary" href="#">
                Terms
              </a>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <a className="transition-colors hover:text-primary" href="#">
                Security
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
