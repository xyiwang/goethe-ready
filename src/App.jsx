import { useEffect, useMemo, useState } from 'react'
import { HomePage } from './pages/HomePage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { VocabPage } from './pages/VocabPage.jsx'
import { GrammarPage } from './pages/GrammarPage.jsx'
import { ProgressPage } from './pages/ProgressPage.jsx'
import { WritingPage } from './pages/WritingPage.jsx'
import { SpeakingPage } from './pages/SpeakingPage.jsx'
import { ListeningPage } from './pages/ListeningPage.jsx'
import { AuthPage } from './pages/AuthPage.jsx'
import { getMessages } from './i18n/index.js'
import { isSupabaseConfigured, supabase } from './lib/supabase.js'
import { getPlan } from './lib/db.js'
import { PLAN_STORAGE_KEY, generatePlan } from './utils/planGenerator.js'

const LOCALE_STORAGE_KEY = 'goethe-ready-locale'

function readBrowserLocale() {
  if (typeof navigator === 'undefined') return 'zh'
  const lang = (navigator.language || navigator.languages?.[0] || '').toLowerCase()
  return lang.startsWith('en') ? 'en' : 'zh'
}

/** 优先已保存的语言；首次访问则按浏览器语言推断 */
function readInitialLocale() {
  if (typeof window === 'undefined') return 'zh'
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (raw === 'en' || raw === 'zh') return raw
  return readBrowserLocale()
}

function App() {
  const [route, setRoute] = useState('home')
  const [plan, setPlan] = useState(null)
  const [todayVocabCount, setTodayVocabCount] = useState(20)
  const [locale, setLocaleState] = useState(() => readInitialLocale())
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [syncError, setSyncError] = useState('')

  const setLocale = (next) => {
    const value = next === 'en' ? 'en' : 'zh'
    setLocaleState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, value)
    }
  }

  const messages = useMemo(() => getMessages(locale), [locale])
  const language = locale
  const authEnabled = isSupabaseConfigured
  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!authEnabled || !supabase) return

    let active = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session ?? null)
        setAuthReady(true)
      })
      .catch(() => {
        if (!active) return
        setSession(null)
        setAuthReady(true)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setAuthReady(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [authEnabled])

  useEffect(() => {
    if (!authEnabled || !userId) return

    let active = true
    const bootstrapPlan = async () => {
      try {
        const cloudPlan = await getPlan(userId)
        if (!active) return

        if (cloudPlan) {
          const days = String(cloudPlan.days)
          const levelId = String(cloudPlan.level)
          const payload = {
            days,
            levelId,
            levelLabel: levelId,
            plan: generatePlan(days, levelId),
            startDate: String(cloudPlan.start_date),
          }
          localStorage.setItem(
            PLAN_STORAGE_KEY,
            JSON.stringify({
              days,
              level: levelId,
              levelLabel: levelId,
              plan: payload.plan,
              startDate: payload.startDate,
            }),
          )
          setPlan(payload)
          setRoute('dashboard')
        } else {
          setPlan(null)
          setRoute('home')
        }
        setSyncError('')
      } catch {
        if (!active) return
        setSyncError('1')
        setPlan(null)
        setRoute('home')
      }
    }

    void bootstrapPlan()
    return () => {
      active = false
    }
  }, [authEnabled, userId])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setSyncError('')
  }

  const handleNavigateToDashboard = (payload) => {
    setPlan(payload)
    setRoute('dashboard')
  }

  const handleBackHome = () => {
    setRoute('home')
    setPlan(null)
  }

  if (authEnabled && !authReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white text-sm font-medium text-slate-600">
        {messages.auth.loadingSession}
      </div>
    )
  }

  if (authEnabled && !session) {
    return (
      <AuthPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        onAuthSuccess={() => setRoute('home')}
      />
    )
  }

  if (route === 'vocab' && plan) {
    return (
      <VocabPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        userId={userId}
        todayVocabCount={todayVocabCount}
        onBack={() => setRoute('dashboard')}
      />
    )
  }

  if (route === 'grammar' && plan) {
    return (
      <GrammarPage
        messages={messages}
        locale={locale}
        language={language}
        setLocale={setLocale}
        onBack={() => setRoute('dashboard')}
      />
    )
  }

  if (route === 'progress' && plan) {
    return (
      <ProgressPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        userId={userId}
        days={plan.days}
        onBack={() => setRoute('dashboard')}
      />
    )
  }

  if (route === 'writing' && plan) {
    return (
      <WritingPage
        messages={messages}
        locale={locale}
        language={language}
        setLocale={setLocale}
        onBack={() => setRoute('dashboard')}
      />
    )
  }

  if (route === 'speaking' && plan) {
    return (
      <SpeakingPage
        messages={messages}
        locale={locale}
        language={language}
        setLocale={setLocale}
        onBack={() => setRoute('dashboard')}
      />
    )
  }

  if (route === 'dashboard' && plan) {
    return (
      <DashboardPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        userId={userId}
        days={plan.days}
        levelId={plan.levelId}
        levelLabel={plan.levelLabel}
        syncOk={!syncError}
        onSignOut={authEnabled ? handleSignOut : undefined}
        onBack={handleBackHome}
        onStartVocab={(count) => {
          setTodayVocabCount(count)
          setRoute('vocab')
        }}
        onStartGrammar={() => setRoute('grammar')}
        onStartWriting={() => setRoute('writing')}
        onStartSpeaking={() => setRoute('speaking')}
        onStartListening={() => setRoute('listening')}
        onViewProgress={() => setRoute('progress')}
      />
    )
  }

  if (route === 'listening' && plan) {
    return (
      <ListeningPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        onBack={() => setRoute('dashboard')}
        onComplete={() => setRoute('dashboard')}
      />
    )
  }

  return (
    <HomePage
      messages={messages}
      locale={locale}
      setLocale={setLocale}
      userId={userId}
      onNavigateToDashboard={handleNavigateToDashboard}
    />
  )
}

export default App
