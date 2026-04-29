import { useMemo, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import grammarPoints from '../data/grammar.js'
import { PLAN_STORAGE_KEY, getDayIndex } from '../utils/planGenerator.js'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * @param {{
 *   messages: { grammar: Record<string, string>; home: { languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   language?: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   onBack: () => void
 * }} props
 */
export function GrammarPage({ messages, locale, language = locale, setLocale, onBack }) {
  const { grammar: g, home: h } = messages
  const lesson = useMemo(() => {
    const total = grammarPoints.length
    if (total === 0) return null

    if (typeof localStorage === 'undefined') return grammarPoints[0]
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY)
      const payload = raw ? JSON.parse(raw) : null
      const dayIndex = payload?.startDate ? getDayIndex(payload.startDate) : 1
      const idx = ((dayIndex - 1) % total + total) % total
      return grammarPoints[idx]
    } catch {
      return grammarPoints[0]
    }
  }, [])

  const [picked, setPicked] = useState(() =>
    /** @type {(number | null)[]} */ (Array.from({ length: lesson.questions.length }, () => null)),
  )
  const [page, setPage] = useState(0)
  const [tipsOpen, setTipsOpen] = useState(false)

  if (!lesson) {
    return null
  }

  const title = language === 'zh' ? lesson.title : lesson.title_en
  const introParas = [
    language === 'zh' ? lesson.explanation_zh : lesson.explanation_en,
    ...(Array.isArray(lesson.examples_de) && lesson.examples_de.length
      ? [`${language === 'zh' ? '例句：' : 'Examples:'} ${lesson.examples_de.join(' / ')}`]
      : []),
  ]

  const total = lesson.questions.length
  const pageSize = 5
  const pageStart = page * pageSize
  const visibleQuestions = lesson.questions.slice(pageStart, pageStart + pageSize)
  const firstPartDone = picked.slice(0, pageSize).every((p) => p !== null)

  const score = useMemo(() => {
    let n = 0
    for (let i = 0; i < total; i++) {
      const p = picked[i]
      const c = lesson.questions[i].answer
      if (p !== null && p === c) n += 1
    }
    return n
  }, [picked, total, lesson.questions])

  const allAnswered = picked.every((p) => p !== null)
  const scoreBand =
    score >= 8 ? g.levelExcellent : score >= 6 ? g.levelGood : g.levelNeedImprove

  const pickOption = (qIndex, optionIndex) => {
    setPicked((prev) => {
      if (prev[qIndex] !== null) return prev
      const next = [...prev]
      next[qIndex] = optionIndex
      return next
    })
  }

  const langSwitch = (
    <LanguageSwitch
      locale={locale}
      setLocale={setLocale}
      zhLabel={h.languageSwitchZh}
      enLabel={h.languageSwitchEn}
    />
  )

  return (
    <div className="min-h-dvh bg-white px-6 py-10 pb-40 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pt-0.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            {g.back}
          </button>
          {langSwitch}
        </div>

        <header className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{g.sectionLabel}</p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
            {introParas.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </header>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={() => setTipsOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-slate-800">{g.tipsTitle}</span>
            <span className="text-xs font-medium text-emerald-700">
              {tipsOpen ? g.tipsHide : g.tipsShow}
            </span>
          </button>
          {tipsOpen && (
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {language === 'zh' ? lesson.tips_zh : lesson.tips_en}
            </p>
          )}
        </section>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            {g.progressText
              .replace('{start}', String(pageStart + 1))
              .replace('{end}', String(Math.min(pageStart + pageSize, total)))
              .replace('{total}', String(total))}
          </p>
        </div>

        <ol
          className="list-decimal space-y-8 pl-5 marker:font-semibold marker:text-slate-800"
          start={pageStart + 1}
        >
          {visibleQuestions.map((q, idx) => {
            const qIndex = pageStart + idx
            const choice = picked[qIndex]
            const locked = choice !== null
            const correct = q.answer
            const explain = language === 'zh' ? q.explanation_zh : q.explanation_en
            const options = language === 'zh' ? q.options_zh : q.options_en
            const qType = language === 'zh' ? q.type_zh : q.type_en

            return (
              <li key={qIndex} className="pl-1">
                <p className="mb-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
                  {qType}
                </p>
                <p className="mb-3 text-base font-medium leading-snug text-slate-900">{q.question}</p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {options.map((text, optIndex) => {
                    const isPicked = choice === optIndex
                    const isCorrect = optIndex === correct
                    let box =
                      'rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition'
                    if (!locked) {
                      box += ' border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50'
                    } else if (isCorrect) {
                      box += ' border-emerald-500 bg-emerald-50 text-emerald-900'
                    } else if (isPicked && !isCorrect) {
                      box += ' border-rose-500 bg-rose-50 text-rose-900'
                    } else {
                      box += ' border-slate-100 bg-slate-50 text-slate-400'
                    }

                    return (
                      <li key={optIndex}>
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => pickOption(qIndex, optIndex)}
                          className={`w-full ${box} disabled:cursor-default`}
                        >
                          <span className="tabular-nums text-slate-500">{LETTERS[optIndex]}.</span>{' '}
                          {text}
                          {locked && isPicked && isCorrect && (
                            <span className="ml-2 text-xs font-semibold text-emerald-600">{g.correct}</span>
                          )}
                          {locked && isPicked && !isCorrect && (
                            <span className="ml-2 text-xs font-semibold text-rose-600">{g.wrong}</span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {locked && choice !== correct && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm text-amber-950">
                    <p>
                      <span className="font-semibold">{g.correctAnswerLabel}</span>
                      {LETTERS[correct]}. {options[correct]}
                    </p>
                    <p className="mt-2">
                      <span className="font-semibold">{g.explainLabel}</span>
                      {explain}
                    </p>
                  </div>
                )}
              </li>
            )
          })}
        </ol>

        {page === 0 && firstPartDone && (
          <button
            type="button"
            onClick={() => setPage(1)}
            className="mt-8 w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {g.nextPartButton}
          </button>
        )}

        {allAnswered && (
          <footer className="mt-10 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-6 text-center">
            <p className="text-lg font-semibold text-emerald-900">
              {score}/{total}
            </p>
            <p className="text-sm font-semibold text-emerald-800">
              {scoreBand}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {g.backToDashboard}
            </button>
          </footer>
        )}

        {allAnswered && Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-800">{g.resourcesTitle}</h3>
            <ul className="mt-3 space-y-2">
              {lesson.resources.map((res) => (
                <li key={res.url}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
                  >
                    {language === 'zh'
                      ? res.name_zh || res.name
                      : res.name_en || res.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
