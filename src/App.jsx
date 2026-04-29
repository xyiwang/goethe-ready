import { useMemo, useState } from 'react'
import { HomePage } from './pages/HomePage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { VocabPage } from './pages/VocabPage.jsx'
import { GrammarPage } from './pages/GrammarPage.jsx'
import { ProgressPage } from './pages/ProgressPage.jsx'
import { WritingPage } from './pages/WritingPage.jsx'
import { SpeakingPage } from './pages/SpeakingPage.jsx'
import { getMessages } from './i18n/index.js'

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
  const [locale, setLocaleState] = useState(() => readInitialLocale())

  const setLocale = (next) => {
    const value = next === 'en' ? 'en' : 'zh'
    setLocaleState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, value)
    }
  }

  const messages = useMemo(() => getMessages(locale), [locale])
  const language = locale

  const handleNavigateToDashboard = (payload) => {
    setPlan(payload)
    setRoute('dashboard')
  }

  const handleBackHome = () => {
    setRoute('home')
    setPlan(null)
  }

  if (route === 'vocab' && plan) {
    return (
      <VocabPage
        messages={messages}
        locale={locale}
        setLocale={setLocale}
        onBack={() => setRoute('dashboard')}
      />
    )
  }

  if (route === 'grammar' && plan) {
    return (
      <GrammarPage
        messages={messages}
        locale={locale}
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
        days={plan.days}
        levelId={plan.levelId}
        levelLabel={plan.levelLabel}
        onBack={handleBackHome}
        onStartVocab={() => setRoute('vocab')}
        onStartGrammar={() => setRoute('grammar')}
        onStartWriting={() => setRoute('writing')}
        onStartSpeaking={() => setRoute('speaking')}
        onViewProgress={() => setRoute('progress')}
      />
    )
  }

  return (
    <HomePage
      messages={messages}
      locale={locale}
      setLocale={setLocale}
      onNavigateToDashboard={handleNavigateToDashboard}
    />
  )
}

export default App
