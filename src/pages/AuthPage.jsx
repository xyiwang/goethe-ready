import { useState } from 'react'
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
 *   onAuthSuccess?: () => void
 * }} props
 */
export function AuthPage({ messages, locale, setLocale, onAuthSuccess }) {
  const { auth: a, home: h } = messages
  const [mode, setMode] = useState(/** @type {'signin' | 'signup'} */ ('signin'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

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
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (signUpError) throw signUpError
        setNotice(a.signupSuccess)
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
    <div className="min-h-dvh bg-white px-6 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-start justify-end">
          <LanguageSwitch
            locale={locale}
            setLocale={setLocale}
            zhLabel={h.languageSwitchZh}
            enLabel={h.languageSwitchEn}
          />
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{a.title}</h1>
          <p className="mt-3 text-sm text-slate-500">{a.subtitle}</p>
        </header>

        <div className="mb-4 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setError('')
              setNotice('')
            }}
            className={`rounded-lg py-2 font-semibold transition ${
              mode === 'signin'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
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
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {a.signupTab}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">{a.emailLabel}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={a.emailPlaceholder}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">{a.passwordLabel}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={a.passwordPlaceholder}
              minLength={6}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading ? a.loading : mode === 'signin' ? a.signinButton : a.signupButton}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-slate-600">
          <span>{mode === 'signin' ? a.signupHint : a.signinHint}</span>{' '}
          <button
            type="button"
            onClick={() => {
              setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
              setError('')
              setNotice('')
            }}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {mode === 'signin' ? a.switchToSignup : a.switchToSignin}
          </button>
        </div>
      </div>
    </div>
  )
}
