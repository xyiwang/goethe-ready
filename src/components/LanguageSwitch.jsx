/**
 * @param {{
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   zhLabel: string
 *   enLabel: string
 * }} props
 */
export function LanguageSwitch({ locale, setLocale, zhLabel, enLabel }) {
  const base =
    'rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:text-sm sm:px-3 sm:py-1.5'
  const active = 'bg-emerald-600 text-white shadow-sm'
  const idle = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/95 p-0.5 shadow-sm backdrop-blur-sm"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale('zh')}
        className={`${base} ${locale === 'zh' ? active : idle}`}
        aria-pressed={locale === 'zh'}
      >
        {zhLabel}
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`${base} ${locale === 'en' ? active : idle}`}
        aria-pressed={locale === 'en'}
      >
        {enLabel}
      </button>
    </div>
  )
}
