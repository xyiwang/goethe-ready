import { useEffect, useMemo, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import vocabData from '../data/vocab_complete.json'
import { getVocabProgress, saveVocabProgress } from '../lib/db.js'

const VOCAB_PROGRESS_KEY = 'vocab_progress'
const VOCAB_MASTERED_KEY = 'vocab_mastered'

function readJsonSafely(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJsonSafely(key, value) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures
  }
}

function readIntSafely(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    const parsed = parseInt(raw || '', 10)
    return Number.isNaN(parsed) ? fallback : parsed
  } catch {
    return fallback
  }
}

function writeIntSafely(key, value) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // ignore storage failures
  }
}

function nextUnmasteredIndex(words, masteredSet, startIndex) {
  if (!Array.isArray(words) || words.length === 0) return -1
  for (let i = 0; i < words.length; i++) {
    const idx = (startIndex + i + words.length) % words.length
    const id = String(words[idx].id)
    if (!masteredSet.has(id)) return idx
  }
  return -1
}

function typeBadgeClass(type) {
  const t = String(type).toLowerCase()
  if (t === 'der') return 'bg-sky-100 text-sky-800 ring-1 ring-sky-300/80'
  if (t === 'die') return 'bg-rose-100 text-rose-800 ring-1 ring-rose-300/80'
  if (t === 'das') return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80'
  if (t === 'verb') return 'bg-amber-100 text-amber-900 ring-1 ring-amber-300/80'
  if (t === 'adjektiv' || t === 'adverb') {
    return 'bg-violet-100 text-violet-800 ring-1 ring-violet-300/80'
  }
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

/**
 * @param {{
 *   messages: { vocab: Record<string, unknown>; home: { languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   userId?: string | null
 *   todayVocabCount?: number
 *   onBack: () => void
 * }} props
 */
export function VocabPage({
  messages,
  locale,
  setLocale,
  userId = null,
  todayVocabCount = 20,
  onBack,
}) {
  void todayVocabCount
  const { vocab: v, home: h } = messages
  const labels = v.labels
  const words = /** @type {any[]} */ (vocabData)

  const [progressIndex, setProgressIndex] = useState(0)
  const [masteredIds, setMasteredIds] = useState(/** @type {string[]} */ ([]))
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      const storedMastered = readJsonSafely(VOCAB_MASTERED_KEY, [])
      const fallbackMastered = Array.isArray(storedMastered)
        ? storedMastered.map((x) => String(x))
        : []
      const fallbackIndex = readIntSafely(VOCAB_PROGRESS_KEY, 0)

      let mastered = fallbackMastered
      let rawIndex = fallbackIndex
      if (userId) {
        try {
          const cloud = await getVocabProgress(userId)
          if (cloud) {
            mastered = Array.isArray(cloud.mastered_ids)
              ? cloud.mastered_ids.map((x) => String(x))
              : fallbackMastered
            rawIndex = Number.isFinite(Number(cloud.vocab_index))
              ? Number(cloud.vocab_index)
              : fallbackIndex
          }
        } catch {
          // fallback to local
        }
      }

      if (!active) return
      const masteredSet = new Set(mastered)
      const normalizedStart = words.length > 0 ? ((rawIndex % words.length) + words.length) % words.length : 0
      const nextIdx = nextUnmasteredIndex(words, masteredSet, normalizedStart)
      setMasteredIds(mastered)
      setProgressIndex(nextIdx)
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [userId, words])

  useEffect(() => {
    writeJsonSafely(VOCAB_MASTERED_KEY, masteredIds)
  }, [masteredIds])

  useEffect(() => {
    writeIntSafely(VOCAB_PROGRESS_KEY, progressIndex < 0 ? 0 : progressIndex)
  }, [progressIndex])

  const masteredSet = useMemo(() => new Set(masteredIds.map((id) => String(id))), [masteredIds])
  const unmasteredCount = Math.max(0, words.length - masteredSet.size)
  const current = progressIndex >= 0 ? words[progressIndex] : null

  const langSwitch = (
    <LanguageSwitch
      locale={locale}
      setLocale={setLocale}
      zhLabel={h.languageSwitchZh}
      enLabel={h.languageSwitchEn}
    />
  )

  const moveNext = (startFrom, extraMasteredSet = masteredSet) => {
    const next = nextUnmasteredIndex(words, extraMasteredSet, startFrom)
    setProgressIndex(next)
    return next
  }

  const handleNotFamiliar = () => {
    if (progressIndex < 0) return
    moveNext(progressIndex + 1)
    setFlipped(false)
  }

  const handleMastered = () => {
    if (!current) return
    const id = String(current.id)
    const nextMasteredSet = new Set(masteredSet)
    nextMasteredSet.add(id)
    const nextMasteredIds = Array.from(nextMasteredSet)
    setMasteredIds(nextMasteredIds)
    const nextIndex = moveNext(progressIndex + 1, nextMasteredSet)
    if (userId) {
      void saveVocabProgress(userId, nextIndex < 0 ? 0 : nextIndex, nextMasteredIds).catch(() => {
        // keep local state even if cloud write fails
      })
    }
    setFlipped(false)
  }

  if (!current) {
    return (
      <div className="flex min-h-dvh flex-col bg-white px-6 py-10 text-slate-900">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="mb-8 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="pt-0.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
            >
              {v.back}
            </button>
            {langSwitch}
          </div>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-slate-800">{v.allDone}</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-8 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {v.backToDashboard}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const meaningLabel = locale === 'zh' ? labels.meaningZh : labels.meaningEn
  const meaningBody = locale === 'zh' ? current.meaning_zh : current.meaning_en
  const exampleTranslation = locale === 'zh' ? current.example_zh : current.example_en

  return (
    <div className="min-h-dvh bg-white px-6 py-10 pb-40 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pt-0.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            {v.back}
          </button>
          {langSwitch}
        </div>

        <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
          {v.progressHint.replace('{n}', String(unmasteredCount))}
        </p>
        <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">{v.title}</h1>

        <div
          className="relative w-full cursor-pointer [perspective:1200px]"
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setFlipped((f) => !f)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={v.flipHint}
        >
          <div
            className={`relative min-h-[22rem] w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none ${
              flipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            <div
              className="absolute inset-0 flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm [backface-visibility:hidden]"
              aria-hidden={flipped}
            >
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeBadgeClass(current.type)}`}
                >
                  {typeDisplayLabel(current.type, labels)}
                </span>
                {current.frequency && (
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 ring-1 ring-slate-300/80">
                    {(labels.frequency ?? 'frequency')}: {frequencyDisplay(current.frequency, locale, labels)}
                  </span>
                )}
              </div>
              <p className="text-center text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                {current.word}
              </p>
              <p className="mt-8 text-center text-xs text-slate-400">{v.flipHint}</p>
            </div>

            <div
              className="absolute inset-0 flex min-h-[22rem] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]"
              aria-hidden={!flipped}
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {meaningLabel}
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-900">{meaningBody}</p>
                </section>
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {labels.collocation}
                  </p>
                  <p className="mt-1 font-medium text-emerald-900">{current.collocation}</p>
                </section>
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {labels.exampleDe}
                  </p>
                  <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-slate-900 ring-1 ring-slate-200/80">
                    {current.example_de}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {labels.translation}
                  </p>
                  <p className="mt-1 text-slate-700">{exampleTranslation}</p>
                </section>
              </div>
              <p className="mt-3 shrink-0 text-center text-xs text-slate-400">{v.flipHint}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleNotFamiliar}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            {v.notFamiliar}
          </button>
          <button
            type="button"
            onClick={handleMastered}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {v.mastered}
          </button>
        </div>
      </div>
    </div>
  )
}
