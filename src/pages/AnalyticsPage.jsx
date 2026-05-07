import { useEffect, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import vocabData from '../data/vocab_complete.json'
import { getWordReviews } from '../lib/db.js'

// 用 word_id 快速查词汇信息
const vocabMap = Object.fromEntries(vocabData.map(w => [String(w.id), w]))

function computeStats(rows) {
  const today = new Date().toISOString().split('T')[0]

  // 把 DB 行和词汇表合并
  const enriched = rows
    .map(r => ({ ...r, vocab: vocabMap[String(r.word_id)] }))
    .filter(r => r.vocab)

  // ── 总体数字 ──────────────────────────────────────────────
  const totalReviewed = rows.length
  const dueToday      = rows.filter(r => r.due <= today).length
  const matureWords   = rows.filter(r => (r.state ?? 0) >= 2).length
  const avgStability  = rows.length > 0
    ? (rows.reduce((s, r) => s + (r.stability ?? 0), 0) / rows.length).toFixed(1)
    : '0'

  // ── 各主题 ────────────────────────────────────────────────
  const topicAcc = {}
  for (const r of enriched) {
    const topic = r.vocab.topic || ''
    if (!topicAcc[topic]) topicAcc[topic] = { total: 0, mature: 0, stabilitySum: 0 }
    topicAcc[topic].total++
    topicAcc[topic].stabilitySum += r.stability ?? 0
    if ((r.state ?? 0) >= 2) topicAcc[topic].mature++
  }
  const byTopic = Object.entries(topicAcc)
    .map(([topic, d]) => ({
      topic,
      total:        d.total,
      mature:       d.mature,
      retentionPct: Math.round((d.mature / d.total) * 100),
      avgStability: (d.stabilitySum / d.total).toFixed(1),
    }))
    .sort((a, b) => b.retentionPct - a.retentionPct)

  // ── 未来7天复习预报 ───────────────────────────────────────
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    return {
      offset: i,
      dateStr,
      count:   rows.filter(r => r.due === dateStr).length,
      isToday: i === 0,
    }
  })

  // ── 记忆状态分布 ──────────────────────────────────────────
  const stateCount = { 0: 0, 1: 0, 2: 0, 3: 0 }
  for (const r of rows) stateCount[r.state ?? 0]++
  const unreviewed = vocabData.length - rows.length

  return { totalReviewed, dueToday, matureWords, avgStability, byTopic, forecast, stateCount, unreviewed }
}

export function AnalyticsPage({ messages, locale, setLocale, userId, onBack }) {
  const { home: h, analytics: a } = messages
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const format = (template, values) => {
    let output = String(template || '')
    for (const [k, v] of Object.entries(values || {})) {
      output = output.replaceAll(`{${k}}`, String(v))
    }
    return output
  }

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    getWordReviews(userId)
      .then(rows => setStats(computeStats(rows)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const langSwitch = (
    <LanguageSwitch locale={locale} setLocale={setLocale}
      zhLabel={h.languageSwitchZh} enLabel={h.languageSwitchEn} />
  )

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-sm text-slate-400">{a.loading}</p>
      </div>
    )
  }

  if (!userId || !stats) {
    return (
      <div className="flex min-h-dvh flex-col bg-[var(--bg-primary)] px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-3">
          <button type="button" onClick={onBack}
            className="text-sm font-medium text-[var(--accent)] hover:underline">{a.back}</button>
          {langSwitch}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-slate-400">{a.loginRequired}</p>
        </div>
      </div>
    )
  }

  const {
    totalReviewed, dueToday, matureWords, avgStability,
    byTopic, forecast, stateCount, unreviewed,
  } = stats

  const maxForecast   = Math.max(...forecast.map(f => f.count), 1)
  const totalForPct   = unreviewed + stateCount[1] + stateCount[2] + stateCount[3]

  const stateSegments = [
    { label: a.stateUnreviewed, color: 'bg-slate-200', count: unreviewed, dot: 'bg-slate-400' },
    { label: a.stateLearning, color: 'bg-amber-400', count: stateCount[1], dot: 'bg-amber-400' },
    { label: a.stateMature, color: 'bg-emerald-400', count: stateCount[2], dot: 'bg-emerald-400' },
    { label: a.stateRelearning, color: 'bg-rose-400', count: stateCount[3], dot: 'bg-rose-400' },
  ]

  const heroCards = [
    {
      label: a.cardReviewed,
      value: totalReviewed,
      sub: format(a.cardReviewedSub, { n: vocabData.length }),
      gradient: 'from-[#6C5CE7] to-[#8B5CF6]',
    },
    { label: a.cardDueToday, value: dueToday, sub: a.cardDueTodaySub, gradient: 'from-amber-400 to-orange-400' },
    { label: a.cardMature, value: matureWords, sub: a.cardMatureSub, gradient: 'from-emerald-400 to-teal-400' },
    {
      label: a.cardStability,
      value: format(a.cardStabilityValue, { n: avgStability }),
      sub: a.cardStabilitySub,
      gradient: 'from-sky-400 to-blue-500',
    },
  ]

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)] px-4 py-10 pb-24 text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-lg space-y-5">

        {/* 顶部导航 */}
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onBack}
            className="pt-0.5 text-sm font-medium text-[var(--accent)] transition hover:underline">
            {a.back}
          </button>
          {langSwitch}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{a.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{a.subtitle}</p>
        </div>

        {/* ── 四格概览 ── */}
        <div className="grid grid-cols-2 gap-3">
          {heroCards.map(card => (
            <div key={card.label}
              className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-4 shadow-sm`}>
              <p className="text-xs font-medium text-white/80">{card.label}</p>
              <p className="mt-1 text-3xl font-bold text-white">{card.value}</p>
              <p className="mt-1 text-xs text-white/60">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── 记忆状态分布 ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {a.stateTitle}
          </h2>
          {/* 彩色进度条 */}
          <div className="flex h-3 overflow-hidden rounded-full">
            {stateSegments.map(s => (
              <div key={s.label} className={`${s.color} transition-all duration-700`}
                style={{ width: `${totalForPct > 0 ? (s.count / totalForPct) * 100 : 0}%` }} />
            ))}
          </div>
          {/* 图例 */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {stateSegments.map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span className="text-xs text-slate-600">
                  {s.label} <span className="font-semibold">{s.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7日复习预报 ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {a.forecastTitle}
          </h2>
          <div className="flex h-28 items-end gap-1.5">
            {forecast.map(f => (
              <div key={f.dateStr} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate-600">
                  {f.count > 0 ? f.count : ''}
                </span>
                <div className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height:           `${Math.max((f.count / maxForecast) * 72, f.count > 0 ? 6 : 0)}px`,
                    backgroundColor:  f.isToday ? '#6C5CE7' : '#c4b5fd',
                  }}
                />
                <span className={`text-xs ${f.isToday ? 'font-semibold text-[#6C5CE7]' : 'text-slate-400'}`}>
                  {f.offset === 0 ? a.today : f.offset === 1 ? a.tomorrow : format(a.daysLater, { n: f.offset })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 各主题掌握情况 ── */}
        {byTopic.length > 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {a.byTopicTitle}
            </h2>
            <div className="space-y-3.5">
              {byTopic.map(t => (
                <div key={t.topic}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{t.topic || a.topicOther}</span>
                    <span className="text-slate-400">
                      {format(a.byTopicRow, { mature: t.mature, total: t.total, days: t.avgStability })}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-[#ece8ff]">
                    <div className="h-full rounded-full bg-[#6C5CE7] transition-all duration-700"
                      style={{ width: `${t.retentionPct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-400">
              {a.byTopicEmpty}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}