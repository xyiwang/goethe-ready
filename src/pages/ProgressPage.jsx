import { useMemo } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'

/** @typedef {'full' | 'partial' | 'none'} DayStatus */

function pad2(n) {
  return String(n).padStart(2, '0')
}

function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function stripNoon(d) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return x
}

function isSameDay(a, b) {
  return ymd(a) === ymd(b)
}

/** 周一为一周起始 */
function startOfWeekMonday(d) {
  const x = stripNoon(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

function getMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1, 12, 0, 0, 0)
  const gridStart = startOfWeekMonday(first)
  const cells = []
  const cur = new Date(gridStart)
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return cells
}

/**
 * 最近 15 天：2 天未打卡、3 天部分完成、10 天全部完成（由旧到新）
 * @returns {Map<string, DayStatus>}
 */
function buildMockStatusMap(today = new Date()) {
  const t = stripNoon(today)
  const order = [
    'none',
    'none',
    'partial',
    'partial',
    'partial',
    'full',
    'full',
    'full',
    'full',
    'full',
    'full',
    'full',
    'full',
    'full',
    'full',
  ]
  const map = new Map()
  for (let i = 0; i < 15; i++) {
    const d = new Date(t)
    d.setDate(t.getDate() - (14 - i))
    map.set(ymd(d), /** @type {DayStatus} */ (order[i]))
  }
  return map
}

function streakFromMap(statusMap, today = new Date()) {
  const t = stripNoon(today)
  let n = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(t)
    d.setDate(t.getDate() - i)
    const s = statusMap.get(ymd(d))
    if (s === 'full') n += 1
    else break
  }
  return n
}

/**
 * @param {{
 *   messages: { progress: Record<string, unknown>; home: { languageSwitchZh: string; languageSwitchEn: string }; dashboard: { daysLeft: string; daysUnit: string } }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   days: string
 *   onBack: () => void
 * }} props
 */
export function ProgressPage({ messages, locale, setLocale, days, onBack }) {
  const { progress: p, home: h, dashboard: d } = messages
  const weekdays = /** @type {string[]} */ (p.weekdaysShort)

  const today = useMemo(() => stripNoon(new Date()), [])
  const statusMap = useMemo(() => buildMockStatusMap(today), [today])

  const daysNum = parseInt(String(days).trim(), 10)
  const daysUntilExam = Number.isNaN(daysNum) ? days : daysNum
  const totalProgramDays = Number.isFinite(daysNum) && !Number.isNaN(daysNum) && daysNum > 0 ? daysNum : 90

  /** 假数据：整体备考进度 */
  const completedProgramDays = 35
  const progressPct = Math.min(100, Math.round((completedProgramDays / totalProgramDays) * 100))

  const streak = useMemo(() => streakFromMap(statusMap, today), [statusMap, today])
  const cumulativeDoneDays = 48
  const cumulativeWords = 532

  const year = today.getFullYear()
  const month = today.getMonth()
  const grid = useMemo(() => getMonthGrid(year, month), [year, month])
  const monthTitle = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
  }).format(today)

  const langSwitch = (
    <LanguageSwitch
      locale={locale}
      setLocale={setLocale}
      zhLabel={h.languageSwitchZh}
      enLabel={h.languageSwitchEn}
    />
  )

  const cellClass = (cell) => {
    const inMonth = cell.getMonth() === month
    const key = ymd(cell)
    const isFuture = stripNoon(cell) > today
    const isToday = isSameDay(cell, today)

    let base =
      'flex aspect-square max-h-11 items-center justify-center rounded-lg text-xs font-medium tabular-nums sm:max-h-12 sm:text-sm'

    if (!inMonth) {
      if (isFuture) {
        base += ' border border-slate-100 bg-white text-slate-200'
      } else {
        base += ' text-slate-300'
      }
    } else if (isFuture) {
      base += ' border border-slate-100 bg-white text-slate-300'
    } else {
      const s = statusMap.get(key)
      if (s === 'full') base += ' bg-emerald-600 text-white'
      else if (s === 'partial') base += ' bg-emerald-200 text-emerald-900'
      else base += ' bg-slate-300 text-slate-600'
    }

    if (isToday) {
      base += ' ring-2 ring-emerald-600 ring-offset-2 ring-offset-white'
    }

    return base
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-10 pb-16 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pt-0.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            {p.back}
          </button>
          {langSwitch}
        </div>

        {/* 倒计时 + 进度条 */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-6">
          <p className="text-center text-sm font-medium text-slate-500">{d.daysLeft}</p>
          <p className="mt-2 text-center text-5xl font-bold tabular-nums tracking-tight text-emerald-600 sm:text-6xl">
            {daysUntilExam}
          </p>
          <p className="mt-1 text-center text-lg font-medium text-slate-600">{d.daysUnit}</p>

          <div className="mt-8">
            <div className="mb-2 flex items-end justify-between text-sm">
              <span className="font-medium text-slate-600">{p.overallProgress}</span>
              <span className="tabular-nums font-semibold text-emerald-700">{progressPct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-slate-500">
              {p.progressCount
                .replace('{done}', String(completedProgramDays))
                .replace('{total}', String(totalProgramDays))}
            </p>
          </div>
        </section>

        {/* 热力图 */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">{p.heatmapTitle}</h2>
            <span className="text-sm font-medium text-slate-500">{monthTitle}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
              {weekdays.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell, idx) => (
                <div key={idx} className={cellClass(cell)}>
                  {cell.getDate()}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500 sm:text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-emerald-600" />
                {p.legendFull}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-emerald-200" />
                {p.legendPartial}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-slate-300" />
                {p.legendNone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded border border-slate-200 bg-white" />
                {p.legendFuture}
              </span>
            </div>
          </div>
        </section>

        {/* 统计卡片 */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-center">
            <p className="text-2xl" aria-hidden>
              🔥
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{streak}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{p.statStreak}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-center">
            <p className="text-2xl" aria-hidden>
              ✅
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{cumulativeDoneDays}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{p.statCumulative}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-center">
            <p className="text-2xl" aria-hidden>
              📚
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{cumulativeWords}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{p.statWords}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
