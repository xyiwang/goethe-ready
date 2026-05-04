import { LanguageSwitch } from '../components/LanguageSwitch.jsx'

/**
 * @param {{
 *   messages: { home: Record<string, string | Record<string, string>> }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   userId?: string | null
 *   authEnabled?: boolean
 *   onOpenSignIn?: () => void
 *   onOpenSignUp?: () => void
 *   onOpenGuestSetup?: () => void
 * }} props
 */
export function HomePage({
  messages,
  locale,
  setLocale,
  userId = null,
  authEnabled = false,
  onOpenSignIn,
  onOpenSignUp,
  onOpenGuestSetup,
}) {
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
      startBtn: '免费开始备考 →',
      loginBtn: '已有账号？去登录',
      guestTry: '先体验一下，不注册',
      userCount: '已有 2,847 人在备考',
      samplePreviewTag: '示例预览',
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
      signIn: '登录',
      signUp: '注册',
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
      startBtn: 'Start for Free →',
      loginBtn: 'Already have an account? Sign in',
      guestTry: 'Try first, no signup',
      userCount: '2,847 learners already studying',
      samplePreviewTag: 'Sample Preview',
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
      signIn: 'Sign in',
      signUp: 'Sign up',
      previewVocab: 'Vocab: 32 new words',
      previewGrammar: 'Grammar: Konjunktiv II',
      previewWriting: 'Writing: Email practice',
      previewDone: 'Done today 3/4',
    },
  }
  const c = language === 'zh' ? content.zh : content.en
  return (
    <div
      className="home-page-root"
      style={{ background: '#FFFFFF', padding: 0, paddingBottom: 60, overflow: 'hidden', minHeight: '100vh' }}
    >
      <style>{`
        .home-page-root {
          --page-pad-x: 48px;
          --section-pad-y: 60px;
        }
        .home-page-root .hero-line-two {
          position: relative;
          display: inline-block;
        }
        .home-page-root .hero-title-main,
        .home-page-root .hero-title-secondary {
          font-size: 72px;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
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
        .home-page-root .hero-layout {
          display: flex;
          flex-direction: row;
          gap: 24px;
          align-items: flex-start;
        }
        .home-page-root .home-hero-section {
          min-height: auto;
        }
        .home-page-root .hero-left {
          flex: 1 1 55%;
          position: relative;
          z-index: 3;
        }
        .home-page-root .hero-right {
          flex: 1 1 45%;
          position: relative;
          min-height: auto;
          z-index: 1;
        }
        .home-page-root .home-form-features {
          display: flex;
          flex-direction: row;
          gap: 24px;
          max-width: 980px;
        }
        .home-page-root .home-form-card {
          width: 55%;
        }
        .home-page-root .home-feature-card {
          width: 45%;
        }
        .home-page-root .home-user-count {
          width: 55%;
        }
        .home-page-root .home-bottom-cards {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .home-page-root {
            --page-pad-x: 20px;
            --section-pad-y: 24px;
          }
          .home-page-root .hero-layout {
            flex-direction: column;
          }
          .home-page-root .home-form-features {
            flex-direction: column;
          }
          .home-page-root .home-form-card,
          .home-page-root .home-feature-card {
            width: 100%;
          }
          .home-page-root .home-user-count {
            width: 100%;
          }
          .home-page-root .decorCircle {
            display: none;
          }
          .home-page-root .previewCards {
            display: none;
          }
          .home-page-root .hero-title-main,
          .home-page-root .hero-title-secondary {
            font-size: 52px;
          }
          .home-page-root .home-bottom-cards {
            grid-template-columns: 1fr;
          }
          .home-page-root .hero-right {
            min-height: 0;
          }
          .home-page-root .home-hero-section {
            min-height: auto;
          }
        }
        @media (max-width: 600px) {
          .home-page-root .hero-title-main,
          .home-page-root .hero-title-secondary {
            font-size: 40px;
          }
        }
      `}</style>

      <div
        className="home-nav"
        style={{
          height: '64px',
          padding: '0 var(--page-pad-x)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: '#6C5CE7' }}>GoetheReady</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {authEnabled && !userId && (
            <>
              <button
                type="button"
                onClick={onOpenSignIn}
                style={{
                  border: '1px solid #DDD6FE',
                  background: '#fff',
                  color: '#6C5CE7',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 10px',
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
              >
                {c.signIn ?? '登录'}
              </button>
              <button
                type="button"
                onClick={onOpenSignUp}
                style={{
                  border: 'none',
                  background: '#6C5CE7',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 10px',
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
              >
                {c.signUp ?? '注册'}
              </button>
            </>
          )}
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
        className="home-hero-section"
        style={{
          position: 'relative',
          padding: 'var(--section-pad-y) var(--page-pad-x) 40px',
        }}
      >
        <div className="hero-layout">
        <div className="hero-left">
          <div
            className="hero-title-main"
            style={{
              color: '#1a1a1a',
            }}
          >
            {c.heroTitle1}
          </div>
          <div
            className="hero-title-secondary"
            style={{
              marginTop: 4,
              color: '#6C5CE7',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span className="hero-line-two">{c.heroTitle2}</span>
            <span style={{ fontSize: '56px' }}>🇩🇪</span>
          </div>
          <div style={{ fontSize: '16px', color: '#636e72', marginTop: 24 }}>{c.tagline}</div>

          <div style={{ marginTop: 48, maxWidth: 560 }}>
            <button
              type="button"
              onClick={() => {
                if (onOpenSignUp) onOpenSignUp()
                else onOpenGuestSetup?.()
              }}
              className="cta-btn"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #8B5CF6 100%)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                padding: '16px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {c.startBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenSignIn) onOpenSignIn()
                else onOpenGuestSetup?.()
              }}
              style={{
                width: '100%',
                marginTop: 12,
                background: '#fff',
                color: '#6C5CE7',
                fontSize: 15,
                fontWeight: 600,
                padding: '14px',
                borderRadius: 14,
                border: '2px solid #DDD6FE',
                cursor: 'pointer',
              }}
            >
              {c.loginBtn}
            </button>
            <button
              type="button"
              onClick={onOpenGuestSetup}
              style={{
                marginTop: 12,
                background: 'transparent',
                border: 'none',
                color: '#6B7280',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {c.guestTry}
            </button>
          </div>
        </div>

        <div
          className="hero-right"
          style={{
            height: '100%',
          }}
          aria-hidden
        >
          <div
            className="decorCircle"
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
            className="decorCircle"
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
            className="decorCircle"
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
          <div className="decorCircle" style={{ position: 'absolute', right: 180, top: 250 }}>
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
            className="decorCircle"
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
            className="previewCards"
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
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: -10,
                fontSize: '11px',
                color: '#6B7280',
                background: '#E5E7EB',
                borderRadius: 999,
                padding: '4px 8px',
                fontWeight: 600,
              }}
            >
              {c.samplePreviewTag}
            </span>
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

        </div>
        </div>
      </section>

      <section
        className="home-bottom-cards"
        style={{
          marginTop: 48,
          padding: '0 var(--page-pad-x)',
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
