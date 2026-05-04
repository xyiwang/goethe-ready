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
import { SetupPage } from './pages/SetupPage.jsx'
import { getMessages } from './i18n/index.js'
import { isSupabaseConfigured, supabase } from './lib/supabase.js'
import { deletePlan, getCheckins, getPlan, getVocabProgress } from './lib/db.js'
import { PLAN_STORAGE_KEY, generatePlan } from './utils/planGenerator.js'

const LOCALE_STORAGE_KEY = 'goethe-ready-locale'
const CHECKIN_STORAGE_PREFIX = 'checkin_'

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

function readJsonSafely(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJsonSafely(key, value) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures
  }
}

function App() {
  const [route, setRoute] = useState('home')
  const [authMode, setAuthMode] = useState('signin')
  const [plan, setPlan] = useState(null)
  const [todayVocabCount, setTodayVocabCount] = useState(20)
  const [locale, setLocaleState] = useState(() => readInitialLocale())
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
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
  const userEmail = session?.user?.email ?? ''
  const userName = session?.user?.user_metadata?.username ?? ''
  const buildPlanPayload = (cloudPlan) => {
    const days = String(cloudPlan.days)
    const levelId = String(cloudPlan.level)
    return {
      days,
      levelId,
      levelLabel: levelId,
      plan: generatePlan(days, levelId),
      startDate: String(cloudPlan.start_date),
    }
  }
  const persistPlanToLocal = (payload) => {
    if (typeof window === 'undefined' || !payload) return
    localStorage.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({
        days: payload.days,
        level: payload.levelId,
        levelLabel: payload.levelLabel,
        plan: payload.plan,
        startDate: payload.startDate,
      }),
    )
  }

  useEffect(() => {
    if (!authEnabled || !supabase) {
      setLoading(false)
      return
    }

    let active = true
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session ?? null)
      })
      .catch(() => {
        if (!active) return
        setSession(null)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession((prevSession) => {
        const prevUserId = prevSession?.user?.id ?? null
        const nextUserId = nextSession?.user?.id ?? null
        if (prevUserId !== nextUserId) {
          setLoading(true)
        }
        return nextSession ?? null
      })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [authEnabled])

  useEffect(() => {
    if (!authEnabled || !supabase) return

    if (!userId) {
      setPlan(null)
      setSyncError('')
      setRoute('home')
      setLoading(false)
      return
    }

    let active = true
    const bootstrapPlan = async () => {
      try {
        const [cloudPlan, cloudCheckins, cloudVocab] = await Promise.all([
          getPlan(userId),
          getCheckins(userId),
          getVocabProgress(userId),
        ])
        if (!active) return

        if (Array.isArray(cloudCheckins)) {
          const dailyMap = {}
          for (const row of cloudCheckins) {
            const date = String(row.date || '')
            if (!date) continue
            const record = {
              date,
              completed: Array.isArray(row.completed_tasks) ? row.completed_tasks : [],
              isFull: Boolean(row.is_complete),
              vocab_count: Number(row.vocab_count ?? 0),
            }
            writeJsonSafely(`${CHECKIN_STORAGE_PREFIX}${date}`, record)
            dailyMap[date] = {
              date,
              completed: record.completed,
              isFull: record.isFull,
            }
          }
          writeJsonSafely('goethe-ready-daily-records', dailyMap)
        }

        if (cloudVocab) {
          localStorage.setItem('vocab_progress', String(cloudVocab.vocab_index ?? 0))
          writeJsonSafely('vocab_mastered', Array.isArray(cloudVocab.mastered_ids) ? cloudVocab.mastered_ids : [])
        }

        if (cloudPlan) {
          const payload = buildPlanPayload(cloudPlan)
          persistPlanToLocal(payload)
          setPlan(payload)
          setRoute('dashboard')
        } else {
          setPlan(null)
          setRoute('setup')
        }
        setSyncError('')
      } catch {
        if (!active) return
        setSyncError('1')
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    setLoading(true)
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
    setPlan(null)
    setRoute('home')
  }

  const handleNavigateToDashboard = (payload) => {
    setPlan(payload)
    setRoute('dashboard')
  }

  const handleBackHome = () => {
    setRoute('home')
    setPlan(null)
  }

  const openAuth = (mode) => {
    setAuthMode(mode === 'signup' ? 'signup' : 'signin')
    setRoute('auth')
  }

  const openSetupGuest = () => {
    setRoute('setup')
  }

  const handleUpdateUserName = async (nextName) => {
    if (!supabase) return
    const trimmed = String(nextName || '').trim()
    const { data, error } = await supabase.auth.updateUser({
      data: { username: trimmed },
    })
    if (error) throw error
    if (data?.user) {
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          user: data.user,
        }
      })
    }
  }

  const handleUpdatePassword = async (nextPassword) => {
    if (!supabase) return
    const { error } = await supabase.auth.updateUser({ password: nextPassword })
    if (error) throw error
  }

  const handleDeleteAccount = async () => {
    if (!supabase) return
    if (userId) {
      await deletePlan(userId)
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear()
      } catch {
        // ignore storage failures
      }
    }
    await supabase.auth.signOut()
    setSession(null)
    setSyncError('')
    setPlan(null)
    setRoute('home')
  }

  const handleAuthSuccess = async () => {
    if (!authEnabled || !supabase) return
    setLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      const nextSession = data.session ?? null
      const nextUserId = nextSession?.user?.id ?? null
      setSession(nextSession)
      if (!nextUserId) {
        setPlan(null)
        setRoute('home')
        return
      }
      const cloudPlan = await getPlan(nextUserId)
      if (cloudPlan) {
        const payload = buildPlanPayload(cloudPlan)
        persistPlanToLocal(payload)
        setPlan(payload)
        setRoute('dashboard')
      } else {
        setPlan(null)
        setRoute('setup')
      }
    } catch {
      setPlan(null)
      setRoute('setup')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white text-sm font-medium text-slate-600">
        {messages.auth.loadingSession}
      </div>
    )
  }

  if (route === 'auth') {
    return (
      <AuthPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        initialMode={authMode}
        onBack={() => setRoute('home')}
        onTryGuest={() => setRoute('setup')}
        onAuthSuccess={handleAuthSuccess}
      />
    )
  }

  if (route === 'setup') {
    return (
      <SetupPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        userId={userId}
        onBack={() => setRoute('home')}
        onComplete={handleNavigateToDashboard}
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
        onUpdateUserName={authEnabled ? handleUpdateUserName : undefined}
        onUpdatePassword={authEnabled ? handleUpdatePassword : undefined}
        onDeleteAccount={authEnabled ? handleDeleteAccount : undefined}
        userEmail={userEmail}
        userName={userName}
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
        onEditPlan={() => setRoute('setup')}
        isGuestMode={!userId}
        onRegisterNow={() => openAuth('signup')}
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
      authEnabled={authEnabled}
      onOpenSignIn={() => openAuth('signin')}
      onOpenSignUp={() => openAuth('signup')}
      onOpenGuestSetup={openSetupGuest}
      onNavigateToDashboard={handleNavigateToDashboard}
    />
  )
}

export default App
