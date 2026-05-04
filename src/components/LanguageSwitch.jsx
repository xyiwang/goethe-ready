/**
 * @param {{
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   zhLabel: string
 *   enLabel: string
 * }} props
 */
export function LanguageSwitch({ locale, setLocale, zhLabel, enLabel }) {
  const base = 'px-2 py-1 text-xs font-medium transition sm:text-sm'
  const active = 'text-[var(--accent)]'
  const idle = 'text-[var(--text-secondary)] hover:text-[var(--accent)]'

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-1 py-0.5 shadow-sm"
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
      <span className="text-[10px] text-[var(--text-secondary)]">/</span>
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
