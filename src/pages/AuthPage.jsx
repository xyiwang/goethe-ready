import { useEffect, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import { supabase } from '../lib/supabase.js'

function mapAuthError(message, labels) {
  const text = String(message || '').toLowerCase()
  if (text.includes('invalid login credentials')) return labels.invalidCredentials
  if (text.includes('user already registered')) return labels.userExists
  if (text.includes('password should be at least')) return labels.weakPassword
  if (text.includes('email not confirmed')) return labels.emailNotConfirmed
  return message || labels.genericError
}

/**
 * @param {{
 *   messages: {
 *     auth: Record<string, string>
 *     home: { languageSwitchZh: string; languageSwitchEn: string }
 *   }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   initialMode?: 'signin' | 'signup'
 *   onBack?: () => void
 *   onTryGuest?: () => void
 *   onAuthSuccess?: () => void
 * }} props
 */
export function AuthPage({
  messages,
  locale,
  setLocale,
  initialMode = 'signin',
  onBack,
  onTryGuest,
  onAuthSuccess,
}) {
  const { auth: a, home: h } = messages
  const [mode, setMode] = useState(/** @type {'signin' | 'signup'} */ (initialMode))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setError(a.configMissing)
      return
    }

    setLoading(true)
    setError('')
    setNotice('')

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (signUpError) throw signUpError
        if (data?.session) {
          onAuthSuccess?.()
        } else {
          setNotice(a.signupSuccess)
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signInError) throw signInError
        onAuthSuccess?.()
      }
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : '', a))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--bg-primary)] px-6 py-12 text-[var(--text-primary)]">
      <span
        className="pointer-events-none absolute right-12 top-16 z-0 h-16 w-16 rounded-full bg-[#FDCB6E]/70"
        style={{ animation: 'float 3s ease-in-out infinite' }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute right-28 top-28 z-0 h-8 w-8 rounded-full bg-[#E8E3FF]"
        style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '400ms' }}
        aria-hidden
      />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-start justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              ← {a.backToHome}
            </button>
          ) : (
            <span />
          )}
          <LanguageSwitch
            locale={locale}
            setLocale={setLocale}
            zhLabel={h.languageSwitchZh}
            enLabel={h.languageSwitchEn}
          />
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{a.title}</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{a.subtitle}</p>
          <blockquote className="mt-6 border border-[var(--border)] bg-[var(--bg-card)] px-4 py-4 text-left">
            <p className="text-lg leading-relaxed text-[var(--text-primary)]">
              Wer fremde Sprachen nicht kennt,
              <br />
              weiss nichts von seiner eigenen.
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">— Goethe</p>
          </blockquote>
        </header>

        <div className="mb-4 grid grid-cols-2 border border-[var(--border)] bg-[var(--bg-card)] p-1 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError('')
              setNotice('')
            }}
            className={`rounded-lg py-2 font-semibold transition ${
              mode === 'signin'
                ? 'bg-[#f4f7fb] text-[var(--accent)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {a.signinTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError('')
              setNotice('')
            }}
            className={`rounded-lg py-2 font-semibold transition ${
              mode === 'signup'
                ? 'bg-[#f4f7fb] text-[var(--accent)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {a.signupTab}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-[var(--border)] bg-[var(--bg-card)] p-5"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--text-secondary)]">{a.emailLabel}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={a.emailPlaceholder}
              required
              className="w-full border border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-[var(--text-secondary)]">{a.passwordLabel}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={a.passwordPlaceholder}
              minLength={6}
              required
              className="w-full border border-[var(--border)] bg-white px-4 py-3 text-[var(--text-primary)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="fun-primary-btn w-full bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[#d8dde3] disabled:text-[var(--text-muted)]"
          >
            {loading ? a.loading : mode === 'signin' ? a.signinButton : a.signupButton}
          </button>
        </form>

        {error && (
          <p className="mt-4 border border-[var(--error)] bg-[color:var(--error)]/20 px-4 py-3 text-sm text-[#dba9a9]">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 border border-[var(--success)] bg-[color:var(--success)]/20 px-4 py-3 text-sm text-[#a7c3af]">
            {notice}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          <span>{mode === 'signin' ? a.signupHint : a.signinHint}</span>{' '}
          <button
            type="button"
            onClick={() => {
              setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
              setError('')
              setNotice('')
            }}
            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-orange)]"
          >
            {mode === 'signin' ? a.switchToSignup : a.switchToSignin}
          </button>
        </div>
        {onTryGuest && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onTryGuest}
              className="text-xs text-slate-500 underline underline-offset-4 hover:text-slate-700"
            >
              {a.tryGuest}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
