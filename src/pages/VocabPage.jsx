import { useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'

/** @typedef {{ word: string; type: string; meaning_zh: string; meaning_en: string; collocation: string; example_de: string; example_zh: string; example_en: string }} VocabEntry */

/** @type {VocabEntry[]} */
const VOCAB_MOCK = [
  {
    word: 'Verantwortung',
    type: 'die',
    meaning_zh: '责任',
    meaning_en: 'responsibility',
    collocation: 'Verantwortung übernehmen / tragen',
    example_de: 'Er übernimmt die Verantwortung für das Projekt.',
    example_zh: '他为这个项目承担责任。',
    example_en: 'He takes responsibility for the project.',
  },
  {
    word: 'Umgebung',
    type: 'die',
    meaning_zh: '环境；周围',
    meaning_en: 'surroundings; environment',
    collocation: 'in der Umgebung von …',
    example_de: 'Wir wohnen in ruhiger Umgebung.',
    example_zh: '我们住在安静的环境中。',
    example_en: 'We live in a quiet environment.',
  },
  {
    word: 'Fortschritt',
    type: 'der',
    meaning_zh: '进步',
    meaning_en: 'progress',
    collocation: 'Fortschritte machen',
    example_de: 'Sie macht schnelle Fortschritte im Deutschunterricht.',
    example_zh: '她在德语课上进步很快。',
    example_en: 'She is making rapid progress in German class.',
  },
  {
    word: 'Angebot',
    type: 'das',
    meaning_zh: '报价；供应',
    meaning_en: 'offer; supply',
    collocation: 'ein gutes Angebot',
    example_de: 'Das Hotel hat ein attraktives Angebot für Gäste.',
    example_zh: '这家酒店为客人提供有吸引力的套餐。',
    example_en: 'The hotel has an attractive offer for guests.',
  },
  {
    word: 'bewerben',
    type: 'verb',
    meaning_zh: '申请；宣传',
    meaning_en: 'to apply; to advertise',
    collocation: 'sich um eine Stelle bewerben',
    example_de: 'Sie bewirbt sich um eine Stelle in Berlin.',
    example_zh: '她在申请柏林的一个职位。',
    example_en: 'She is applying for a position in Berlin.',
  },
  {
    word: 'Ziel',
    type: 'das',
    meaning_zh: '目标',
    meaning_en: 'goal; destination',
    collocation: 'ein Ziel erreichen',
    example_de: 'Unser Ziel ist es, die Prüfung zu bestehen.',
    example_zh: '我们的目标是通过考试。',
    example_en: 'Our goal is to pass the exam.',
  },
  {
    word: 'Möglichkeit',
    type: 'die',
    meaning_zh: '可能性；机会',
    meaning_en: 'possibility; opportunity',
    collocation: 'die Möglichkeit haben, …',
    example_de: 'Du hast die Möglichkeit, früher zu gehen.',
    example_zh: '你有机会早点离开。',
    example_en: 'You have the option to leave earlier.',
  },
  {
    word: 'Erfahrung',
    type: 'die',
    meaning_zh: '经验',
    meaning_en: 'experience',
    collocation: 'Erfahrungen sammeln',
    example_de: 'In diesem Job sammelt man viele Erfahrungen.',
    example_zh: '这份工作能让人积累很多经验。',
    example_en: 'This job lets you gain a lot of experience.',
  },
  {
    word: 'Vorteil',
    type: 'der',
    meaning_zh: '优点；好处',
    meaning_en: 'advantage',
    collocation: 'einen Vorteil haben',
    example_de: 'Ein Vorteil des Online-Lernens ist die Flexibilität.',
    example_zh: '在线学习的一个优点是灵活。',
    example_en: 'One advantage of online learning is flexibility.',
  },
  {
    word: 'erreichen',
    type: 'verb',
    meaning_zh: '达到；到达',
    meaning_en: 'to reach; to achieve',
    collocation: 'ein Ziel erreichen',
    example_de: 'Wir wollen unser Ziel bis Juni erreichen.',
    example_zh: '我们想在六月前达到目标。',
    example_en: 'We want to reach our goal by June.',
  },
]

function typeBadgeClass(type) {
  const t = String(type).toLowerCase()
  if (t === 'der') return 'bg-sky-100 text-sky-800 ring-1 ring-sky-300/80'
  if (t === 'die') return 'bg-rose-100 text-rose-800 ring-1 ring-rose-300/80'
  if (t === 'das') return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/80'
  if (t === 'verb') return 'bg-amber-100 text-amber-900 ring-1 ring-amber-300/80'
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-300/80'
}

function typeDisplayLabel(type, labels) {
  const t = String(type).toLowerCase()
  if (t === 'verb') return labels.typeVerb
  return String(type)
}

/**
 * @param {{
 *   messages: { vocab: Record<string, unknown>; home: { languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   onBack: () => void
 * }} props
 */
export function VocabPage({ messages, locale, setLocale, onBack }) {
  const { vocab: v, home: h } = messages
  const labels = v.labels

  const [queue, setQueue] = useState(VOCAB_MOCK)
  const [flipped, setFlipped] = useState(false)

  const current = queue[0]

  const langSwitch = (
    <LanguageSwitch
      locale={locale}
      setLocale={setLocale}
      zhLabel={h.languageSwitchZh}
      enLabel={h.languageSwitchEn}
    />
  )

  const headerRow = (
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
  )

  const handleNotFamiliar = () => {
    setQueue((q) => (q.length <= 1 ? q : [...q.slice(1), q[0]]))
    setFlipped(false)
  }

  const handleMastered = () => {
    setQueue((q) => q.slice(1))
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
        {headerRow}

        <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
          {v.progressHint.replace('{n}', String(queue.length))}
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
            {/* 正面 */}
            <div
              className="absolute inset-0 flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm [backface-visibility:hidden]"
              aria-hidden={flipped}
            >
              <span
                className={`mb-6 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeBadgeClass(current.type)}`}
              >
                {typeDisplayLabel(current.type, labels)}
              </span>
              <p className="text-center text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                {current.word}
              </p>
              <p className="mt-8 text-center text-xs text-slate-400">{v.flipHint}</p>
            </div>

            {/* 背面 */}
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
            onClick={() => handleNotFamiliar()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            {v.notFamiliar}
          </button>
          <button
            type="button"
            onClick={() => handleMastered()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {v.mastered}
          </button>
        </div>
      </div>
    </div>
  )
}
