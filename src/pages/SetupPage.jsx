import { useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import { savePlan } from '../lib/db.js'
import { PLAN_STORAGE_KEY, generatePlan, todayYmd } from '../utils/planGenerator.js'

const LEVEL_IDS = ['beginner', 'a1a2', 'b1']

/**
 * @param {{
 *   messages: { home: { levels: Record<string, string>; languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   userId?: string | null
 *   onBack?: () => void
 *   onComplete: (payload: { days: string; levelId: string; levelLabel: string; plan: any; startDate: string }) => void
 * }} props
 */
export function SetupPage({ messages, locale, setLocale, userId = null, onBack, onComplete }) {
  const { home: h, setup: s } = messages
  const [days, setDays] = useState('')
  const [levelId, setLevelId] = useState('beginner')
  const [dailyMinutes, setDailyMinutes] = useState('60')
  const [loading, setLoading] = useState(false)

  const daysTrim = days.trim()
  const daysNum = parseInt(daysTrim, 10)
  const daysValid = daysTrim !== '' && !Number.isNaN(daysNum) && daysNum >= 0
  const canSubmit = daysValid && Boolean(levelId) && Boolean(dailyMinutes)

  const getLevelLabel = (id) => h.levels[id] ?? id

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    const generatedPlan = generatePlan(daysNum, levelId)
    const startDate = todayYmd()
    const payload = {
      days: daysTrim,
      level: levelId,
      levelLabel: getLevelLabel(levelId),
      plan: generatedPlan,
      startDate,
      dailyMinutes,
    }

    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(payload))
      localStorage.setItem('goethe-ready-daily-minutes', dailyMinutes)
      if (userId) {
        await savePlan(userId, daysNum, levelId, startDate)
      }
      onComplete({
        days: daysTrim,
        levelId,
        levelLabel: getLevelLabel(levelId),
        plan: generatedPlan,
        startDate,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8FF', padding: '24px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#6C5CE7',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ← {s.back}
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

        <div
          style={{
            marginTop: 20,
            background: '#fff',
            borderRadius: 20,
            padding: '28px 24px',
            boxShadow: '0 10px 30px rgba(108,92,231,0.08)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, color: '#1a1a1a' }}>{s.title}</h1>
          <p style={{ marginTop: 8, marginBottom: 0, fontSize: 13, color: '#636e72' }}>
            {s.hint}
          </p>

          <div style={{ marginTop: 24, display: 'grid', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{s.daysLabel}</span>
              <input
                type="text"
                inputMode="numeric"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                style={{
                  width: 90,
                  border: 'none',
                  borderBottom: '3px solid #6C5CE7',
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#6C5CE7',
                  outline: 'none',
                  background: 'transparent',
                  paddingBottom: 4,
                }}
              />
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{s.daysUnit}</span>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{s.levelLabel}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {LEVEL_IDS.map((id) => {
                  const selected = levelId === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLevelId(id)}
                      style={{
                        border: selected ? '2px solid #6C5CE7' : '2px solid #E0E0E0',
                        background: selected ? '#F3F0FF' : '#fff',
                        color: selected ? '#6C5CE7' : '#636e72',
                        fontWeight: selected ? 700 : 500,
                        borderRadius: 12,
                        padding: '9px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      {getLevelLabel(id)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{s.durationLabel}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {[
                  { id: '30', label: s.duration30 },
                  { id: '60', label: s.duration60 },
                  { id: '120', label: s.duration120 },
                ].map((option) => {
                  const selected = dailyMinutes === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDailyMinutes(option.id)}
                      style={{
                        border: selected ? '2px solid #6C5CE7' : '2px solid #E0E0E0',
                        background: selected ? '#F3F0FF' : '#fff',
                        color: selected ? '#6C5CE7' : '#636e72',
                        fontWeight: selected ? 700 : 500,
                        borderRadius: 12,
                        padding: '9px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            style={{
              marginTop: 24,
              width: '100%',
              border: 'none',
              borderRadius: 14,
              padding: '14px 16px',
              cursor: !canSubmit || loading ? 'not-allowed' : 'pointer',
              opacity: !canSubmit || loading ? 0.45 : 1,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #8B5CF6 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {loading ? s.submitting : s.submit}
          </button>
        </div>
      </div>
    </div>
  )
}
