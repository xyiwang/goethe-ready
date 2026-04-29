import { useMemo, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'

const LETTERS = ['A', 'B', 'C', 'D']

/** 今日语法假数据（题目为德语，说明/解析随界面语言切换） */
const GRAMMAR_LESSON = {
  titleZh: 'Konjunktiv II（虚拟式二式）',
  titleEn: 'Konjunktiv II (subjunctive II)',
  introZh: [
    '用于表达假设、愿望或礼貌请求。',
    '与直陈式不同，它常表示非真实或与事实相反的设想。',
    '常见构成：würde + 动词原形；部分动词有不规则形式（如 hätte, wäre）。',
  ],
  introEn: [
    'Used for hypotheticals, wishes, or polite requests.',
    'Unlike the indicative, it often marks something as unreal or contrary to fact.',
    'Common pattern: würde + infinitive; some verbs use irregular forms (e.g. hätte, wäre).',
  ],
  questions: [
    {
      prompt: 'Wenn ich Zeit _____, würde ich reisen.',
      options: ['habe', 'hätte', 'hatte', 'haben'],
      correctIndex: 1,
      explainZh: '条件句用 Konjunktiv II。',
      explainEn: 'In this conditional, Konjunktiv II requires hätte, parallel to würde.',
    },
    {
      prompt: 'Er sagte, er _____ kommen.',
      options: ['wird', 'würde', 'ist', 'war'],
      correctIndex: 1,
      explainZh: '间接引语中常用 Konjunktiv II（würde）表示将来意义的转述。',
      explainEn: 'Reported speech often uses Konjunktiv II (würde) for a future-oriented statement.',
    },
    {
      prompt: '_____ Sie mir bitte helfen?',
      options: ['Können', 'Könnten', 'Konnten', 'Kann'],
      correctIndex: 1,
      explainZh: '礼貌请求用 Könnten（Konjunktiv II），比直陈式更委婉。',
      explainEn: 'Polite requests often use Könnten (Konjunktiv II) instead of the indicative.',
    },
  ],
}

/**
 * @param {{
 *   messages: { grammar: Record<string, string>; home: { languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   onBack: () => void
 * }} props
 */
export function GrammarPage({ messages, locale, setLocale, onBack }) {
  const { grammar: g, home: h } = messages
  const [picked, setPicked] = useState(() => /** @type {(number | null)[]} */ ([null, null, null]))

  const title = locale === 'zh' ? GRAMMAR_LESSON.titleZh : GRAMMAR_LESSON.titleEn
  const introParas = locale === 'zh' ? GRAMMAR_LESSON.introZh : GRAMMAR_LESSON.introEn

  const total = GRAMMAR_LESSON.questions.length

  const score = useMemo(() => {
    let n = 0
    for (let i = 0; i < total; i++) {
      const p = picked[i]
      const c = GRAMMAR_LESSON.questions[i].correctIndex
      if (p !== null && p === c) n += 1
    }
    return n
  }, [picked, total])

  const allAnswered = picked.every((p) => p !== null)

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

        <ol className="list-decimal space-y-8 pl-5 marker:font-semibold marker:text-slate-800">
          {GRAMMAR_LESSON.questions.map((q, qIndex) => {
            const choice = picked[qIndex]
            const locked = choice !== null
            const correct = q.correctIndex
            const explain = locale === 'zh' ? q.explainZh : q.explainEn

            return (
              <li key={qIndex} className="pl-1">
                <p className="mb-3 text-base font-medium leading-snug text-slate-900">{q.prompt}</p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((text, optIndex) => {
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
                      {LETTERS[correct]}. {q.options[correct]}
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

        {allAnswered && (
          <footer className="mt-10 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-6 text-center">
            <p className="text-lg font-semibold text-emerald-900">
              {g.scoreSummary.replace('{correct}', String(score)).replace('{total}', String(total))}
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
      </div>
    </div>
  )
}
