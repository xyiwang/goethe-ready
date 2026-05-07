import { useEffect, useState } from 'react'
import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import vocabData from '../data/vocab_complete.json'
import { getWordReviews, upsertWordReview } from '../lib/db.js'

// ─── FSRS 初始化 ────────────────────────────────────────────────────────────
const scheduler = fsrs(generatorParameters({ enable_fuzz: true }))
const INITIAL_SESSION_STATS = { again: 0, hard: 0, good: 0, easy: 0, total: 0 }

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

/**
 * 建立今日复习队列：
 * 1. 到期词（due <= 今天）优先
 * 2. 新词填满至 limit 个
 */
function buildQueue(words, reviewMap, limit = 20) {
  const today = getTodayStr()
  const due = []
  const fresh = []
  const rankMap = { 高: 3, 中: 2, 低: 1 }
  for (const word of words) {
    const row = reviewMap[String(word.id)]
    if (row) {
      if (row.due <= today) due.push(word)
    } else {
      fresh.push(word)
    }
  }
  fresh.sort((a, b) => {
    const aRank = rankMap[String(a.frequency || '').trim()] ?? 0
    const bRank = rankMap[String(b.frequency || '').trim()] ?? 0
    return bRank - aRank
  })
  return [...due, ...fresh.slice(0, Math.max(0, limit - due.length))]
}

// ─── 样式辅助函数（与原版完全相同）────────────────────────────────────────
function typeBadgeClass(type) {
  const t = String(type).toLowerCase()
  if (t === 'der') return 'bg-sky-100 text-sky-800 ring-1 ring-sky-300/80'
  if (t === 'die') return 'bg-rose-100 text-rose-800 ring-1 ring-rose-300/80'
  if (t === 'das') return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80'
  if (t === 'verb') return 'bg-amber-100 text-amber-900 ring-1 ring-amber-300/80'
  if (t === 'adjektiv' || t === 'adverb') return 'bg-violet-100 text-violet-800 ring-1 ring-violet-300/80'
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-300/80'
}

function typeDisplayLabel(type, labels) {
  const t = String(type).toLowerCase()
  if (t === 'verb') return labels.typeVerb
  if (t === 'adjektiv') return labels.typeAdjektiv ?? 'adjektiv'
  if (t === 'adverb') return labels.typeAdverb ?? 'adverb'
  return String(type)
}

function frequencyDisplay(frequency, locale, labels) {
  const raw = String(frequency || '').trim()
  if (locale === 'zh') return raw
  if (raw === '高') return labels.freqHigh ?? 'high'
  if (raw === '中') return labels.freqMedium ?? 'medium'
  if (raw === '低') return labels.freqLow ?? 'low'
  return raw.toLowerCase()
}

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const content = String(text || '').trim()
  if (!content) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(content)
  utterance.lang = 'de-DE'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}

// ─── 四个评分按钮的配置 ──────────────────────────────────────────────────────
const RATING_BUTTONS = [
  {
    rating: Rating.Again,
    labelZh: '完全忘了', labelEn: 'Again',
    className: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  },
  {
    rating: Rating.Hard,
    labelZh: '有点模糊', labelEn: 'Hard',
    className: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
  {
    rating: Rating.Good,
    labelZh: '基本记得', labelEn: 'Good',
    className: 'border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
  },
  {
    rating: Rating.Easy,
    labelZh: '非常熟悉', labelEn: 'Easy',
    className: 'bg-[#FDCB6E] text-black hover:brightness-105',
  },
]

// ─── 主组件 ──────────────────────────────────────────────────────────────────
export function VocabPage({
  messages,
  locale,
  setLocale,
  userId = null,
  todayVocabCount = 20,
  onBack,
}) {
  const { vocab: v, home: h } = messages
  const labels = v.labels
  const words = /** @type {any[]} */ (vocabData)

  const [reviewMap, setReviewMap]     = useState({})   // word_id → DB行
  const [queue, setQueue]             = useState([])    // 今日词单
  const [queueIndex, setQueueIndex]   = useState(0)
  const [flipped, setFlipped]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [sessionStats, setSessionStats] = useState(INITIAL_SESSION_STATS)

  // ── 加载复习数据，建立今日队列 ─────────────────────────────────────────────
  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      setLoading(true)
      let map = {}
      if (userId) {
        try {
          const rows = await getWordReviews(userId)
          for (const row of rows) map[String(row.word_id)] = row
        } catch {
          // 加载失败就用空 map，降级为全新词模式
        }
      }
      if (!active) return
      setReviewMap(map)
      setQueue(buildQueue(words, map, todayVocabCount))
      setQueueIndex(0)
      setSessionStats(INITIAL_SESSION_STATS)
      setLoading(false)
    }
    void bootstrap()
    return () => { active = false }
  }, [userId, todayVocabCount])

  // ── 当前词 ────────────────────────────────────────────────────────────────
  const current    = queue[queueIndex] ?? null
  const remaining  = Math.max(0, queue.length - queueIndex)
  const progressPct = queue.length > 0 ? Math.round((queueIndex / queue.length) * 100) : 0

  // ── 评分处理 ──────────────────────────────────────────────────────────────
  const handleRate = async (rating) => {
    if (!current) return
    const id = String(current.id)
    const row = reviewMap[id]

    // 从 DB 行重建 ts-fsrs 卡片，或创建新卡片
    const card = row
      ? {
          due:            new Date(row.due),
          stability:      row.stability ?? 1,
          difficulty:     row.difficulty ?? 5,
          elapsed_days:   0,
          scheduled_days: 0,
          reps:           row.reps ?? 0,
          lapses:         row.lapses ?? 0,
          state:          row.state ?? 0,
          last_review:    row.reviewed_at ? new Date(row.reviewed_at) : undefined,
        }
      : createEmptyCard()

    const now = new Date()
    const updatedCard = scheduler.repeat(card, now)[rating].card

    const fields = {
      stability:   updatedCard.stability,
      difficulty:  updatedCard.difficulty,
      state:       updatedCard.state,
      reps:        updatedCard.reps,
      lapses:      updatedCard.lapses,
      due:         updatedCard.due.toISOString().split('T')[0],  // 'YYYY-MM-DD'
      rating,
      reviewed_at: now.toISOString(),
    }

    // 乐观更新本地状态（不等网络）
    setReviewMap(prev => ({ ...prev, [id]: { ...fields, word_id: id, user_id: userId } }))

    // 异步写入 Supabase
    if (userId) upsertWordReview(userId, id, fields).catch(() => {})

    setSessionStats((prev) => {
      const next = { ...prev, total: prev.total + 1 }
      if (rating === Rating.Again) next.again += 1
      if (rating === Rating.Hard) next.hard += 1
      if (rating === Rating.Good) next.good += 1
      if (rating === Rating.Easy) next.easy += 1
      return next
    })

    if (updatedCard.state === 1 || updatedCard.state === 3) {
      setQueue(prev => [...prev, current])
    }
    setQueueIndex(i => i + 1)
    setFlipped(false)
  }

  const langSwitch = (
    <LanguageSwitch
      locale={locale} setLocale={setLocale}
      zhLabel={h.languageSwitchZh} enLabel={h.languageSwitchEn}
    />
  )

  // ── 加载中 ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-sm text-slate-400">
          {locale === 'zh' ? '加载中…' : 'Loading…'}
        </p>
      </div>
    )
  }

  // ── 今日全部完成 ──────────────────────────────────────────────────────────
  if (!current) {
    return (
      <div className="flex min-h-dvh flex-col bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="mb-8 flex items-start justify-between gap-3">
            <button type="button" onClick={onBack}
              className="pt-0.5 text-left text-sm font-medium text-[var(--accent)] transition hover:underline">
              {v.back}
            </button>
            {langSwitch}
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-[var(--text-primary)]">{v.allDone}</p>
            <div className="mt-3 space-y-2 text-center">
              <p className="text-sm text-slate-600">
                {locale === 'zh'
                  ? `总共复习了 ${sessionStats.total} 个词`
                  : `Reviewed ${sessionStats.total} words in total`}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  {locale === 'zh' ? `完全忘了 ${sessionStats.again}个` : `Again ${sessionStats.again}`}
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {locale === 'zh' ? `有点模糊 ${sessionStats.hard}个` : `Hard ${sessionStats.hard}`}
                </span>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  {locale === 'zh' ? `基本记得 ${sessionStats.good}个` : `Good ${sessionStats.good}`}
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {locale === 'zh' ? `非常熟悉 ${sessionStats.easy}个` : `Easy ${sessionStats.easy}`}
                </span>
              </div>
            </div>
            <button type="button" onClick={onBack}
              className="fun-primary-btn mt-8 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]">
              {v.backToDashboard}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const meaningLabel = locale === 'zh' ? labels.meaningZh : labels.meaningEn
  const meaningBody  = locale === 'zh' ? current.meaning_zh : current.meaning_en
  const exampleTrans = locale === 'zh' ? current.example_zh : current.example_en
  const isReviewWord = Boolean(reviewMap[String(current.id)])

  // ── 主界面（卡片翻转布局与原版完全相同）──────────────────────────────────
  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] px-6 py-10 pb-40 text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-md">

        <div className="mb-6 flex items-start justify-between gap-3">
          <button type="button" onClick={onBack}
            className="pt-0.5 text-left text-sm font-medium text-[var(--accent)] transition hover:underline">
            {v.back}
          </button>
          {langSwitch}
        </div>

        <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
          {v.progressHint.replace('{n}', String(remaining))}
        </p>
        <h1 className="mb-6 text-center text-xl font-semibold text-[var(--text-primary)]">{v.title}</h1>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#ece8ff]">
          <div className="h-full rounded-full bg-[#6C5CE7]" style={{ width: `${progressPct}%` }} />
        </div>

        {/* 卡片翻转区域 */}
        <div
          className="relative w-full cursor-pointer [perspective:1200px]"
          onClick={() => setFlipped(f => !f)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(f => !f) }}}
          role="button" tabIndex={0} aria-label={v.flipHint}
        >
          <div className={`relative min-h-[22rem] w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>

            {/* 正面：德语词 */}
            <div className="absolute inset-0 flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-transparent bg-gradient-to-br from-[#6C5CE7] to-[#8B5CF6] p-8 shadow-sm [backface-visibility:hidden]" aria-hidden={flipped}>
              <div className="mb-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    isReviewWord
                      ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-300/80'
                      : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/80'
                  }`}
                >
                  {isReviewWord ? (locale === 'zh' ? '待复习' : 'Review Due') : (locale === 'zh' ? '新词' : 'New')}
                </span>
              </div>
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeBadgeClass(current.type)}`}>
                  {typeDisplayLabel(current.type, labels)}
                </span>
                {current.frequency && (
                  <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/40">
                    {(labels.frequency ?? 'frequency')}: {frequencyDisplay(current.frequency, locale, labels)}
                  </span>
                )}
              </div>
              <p className="text-center text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                {current.word}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  speak(current.word)
                }}
                className="mt-4 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/45 transition hover:bg-white/30"
              >
                {locale === 'zh' ? '朗读' : 'Speak'}
              </button>
              <p className="mt-8 text-center text-xs text-white/80">{v.flipHint}</p>
            </div>

            {/* 背面：释义 */}
            <div className="absolute inset-0 flex min-h-[22rem] flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!flipped}>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{meaningLabel}</p>
                  <p className="mt-1 text-base font-medium text-slate-900">{meaningBody}</p>
                </section>
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{labels.collocation}</p>
                  <p className="mt-1 font-medium text-[#6C5CE7]">{current.collocation}</p>
                </section>
                <section>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{labels.exampleDe}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        speak(current.example_de)
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-600 transition hover:bg-slate-50"
                      aria-label={locale === 'zh' ? '朗读德语例句' : 'Speak German example'}
                    >
                      🔊
                    </button>
                  </div>
                  <p className="mt-2 rounded-lg bg-[#f7fbff] px-3 py-2 text-slate-900 ring-1 ring-slate-200/80">{current.example_de}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{labels.translation}</p>
                  <p className="mt-1 text-slate-700">{exampleTrans}</p>
                </section>
              </div>
              <p className="mt-3 shrink-0 text-center text-xs text-slate-400">{v.flipHint}</p>
            </div>
          </div>
        </div>

        {/* 评分按钮：翻到背面才完全可点击 */}
        <div className={`mt-8 transition-opacity duration-300 ${flipped ? 'opacity-100' : 'pointer-events-none opacity-30'}`}>
          <p className="mb-3 text-center text-xs text-slate-400">
            {locale === 'zh' ? '评价你的记忆程度' : 'Rate your recall'}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {RATING_BUTTONS.map(({ rating, labelZh, labelEn, className }) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRate(rating)}
                className={`rounded-xl py-3 text-xs font-semibold shadow-sm transition ${className}`}
              >
                {locale === 'zh' ? labelZh : labelEn}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}