import { useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import { PLAN_STORAGE_KEY, generatePlan, todayYmd } from '../utils/planGenerator.js'
import { savePlan } from '../lib/db.js'

const LEVEL_IDS = ['beginner', 'a1a2', 'b1']

/**
 * @param {{
 *   messages: { home: Record<string, string | Record<string, string>> }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   userId?: string | null
 *   onNavigateToDashboard: (payload: { days: string; levelId: string; levelLabel: string }) => void
 * }} props
 */
export function HomePage({ messages, locale, setLocale, userId = null, onNavigateToDashboard }) {
  const { home: h } = messages
  const language = locale === 'en' ? 'en' : 'zh'
  const content = {
    zh: {
      heroTitle1: '用 AI 征服',
      heroTitle2: '歌德 B1',
      tagline: '智能规划 · 每日打卡 · AI批改',
      daysLabel: '距考试还有',
      daysUnit: '天',
      levelLabel: '当前水平',
      levels: ['零基础', '已过A1/A2', 'B1冲高分'],
      startBtn: '开始我的备考计划 →',
      userCount: '已有 2,847 人在备考',
      feature1Title: '智能备考计划',
      feature1Desc: '根据你的时间和水平自动生成',
      feature2Title: '2704个官方词汇',
      feature2Desc: '来自歌德学院官方B1词表',
      feature3Title: 'AI实时批改',
      feature3Desc: '写作和口语即时反馈',
      card1Sub: '官方B1词汇',
      card2Title: 'AI批改',
      card2Sub: '写作+口语实时反馈',
      card3Title: '真实考题',
      card3Sub: '官方B1练习材料',
      taskPreview: '今日任务 ✨',
      streakLabel: '连续',
      streakUnit: '天',
      keepGoing: '保持势头！',
      todayVocab: '今日词汇',
      todayVocabCount: '32 个新词',
      vocabCardCount: '2704个',
      streakTitle: '连续打卡',
      guest: '游客',
      synced: '云端同步已开启',
      previewVocab: '词汇：32个新词',
      previewGrammar: '语法：Konjunktiv II',
      previewWriting: '写作：邮件练习',
      previewDone: '今日完成 3/4',
    },
    en: {
      heroTitle1: 'Conquer with AI',
      heroTitle2: 'Goethe B1',
      tagline: 'Smart Planning · Daily Check-in · AI Feedback',
      daysLabel: 'Days until exam',
      daysUnit: 'days',
      levelLabel: 'Current level',
      levels: ['Complete beginner', 'Finished A1/A2', 'B1 — aiming high'],
      startBtn: 'Build my study plan →',
      userCount: '2,847 learners already studying',
      feature1Title: 'Smart Study Plan',
      feature1Desc: 'Auto-generated based on your time and level',
      feature2Title: '2704 Official Words',
      feature2Desc: 'From Goethe Institute\'s official B1 word list',
      feature3Title: 'AI Instant Feedback',
      feature3Desc: 'Real-time writing and speaking correction',
      card1Sub: 'Official B1 Vocabulary',
      card2Title: 'AI Correction',
      card2Sub: 'Writing + speaking feedback',
      card3Title: 'Real Exam Questions',
      card3Sub: 'Official B1 practice materials',
      taskPreview: 'Today\'s Tasks ✨',
      streakLabel: '',
      streakUnit: 'day streak',
      keepGoing: 'Keep it up!',
      todayVocab: 'Today\'s Vocab',
      todayVocabCount: '32 new words',
      vocabCardCount: '2704',
      streakTitle: 'Check-in streak',
      guest: 'Guest',
      synced: 'Cloud Sync On',
      previewVocab: 'Vocab: 32 new words',
      previewGrammar: 'Grammar: Konjunktiv II',
      previewWriting: 'Writing: Email practice',
      previewDone: 'Done today 3/4',
    },
  }
  const c = language === 'zh' ? content.zh : content.en
  const [days, setDays] = useState('')
  const [levelId, setLevelId] = useState(null)

  const daysTrim = days.trim()
  const daysNum = parseInt(daysTrim, 10)
  const daysValid = daysTrim !== '' && !Number.isNaN(daysNum) && daysNum >= 0
  const canSubmit = daysValid && levelId != null

  const getLevelLabel = (id) => {
    const idx = LEVEL_IDS.indexOf(id)
    if (idx >= 0 && c.levels[idx]) return c.levels[idx]
    return h.levels[id] ?? ''
  }

  const handleStart = async () => {
    if (!canSubmit || !levelId) return
    const generatedPlan = generatePlan(daysNum, levelId)
    const startDate = todayYmd()
    const payload = {
      days: daysTrim,
      level: levelId,
      levelLabel: getLevelLabel(levelId),
      plan: generatedPlan,
      startDate,
    }
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(payload))
    if (userId) {
      try {
        await savePlan(userId, daysNum, levelId, startDate)
      } catch {
        // keep local cache even if cloud write fails
      }
    }
    onNavigateToDashboard({
      days: daysTrim,
      levelId,
      levelLabel: getLevelLabel(levelId),
      plan: generatedPlan,
      startDate,
    })
  }

  return (
    <div
      className="home-page-root"
      style={{ background: '#FFFFFF', padding: 0, paddingBottom: 60, overflow: 'hidden', minHeight: '100vh' }}
    >
      <style>{`
        .home-page-root .hero-line-two {
          position: relative;
          display: inline-block;
        }
        .home-page-root .hero-line-two::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 6px;
          background: #FDCB6E;
          border-radius: 3px;
          transform: rotate(-1deg);
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .home-page-root .cta-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .home-page-root .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(108,92,231,0.3);
        }
      `}</style>

      <div
        style={{
          height: '64px',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: '#6C5CE7' }}>GoetheReady</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitch
            locale={locale}
            setLocale={setLocale}
            zhLabel={h.languageSwitchZh}
            enLabel="EN"
          />
          <span style={{ fontSize: 12, color: '#636e72' }}>{userId ? c.synced : c.guest}</span>
        </div>
      </div>

      <section
        style={{
          position: 'relative',
          padding: '80px 48px 40px',
          minHeight: 500,
        }}
      >
        <div
          style={{
            width: '50%',
            float: 'left',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#1a1a1a',
              lineHeight: 1.1,
              letterSpacing: '-2px',
            }}
          >
            {c.heroTitle1}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: '72px',
              fontWeight: 900,
              color: '#6C5CE7',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span className="hero-line-two">{c.heroTitle2}</span>
            <span style={{ fontSize: '56px' }}>🇩🇪</span>
          </div>
          <div style={{ fontSize: '16px', color: '#636e72', marginTop: 24 }}>{c.tagline}</div>

          <div style={{ marginTop: 48 }}>
            <div style={{ display: 'flex', gap: 24, maxWidth: 980 }}>
              <div
                style={{
                  width: '55%',
                  background: '#fff',
                  borderRadius: 24,
                  padding: '32px 40px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>{c.daysLabel}</span>
                  <input
                    id="exam-days"
                    type="text"
                    inputMode="numeric"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    aria-label={h.daysLabel}
                    style={{
                      width: 80,
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                      border: 'none',
                      borderBottom: '3px solid #6C5CE7',
                      outline: 'none',
                      color: '#6C5CE7',
                      background: 'transparent',
                      paddingBottom: 4,
                    }}
                  />
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>{c.daysUnit}</span>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  {LEVEL_IDS.map((id) => {
                    const label = getLevelLabel(id)
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
                          fontWeight: selected ? 600 : 500,
                          padding: '10px 20px',
                          borderRadius: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!canSubmit}
                  className="cta-btn"
                  style={{
                    width: '100%',
                    marginTop: 24,
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #8B5CF6 100%)',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                    padding: '16px',
                    borderRadius: 16,
                    border: 'none',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    opacity: canSubmit ? 1 : 0.4,
                  }}
                >
                  {c.startBtn}
                </button>
              </div>

              <div
                style={{
                  width: '45%',
                  background: '#fff',
                  borderRadius: 20,
                  padding: '20px 24px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ paddingBottom: 14, borderBottom: '1px solid #ECECEC' }}>
                  <div style={{ fontSize: '32px' }}>🧠</div>
                  <div style={{ marginTop: 8, fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{c.feature1Title}</div>
                  <div style={{ marginTop: 4, fontSize: '13px', color: '#636e72' }}>{c.feature1Desc}</div>
                </div>

                <div style={{ paddingTop: 14, paddingBottom: 14, borderBottom: '1px solid #ECECEC' }}>
                  <div style={{ fontSize: '32px' }}>📚</div>
                  <div style={{ marginTop: 8, fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{c.feature2Title}</div>
                  <div style={{ marginTop: 4, fontSize: '13px', color: '#636e72' }}>{c.feature2Desc}</div>
                </div>

                <div style={{ paddingTop: 14 }}>
                  <div style={{ fontSize: '32px' }}>🤖</div>
                  <div style={{ marginTop: 8, fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{c.feature3Title}</div>
                  <div style={{ marginTop: 4, fontSize: '13px', color: '#636e72' }}>{c.feature3Desc}</div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                width: '55%',
                background: '#F3F0FF',
                borderRadius: 16,
                padding: '16px 20px',
              }}
            >
              <span style={{ fontSize: '14px', color: '#6C5CE7' }}>📊 {c.userCount}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '50%',
            height: '100%',
            zIndex: 1,
          }}
          aria-hidden
        >
          <div
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              background: '#FDCB6E',
              borderRadius: '50%',
              right: 80,
              top: 30,
              opacity: 0.9,
              animation: 'float1 4s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 150,
              height: 150,
              border: '4px solid #6C5CE7',
              borderRadius: '50%',
              right: 200,
              top: 120,
              opacity: 0.3,
              animation: 'float2 5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 60,
              height: 60,
              background: '#6C5CE7',
              borderRadius: '50%',
              right: 60,
              top: 200,
              opacity: 0.6,
              animation: 'float1 3s ease-in-out infinite',
            }}
          />
          <div style={{ position: 'absolute', right: 180, top: 250 }}>
            <svg width="120" height="40" viewBox="0 0 120 40">
              <path
                d="M0,20 C20,0 40,40 60,20 C80,0 100,40 120,20"
                stroke="#6C5CE7"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 300,
              top: 60,
              fontSize: 32,
              color: '#FDCB6E',
              animation: 'spin 8s linear infinite',
            }}
          >
            ✦
          </div>

          <div
            style={{
              position: 'absolute',
              right: 40,
              top: 80,
              background: '#fff',
              borderRadius: 20,
              padding: '20px 24px',
              width: 220,
              boxShadow: '0 20px 60px rgba(108,92,231,0.15)',
              transform: 'rotate(2deg)',
              zIndex: 2,
            }}
          >
            <div style={{ fontSize: '13px', color: '#636e72', fontWeight: 600 }}>{c.taskPreview}</div>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                  <span style={{ width: 8, height: 8, background: '#4A90D9', borderRadius: '50%' }} />
                  {c.previewVocab}
                </span>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                  <span style={{ width: 8, height: 8, background: '#6C5CE7', borderRadius: '50%' }} />
                  {c.previewGrammar}
                </span>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px' }}>
                  <span style={{ width: 8, height: 8, background: '#FDCB6E', borderRadius: '50%' }} />
                  {c.previewWriting}
                </span>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#6C5CE7', borderRadius: 3 }} />
              </div>
              <div style={{ marginTop: 8, fontSize: '12px', color: '#636e72' }}>{c.previewDone}</div>
            </div>
            <div
              style={{
                position: 'absolute',
                right: -16,
                bottom: -16,
                background: '#FDCB6E',
                borderRadius: 16,
                padding: '10px 16px',
                boxShadow: '0 8px 24px rgba(253,203,110,0.4)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700 }}>
                🔥 {c.streakLabel ? `${c.streakLabel}7${c.streakUnit}` : `7 ${c.streakUnit}`}
              </span>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              right: 40,
              top: 390,
              width: 220,
              zIndex: 2,
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '16px 20px',
                boxShadow: '0 4px 16px rgba(108,92,231,0.1)',
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: '28px' }}>📚</div>
              <div>
                <div style={{ fontSize: '12px', color: '#636e72' }}>{c.todayVocab}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#6C5CE7' }}>{c.todayVocabCount}</div>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)',
                borderRadius: 16,
                padding: '16px 20px',
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  {c.streakTitle}
                </div>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{c.keepGoing}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#FDCB6E', lineHeight: 1 }}>🔥 7</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{c.daysUnit}</div>
              </div>
            </div>
          </div>

        </div>
        <div style={{ clear: 'both' }} />
      </section>

      <section
        style={{
          display: 'flex',
          gap: 20,
          marginTop: 32,
          padding: '0 48px',
        }}
      >
        <article
          style={{
            background: '#FDCB6E',
            borderRadius: 24,
            padding: '32px 28px',
            flex: 1,
            transform: 'rotate(-2deg)',
          }}
        >
          <div style={{ fontSize: '40px' }}>📚</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a1a', marginTop: 16 }}>{c.vocabCardCount}</div>
          <div style={{ fontSize: '14px', color: '#5a4a00' }}>{c.card1Sub}</div>
        </article>

        <article
          style={{
            background: '#6C5CE7',
            borderRadius: 24,
            padding: '32px 28px',
            flex: 1,
            transform: 'rotate(1deg)',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '40px' }}>🤖</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginTop: 16 }}>{c.card2Title}</div>
          <div style={{ fontSize: '14px', color: '#c4b5fd' }}>{c.card2Sub}</div>
        </article>

        <article
          style={{
            background: '#F3F0FF',
            borderRadius: 24,
            padding: '32px 28px',
            flex: 1,
            transform: 'rotate(-1deg)',
          }}
        >
          <div style={{ fontSize: '40px' }}>🎯</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#6C5CE7', marginTop: 16 }}>{c.card3Title}</div>
          <div style={{ fontSize: '14px', color: '#7c6fa0' }}>{c.card3Sub}</div>
        </article>
      </section>
    </div>
  )
}
