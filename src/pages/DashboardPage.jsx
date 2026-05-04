import { useEffect, useMemo, useState } from 'react'
import { PLAN_STORAGE_KEY, generatePlan, getDayIndex, getTodayTasks } from '../utils/planGenerator.js'
import * as checkin from '../utils/checkin.js'
import zh from '../i18n/zh.js'
import en from '../i18n/en.js'

const TASKS_STORAGE_PREFIX = 'tasks_'
const CHECKIN_STORAGE_PREFIX = 'checkin_'

const TASK_CONFIG = [
  {
    id: 'vocab',
    emoji: '📚',
    iconBg: '#EEF2FF',
  },
  {
    id: 'grammar',
    emoji: '🧠',
    iconBg: '#F3E8FF',
  },
  {
    id: 'listening',
    emoji: '🎧',
    iconBg: '#FFF0F3',
  },
  {
    id: 'speaking',
    emoji: '🎤',
    iconBg: '#FFF7E6',
  },
  {
    id: 'writing',
    emoji: '✍️',
    iconBg: '#F0FFF4',
  },
]

function formatYmd(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function readJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function getTaskSnapshots() {
  if (typeof localStorage === 'undefined') return []
  const rows = []
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(TASKS_STORAGE_PREFIX)) continue
      const date = key.slice(TASKS_STORAGE_PREFIX.length)
      const data = readJson(key, {})
      if (data && typeof data === 'object') {
        rows.push({ date, data })
      }
    }
  } catch {
    return []
  }
  return rows
}

function getCheckinMap() {
  if (typeof localStorage === 'undefined') return new Map()
  const map = new Map()
  const dailyRecords = readJson('goethe-ready-daily-records', {})
  if (dailyRecords && typeof dailyRecords === 'object') {
    for (const [date, rec] of Object.entries(dailyRecords)) {
      map.set(date, rec)
    }
  }
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(CHECKIN_STORAGE_PREFIX)) continue
      const date = key.slice(CHECKIN_STORAGE_PREFIX.length)
      const rec = readJson(key, null)
      if (rec && typeof rec === 'object') {
        map.set(String(rec.date || date), rec)
      } else {
        map.set(date, { date })
      }
    }
  } catch {
    // ignore iteration failures
  }
  return map
}

function calcStreakFromCheckin(todayYmd, checkinMap) {
  let streak = 0
  const cursor = new Date(`${todayYmd}T00:00:00`)
  for (let i = 0; i < 400; i++) {
    const key = cursor.toISOString().slice(0, 10)
    if (!checkinMap.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function readUserInitial(userEmail, userId) {
  if (typeof userEmail === 'string' && userEmail.trim()) {
    return userEmail.trim().charAt(0).toUpperCase()
  }
  if (typeof userId === 'string' && userId.trim()) return userId.trim().charAt(0).toUpperCase()
  return 'U'
}

function calcGrammarAccuracyFromStorage() {
  if (typeof localStorage === 'undefined') return null
  const ratios = []
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.toLowerCase().includes('grammar')) continue
      const val = readJson(key, null)
      const queue = Array.isArray(val) ? val : [val]
      for (const item of queue) {
        if (!item || typeof item !== 'object') continue
        const accuracy = Number(item.accuracy ?? item.correct_rate ?? item.rate ?? NaN)
        if (!Number.isNaN(accuracy)) {
          ratios.push(accuracy > 1 ? accuracy : accuracy * 100)
          continue
        }
        const correct = Number(item.correct ?? item.correctCount ?? item.correct_answers ?? NaN)
        const total = Number(item.total ?? item.totalCount ?? item.question_count ?? NaN)
        if (!Number.isNaN(correct) && !Number.isNaN(total) && total > 0) {
          ratios.push((correct / total) * 100)
        }
      }
    }
  } catch {
    return null
  }
  if (ratios.length === 0) return null
  return Math.round(ratios.reduce((sum, n) => sum + n, 0) / ratios.length)
}

/**
 * @param {{
 *   userId?: string | null
 *   userEmail?: string
 *   userName?: string
 *   days: string
 *   levelId: string
 *   onBack?: () => void
 *   syncOk?: boolean
 *   onSignOut?: () => void
 *   onUpdateUserName?: (name: string) => Promise<void> | void
 *   onUpdatePassword?: (password: string) => Promise<void> | void
 *   onDeleteAccount?: () => Promise<void> | void
 *   isGuestMode?: boolean
 *   onRegisterNow?: () => void
 *   onEditPlan?: () => void
 *   onStartVocab?: (count: number) => void
 *   onStartGrammar?: () => void
 *   onStartListening?: () => void
 *   onStartWriting?: () => void
 *   onStartSpeaking?: () => void
 * }} props
 */
export function DashboardPage(props) {
  const {
    userId = null,
    userEmail = '',
    userName = '',
    locale = 'zh',
    days,
    levelId,
    onBack,
    syncOk = true,
    onSignOut,
    onUpdateUserName,
    onUpdatePassword,
    onDeleteAccount,
    isGuestMode = false,
    onRegisterNow,
    onEditPlan,
    onViewProgress,
    onStartVocab,
    onStartGrammar,
    onStartListening,
    onStartWriting,
    onStartSpeaking,
  } = props
  const language = locale === 'en' ? 'en' : 'zh'
  const t = (key) => {
    const keys = key.split('.')
    let result = language === 'zh' ? zh : en
    for (const k of keys) {
      result = result?.[k]
    }
    return result || key
  }

  const todayYmd = useMemo(() => formatYmd(new Date()), [])
  const [refreshTick, setRefreshTick] = useState(0)
  const [done, setDone] = useState(() => {
    const raw = readJson(`${TASKS_STORAGE_PREFIX}${todayYmd}`, {})
    const next = {}
    for (const task of TASK_CONFIG) next[task.id] = Boolean(raw[task.id])
    return next
  })
  const [todayRecord, setTodayRecord] = useState(() => {
    const direct = readJson(`${CHECKIN_STORAGE_PREFIX}${todayYmd}`, null)
    if (direct) return direct
    const records = readJson('goethe-ready-daily-records', {})
    return records?.[todayYmd] || null
  })
  const [checkinBanner, setCheckinBanner] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [nameInput, setNameInput] = useState(userName || '')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordConfirmInput, setPasswordConfirmInput] = useState('')
  const [accountNotice, setAccountNotice] = useState('')
  const [accountError, setAccountError] = useState('')
  const [accountBusy, setAccountBusy] = useState(false)

  useEffect(() => {
    setNameInput(userName || '')
  }, [userName])

  useEffect(() => {
    const next = {}
    for (const task of TASK_CONFIG) next[task.id] = Boolean(done[task.id])
    try {
      localStorage.setItem(`${TASKS_STORAGE_PREFIX}${todayYmd}`, JSON.stringify(next))
    } catch {
      // ignore storage failures
    }
  }, [done, todayYmd])

  const storedPlan = useMemo(() => readJson(PLAN_STORAGE_KEY, null), [])
  const effectiveDays = String(storedPlan?.days ?? days ?? '80')
  const effectiveLevelId = storedPlan?.level ?? levelId ?? 'beginner'
  const generatedPlan = useMemo(
    () => storedPlan?.plan ?? generatePlan(effectiveDays, effectiveLevelId),
    [effectiveDays, effectiveLevelId, storedPlan],
  )
  const dayIndex = useMemo(() => {
    const startDate = storedPlan?.startDate
    if (!startDate) return 1
    return getDayIndex(startDate)
  }, [storedPlan])
  const todayPlan = useMemo(() => getTodayTasks(generatedPlan, dayIndex), [generatedPlan, dayIndex])
  const remainingDays = Math.max(0, Number(generatedPlan.days || effectiveDays) - dayIndex + 1)

  const levelLabelMap = {
    beginner: String(t('dashboard.levelBeginner')),
    a1a2: 'A1-A2',
    b1: 'B1',
  }
  const levelDisplay = levelLabelMap[effectiveLevelId] || effectiveLevelId || levelLabelMap.beginner

  const taskSnapshots = useMemo(() => getTaskSnapshots(), [refreshTick, done])
  const checkinMap = useMemo(() => getCheckinMap(), [refreshTick, todayRecord])
  const streakDays = useMemo(() => calcStreakFromCheckin(todayYmd, checkinMap), [todayYmd, checkinMap])

  const completedTasksCumulative = useMemo(() => {
    let n = 0
    for (const row of taskSnapshots) {
      for (const value of Object.values(row.data)) {
        if (value === true) n += 1
      }
    }
    return n
  }, [taskSnapshots])
  const expPoints = completedTasksCumulative * 100

  const doneCount = TASK_CONFIG.filter((task) => Boolean(done[task.id])).length
  const todayCheckinRecord = checkinMap.get(todayYmd)
  const todayVocab = Number(todayCheckinRecord?.vocab_count ?? 0) || 0
  const grammarAccuracy = useMemo(() => calcGrammarAccuracyFromStorage(), [])

  const vocabMastered = useMemo(() => {
    const arr = readJson('vocab_mastered', [])
    return Array.isArray(arr) ? arr.length : 0
  }, [])
  const vocabProgressPct = Math.max(0, Math.min(100, Math.round((vocabMastered / 2704) * 100)))

  const userInitial = readUserInitial(userEmail, userId)

  const taskDescription = {
    vocab: String(t('dashboard.vocabDesc')).replace('{n}', String(todayPlan.todayVocab || 0)),
    grammar: String(t('dashboard.grammarDesc')),
    listening: String(t('dashboard.listeningDesc')),
    speaking: String(t('dashboard.speakingDesc')),
    writing: String(t('dashboard.writingDesc')),
  }

  const startTask = (taskId) => {
    if (taskId === 'vocab') onStartVocab?.(Number(todayPlan.todayVocab || 20))
    if (taskId === 'grammar') onStartGrammar?.()
    if (taskId === 'listening') onStartListening?.()
    if (taskId === 'speaking') onStartSpeaking?.()
    if (taskId === 'writing') onStartWriting?.()
  }

  const toggleTaskDone = (taskId) => {
    setDone((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleCheckin = () => {
    if (todayRecord) return
    const completed = TASK_CONFIG.filter((task) => done[task.id]).map((task) => task.id)
    const missed = TASK_CONFIG.filter((task) => !done[task.id]).map((task) => task.id)
    const isFull = missed.length === 0
    const vocabCount = done.vocab ? Number(todayPlan.todayVocab || 0) : 0
    const payload = {
      date: todayYmd,
      completed,
      missed,
      isFull,
      vocab_count: vocabCount,
    }

    checkin.saveDailyCheckin(todayYmd, {
      completed,
      missed,
      isFull,
    })
    if (missed.length > 0) {
      checkin.applyMissedCompensation(missed, todayYmd)
    }
    try {
      localStorage.setItem(`${CHECKIN_STORAGE_PREFIX}${todayYmd}`, JSON.stringify(payload))
    } catch {
      // ignore storage failures
    }
    setTodayRecord(payload)
    setRefreshTick((n) => n + 1)

    if (isFull) {
      const streak = checkin.computeFullCompletionStreak(todayYmd)
      setCheckinBanner(String(t('dashboard.checkinFullMsg')).replace('{n}', String(streak)))
    } else {
      setCheckinBanner(String(t('dashboard.checkinPartialMsg')))
    }
  }

  const handleSaveUserName = async () => {
    if (!onUpdateUserName) return
    const trimmed = nameInput.trim()
    if (!trimmed) {
      setAccountError(String(t('dashboard.accountNameRequired')))
      setAccountNotice('')
      return
    }
    setAccountBusy(true)
    setAccountError('')
    setAccountNotice('')
    try {
      await onUpdateUserName(trimmed)
      setAccountNotice(String(t('dashboard.accountNameSaved')))
    } catch {
      setAccountError(String(t('dashboard.accountActionFailed')))
    } finally {
      setAccountBusy(false)
    }
  }

  const handleSavePassword = async () => {
    if (!onUpdatePassword) return
    if (passwordInput.length < 6) {
      setAccountError(String(t('dashboard.accountPasswordTooShort')))
      setAccountNotice('')
      return
    }
    if (passwordInput !== passwordConfirmInput) {
      setAccountError(String(t('dashboard.accountPasswordMismatch')))
      setAccountNotice('')
      return
    }
    setAccountBusy(true)
    setAccountError('')
    setAccountNotice('')
    try {
      await onUpdatePassword(passwordInput)
      setPasswordInput('')
      setPasswordConfirmInput('')
      setAccountNotice(String(t('dashboard.accountPasswordUpdated')))
    } catch {
      setAccountError(String(t('dashboard.accountActionFailed')))
    } finally {
      setAccountBusy(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!onDeleteAccount) return
    setAccountBusy(true)
    setAccountError('')
    setAccountNotice('')
    try {
      await onDeleteAccount()
    } catch {
      setAccountError(String(t('dashboard.accountDeleteFailed')))
      setShowDeleteConfirm(false)
      setAccountBusy(false)
    }
  }

  return (
    <div style={{ background: '#F8F8FF', minHeight: '100vh', paddingBottom: 24 }}>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#6C5CE7',
              color: '#fff',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            G
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#1a1a1a' }}>GoetheReady</div>
            <div style={{ fontSize: 12, color: '#636e72', marginTop: 2 }}>{t('dashboard.brandSub')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ background: '#FFF3E0', borderRadius: 20, padding: '6px 14px' }}>
            <span style={{ color: '#FF6B35', fontWeight: 600, fontSize: 13 }}>
              🔥 {streakDays} {t('dashboard.streak')}
            </span>
          </div>
          <div style={{ background: '#FFF9E6', borderRadius: 20, padding: '6px 14px' }}>
            <span style={{ color: '#FDCB6E', fontWeight: 600, fontSize: 13 }}>
              ⭐ {expPoints}
              {language === 'zh' ? t('dashboard.xpUnit') : ` ${t('dashboard.xpUnit')}`}
            </span>
          </div>
          <span style={{ fontSize: 12, color: syncOk ? '#16A34A' : '#D97706', fontWeight: 600 }}>
            {syncOk ? t('dashboard.syncOkSmall') : t('dashboard.syncIssue')}
          </span>
          <button
            type="button"
            onClick={() => {
              setAccountOpen((prev) => !prev)
              setAccountError('')
              setAccountNotice('')
            }}
            aria-label={t('dashboard.accountOpenPanel')}
            style={{
              border: 'none',
              padding: 0,
              background: 'transparent',
              cursor: 'pointer',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#EFEAFE',
              color: '#6C5CE7',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {userInitial}
          </button>
          {accountOpen && (
            <div
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 320,
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: 14,
                boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                zIndex: 30,
              }}
            >
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>{userEmail || '-'}</div>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                {t('dashboard.accountUserName')}
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('dashboard.accountUserNamePlaceholder')}
                style={{
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleSaveUserName}
                disabled={accountBusy || !onUpdateUserName}
                style={{
                  marginTop: 8,
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 10px',
                  background: '#6C5CE7',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: accountBusy ? 'not-allowed' : 'pointer',
                  opacity: accountBusy ? 0.6 : 1,
                }}
              >
                {t('dashboard.accountSaveName')}
              </button>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginTop: 12, marginBottom: 6 }}>
                {t('dashboard.accountChangePassword')}
              </div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={t('dashboard.accountNewPassword')}
                minLength={6}
                style={{
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <input
                type="password"
                value={passwordConfirmInput}
                onChange={(e) => setPasswordConfirmInput(e.target.value)}
                placeholder={t('dashboard.accountConfirmPassword')}
                minLength={6}
                style={{
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: 13,
                  outline: 'none',
                  marginTop: 8,
                }}
              />
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={accountBusy || !onUpdatePassword}
                style={{
                  marginTop: 8,
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 10px',
                  background: '#111827',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: accountBusy ? 'not-allowed' : 'pointer',
                  opacity: accountBusy ? 0.6 : 1,
                }}
              >
                {t('dashboard.accountUpdatePassword')}
              </button>

              {accountNotice && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#15803D', fontWeight: 600 }}>{accountNotice}</div>
              )}
              {accountError && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{accountError}</div>
              )}

              <div style={{ height: 1, background: '#E5E7EB', margin: '12px 0' }} />
              <button
                type="button"
                onClick={onSignOut}
                disabled={accountBusy || !onSignOut}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#6B7280',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: accountBusy ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
              >
                {t('dashboard.signOutNav')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={accountBusy || !onDeleteAccount}
                style={{
                  marginTop: 10,
                  border: 'none',
                  background: 'transparent',
                  color: '#DC2626',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: accountBusy ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
              >
                {t('dashboard.accountDelete')}
              </button>
            </div>
          )}
        </div>
      </nav>

      {isGuestMode && (
        <div
          style={{
            margin: '12px 24px',
            borderRadius: 12,
            background: '#FFF9E6',
            border: '1px solid #FDE68A',
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: '#92400E' }}>
            {t('dashboard.guestModeBanner')}
          </span>
          {onRegisterNow && (
            <button
              type="button"
              onClick={onRegisterNow}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#6C5CE7',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                whiteSpace: 'nowrap',
              }}
            >
              {t('dashboard.registerNow')}
            </button>
          )}
        </div>
      )}

      <section style={{ padding: '24px 24px 0' }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#6C5CE7',
              fontSize: 13,
              cursor: 'pointer',
              padding: 0,
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            {t('dashboard.backHome')}
          </button>
        )}
        <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a' }}>{t('dashboard.greeting')}</div>
        <div style={{ fontSize: 14, color: '#636e72', marginTop: 4 }}>{t('dashboard.greetingSub')}</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {onViewProgress && (
            <button
              type="button"
              onClick={onViewProgress}
              style={{
                border: '1px solid #6C5CE7',
                background: '#fff',
                color: '#6C5CE7',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 12,
                padding: '8px 14px',
                cursor: 'pointer',
              }}
            >
              {t('dashboard.viewProgress')}
            </button>
          )}
          {onEditPlan && (
            <button
              type="button"
              onClick={onEditPlan}
              style={{
                border: '1px solid #DDD6FE',
                background: '#fff',
                color: '#6C5CE7',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 12,
                padding: '8px 14px',
                cursor: 'pointer',
              }}
            >
              {t('dashboard.editPlan')}
            </button>
          )}
        </div>
      </section>

      <section
        style={{
          margin: '16px 24px',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #8B5CF6 50%, #A78BFA 100%)',
          borderRadius: 20,
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#fff',
        }}
      >
        <div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            📅 {t('dashboard.daysLeft')}
          </div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{remainingDays}</span>
            <span style={{ fontSize: 20 }}>{t('dashboard.daysUnit')}</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
            {t('dashboard.level')}：{levelDisplay}
          </div>
        </div>
        <div
          style={{
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 40 }}>🏆</span>
        </div>
      </section>

      <section
        style={{
          margin: '12px 24px',
          background: 'linear-gradient(135deg, #FFF3E0, #FFEAA7)',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            position: 'relative',
            animation: 'jump 0.6s ease-in-out infinite alternate',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              background: '#6C5CE7',
              borderRadius: '50%',
              position: 'absolute',
              top: 0,
              left: '13px',
            }}
          />
          <div
            style={{
              width: '3px',
              height: '12px',
              background: '#6C5CE7',
              position: 'absolute',
              top: '14px',
              left: '19px',
              borderRadius: '2px',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '3px',
              background: '#6C5CE7',
              position: 'absolute',
              top: '17px',
              left: '10px',
              borderRadius: '2px',
              transform: 'rotate(-30deg)',
              transformOrigin: 'right center',
              animation: 'armLeft 0.6s ease-in-out infinite alternate',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '3px',
              background: '#6C5CE7',
              position: 'absolute',
              top: '17px',
              left: '22px',
              borderRadius: '2px',
              transform: 'rotate(30deg)',
              transformOrigin: 'left center',
              animation: 'armRight 0.6s ease-in-out infinite alternate',
            }}
          />
          <div
            style={{
              width: '3px',
              height: '11px',
              background: '#6C5CE7',
              position: 'absolute',
              top: '26px',
              left: '15px',
              borderRadius: '2px',
              transform: 'rotate(-15deg)',
              transformOrigin: 'top center',
              animation: 'legLeft 0.6s ease-in-out infinite alternate',
            }}
          />
          <div
            style={{
              width: '3px',
              height: '11px',
              background: '#6C5CE7',
              position: 'absolute',
              top: '26px',
              left: '24px',
              borderRadius: '2px',
              transform: 'rotate(15deg)',
              transformOrigin: 'top center',
              animation: 'legRight 0.6s ease-in-out infinite alternate',
            }}
          />
        </div>
        <span style={{ fontSize: 14, color: '#8B6914', fontWeight: 500 }}>{t('dashboard.motivationMsg')}</span>
      </section>

      <section style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 12px' }}>
          <span
            style={{
              width: 20,
              height: 20,
              border: '2px solid #6C5CE7',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C5CE7' }} />
          </span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{t('dashboard.todayTasks')}</span>
        </div>
        <div style={{ marginBottom: 12, fontSize: 13, color: '#636e72' }}>
          {t('dashboard.todayProgress')}：{doneCount}/{TASK_CONFIG.length}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {TASK_CONFIG.map((task) => {
            const isDone = Boolean(done[task.id])
            return (
              <div
                key={task.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '16px 20px',
                  border: isDone ? '1.5px solid #52C41A' : '1px solid #f0f0f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                }}
              >
                {isDone && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 8,
                      color: '#52C41A',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      background: task.iconBg,
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    {task.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{t(`dashboard.${task.id}`)}</div>
                    <div style={{ fontSize: 12, color: '#636e72', marginTop: 2 }}>{taskDescription[task.id]}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTaskDone(task.id)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: isDone ? '#52C41A' : '#F2F2F2',
                      color: isDone ? '#fff' : '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    aria-label={
                      isDone ? t('dashboard.markIncomplete') : t('dashboard.markDone')
                    }
                  >
                    {isDone ? '✓' : '>'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => startTask(task.id)}
                  style={{
                    marginTop: 12,
                    width: '100%',
                    background: '#6C5CE7',
                    borderRadius: 10,
                    padding: '8px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {t('dashboard.start')}
                </button>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleCheckin}
            disabled={Boolean(todayRecord)}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FDCB6E, #E17055)',
              color: '#1a1a1a',
              fontWeight: 700,
              fontSize: 13,
              padding: '10px 12px',
              cursor: todayRecord ? 'not-allowed' : 'pointer',
              opacity: todayRecord ? 0.5 : 1,
            }}
          >
            {todayRecord ? t('dashboard.checkedIn') : t('dashboard.checkIn')}
          </button>
        </div>
        {checkinBanner ? (
          <div style={{ marginTop: 8, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>{checkinBanner}</div>
        ) : null}
      </section>

      <section style={{ padding: '0 24px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>
          ⚡ {t('dashboard.learningPath')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #FDCB6E, #E17055)',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 32, color: '#fff' }}>📖</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 12 }}>{t('dashboard.pathVocabTitle')}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{t('dashboard.pathVocabSub')}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 12, color: '#fff' }}>
              <span>{t('dashboard.pathProgress')}</span>
              <span>{vocabProgressPct}%</span>
            </div>
            <div style={{ marginTop: 4, background: 'rgba(255,255,255,0.3)', height: 4, borderRadius: 2 }}>
              <div style={{ width: `${vocabProgressPct}%`, height: '100%', background: '#fff', borderRadius: 2 }} />
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 32, color: '#fff' }}>⚡</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 12 }}>{t('dashboard.aiModeTitle')}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{t('dashboard.aiModeSub')}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{t('dashboard.aiModeHint')}</div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #74B9FF, #0984E3)',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 32, color: '#fff' }}>🎯</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 12 }}>{t('dashboard.examTitle')}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{t('dashboard.examSub')}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{t('dashboard.examHint')}</div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 12,
          padding: '16px 24px 32px',
        }}
      >
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#6C5CE7' }}>{todayVocab}</div>
          <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>{t('dashboard.vocabCount')}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#74B9FF' }}>{doneCount}</div>
          <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>{t('dashboard.completedTasks')}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FDCB6E' }}>{streakDays}</div>
          <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>{t('dashboard.streak')}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#E17055' }}>
            {`${grammarAccuracy == null ? 0 : grammarAccuracy}%`}
          </div>
          <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>{t('dashboard.accuracy')}</div>
        </div>
      </section>
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          <div style={{ width: 420, maxWidth: '92vw', background: '#fff', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{t('dashboard.accountDeleteTitle')}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
              {t('dashboard.accountDeleteConfirm')}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={accountBusy}
                style={{
                  border: '1px solid #D1D5DB',
                  background: '#fff',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                  cursor: accountBusy ? 'not-allowed' : 'pointer',
                }}
              >
                {t('dashboard.accountCancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={accountBusy}
                style={{
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: accountBusy ? 'not-allowed' : 'pointer',
                  opacity: accountBusy ? 0.7 : 1,
                }}
              >
                {accountBusy ? t('dashboard.accountDeleting') : t('dashboard.accountDeleteConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
