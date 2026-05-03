import { LanguageSwitch } from '../components/LanguageSwitch.jsx'

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

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

/**
 * @param {{
 *   messages: { listening: Record<string, unknown>; home: { languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   onBack: () => void
 *   onComplete?: () => void
 * }} props
 */
export function ListeningPage({ messages, locale, setLocale, onBack, onComplete }) {
  const { listening: l, home: h } = messages
  const examParts = /** @type {{ title: string; desc: string }[]} */ (l.examParts)
  const officialSets = /** @type {{ title: string; description: string; url: string; difficulty: string; duration: string }[]} */ (
    l.officialSets
  )
  const dailySets = /** @type {{ title: string; description: string; url: string; difficulty: string; duration: string }[]} */ (
    l.dailySets
  )

  const handleComplete = () => {
    const key = `tasks_${todayKey()}`
    const prev = readJsonSafely(key, {})
    writeJsonSafely(key, { ...prev, listening: true })
    onComplete?.()
  }

  const renderCard = (item) => (
    <article key={item.url} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          {l.difficultyLabel}: {item.difficulty}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {l.durationLabel}: {item.duration}
        </span>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-800"
      >
        {l.openLink}
      </a>
    </article>
  )

  return (
    <div className="min-h-dvh bg-white px-6 py-10 pb-16 text-slate-900">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pt-0.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            {l.back}
          </button>
          <LanguageSwitch
            locale={locale}
            setLocale={setLocale}
            zhLabel={h.languageSwitchZh}
            enLabel={h.languageSwitchEn}
          />
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{l.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{l.subtitle}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {examParts.map((part) => (
              <div key={part.title} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">{part.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{part.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-emerald-800">{l.scoreRule}</p>
        </section>

        <section className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">{l.officialTitle}</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
              {l.officialTag}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">{officialSets.map((item) => renderCard(item))}</div>
        </section>

        <section className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">{l.dailyTitle}</h2>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900">
              {l.dailyTag}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">{dailySets.map((item) => renderCard(item))}</div>
        </section>

        <button
          type="button"
          onClick={handleComplete}
          className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {l.doneButton}
        </button>
      </div>
    </div>
  )
}
