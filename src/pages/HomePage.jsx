import { useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'

const LEVEL_IDS = ['beginner', 'a1a2', 'b1']

/**
 * @param {{
 *   messages: { home: Record<string, string | Record<string, string>> }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   onNavigateToDashboard: (payload: { days: string; levelId: string; levelLabel: string }) => void
 * }} props
 */
export function HomePage({ messages, locale, setLocale, onNavigateToDashboard }) {
  const { home: h } = messages
  const [days, setDays] = useState('')
  const [levelId, setLevelId] = useState(null)

  const daysTrim = days.trim()
  const daysNum = parseInt(daysTrim, 10)
  const daysValid = daysTrim !== '' && !Number.isNaN(daysNum) && daysNum >= 0
  const canSubmit = daysValid && levelId != null

  const getLevelLabel = (id) => h.levels[id] ?? ''

  const handleStart = () => {
    if (!canSubmit || !levelId) return
    onNavigateToDashboard({
      days: daysTrim,
      levelId,
      levelLabel: getLevelLabel(levelId),
    })
  }

  return (
    <div className="relative min-h-dvh bg-white px-6 text-slate-900">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-5">
        <LanguageSwitch
          locale={locale}
          setLocale={setLocale}
          zhLabel={h.languageSwitchZh}
          enLabel={h.languageSwitchEn}
        />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col pb-14 pt-16 sm:py-20">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {h.title}
          </h1>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">{h.subtitle}</p>
        </header>

        <label className="sr-only" htmlFor="exam-days">
          {h.daysLabel}
        </label>
        <input
          id="exam-days"
          type="text"
          inputMode="numeric"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder={h.daysPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />

        <p className="mb-3 mt-8 text-left text-sm font-medium text-slate-600">
          {h.levelSectionTitle}
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-2">
          {LEVEL_IDS.map((id) => {
            const label = getLevelLabel(id)
            const selected = levelId === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLevelId(id)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition sm:flex-1 sm:min-w-[calc(33.333%-0.5rem)] ${
                  selected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
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
          className="mt-12 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
        >
          {h.startButton}
        </button>
      </div>
    </div>
  )
}
