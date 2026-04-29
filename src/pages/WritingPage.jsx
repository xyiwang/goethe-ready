import { useMemo, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import writingTasks from '../data/writing.js'
import { PLAN_STORAGE_KEY, getDayIndex } from '../utils/planGenerator.js'

function countWords(text) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function normalizeFeedback(raw) {
  try {
    const parsed = JSON.parse(raw)
    const score = Number(parsed.score)
    return {
      score: Number.isNaN(score) ? parsed.score ?? '' : score,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [String(parsed.strengths ?? '')],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements
        : [String(parsed.improvements ?? '')],
      model: parsed.model ?? parsed.sample ?? '',
    }
  } catch {
    return {
      score: '',
      strengths: [],
      improvements: [raw],
      model: '',
    }
  }
}

function formatScore(score, template) {
  const n = Number(score)
  const displayScore = Number.isNaN(n) ? String(score || '') : String(n)
  return template.replace('{score}', displayScore)
}

/**
 * @param {{
 *   messages: { writing: Record<string, unknown>; home: { languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   language?: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   onBack: () => void
 * }} props
 */
export function WritingPage({ messages, locale, language = locale, setLocale, onBack }) {
  const { writing: w, home: h } = messages
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  const wordCount = useMemo(() => countWords(essay), [essay])
  const task = useMemo(() => {
    const total = writingTasks.length
    if (!total) return null
    if (typeof localStorage === 'undefined') return writingTasks[0]

    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY)
      const payload = raw ? JSON.parse(raw) : null
      const dayIndex = payload?.startDate ? getDayIndex(payload.startDate) : 1
      const idx = ((dayIndex - 1) % total + total) % total
      return writingTasks[idx]
    } catch {
      return writingTasks[0]
    }
  }, [])

  const promptText = task?.prompt_de ?? w.prompt
  const checklist = language === 'zh' ? task?.checklist_zh : task?.checklist_en
  const targetRange = task
    ? language === 'zh'
      ? `目标：${task.minWords}-${task.maxWords}词`
      : `Target: ${task.minWords}-${task.maxWords} words`
    : w.targetCount

  const handleSubmit = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      setError(w.missingKey)
      return
    }

    setLoading(true)
    setError('')
    setFeedback(null)

    try {
      const systemPrompt =
        language === 'en'
          ? `You are a German B1 exam writing coach. Reply strictly in this JSON format:
{
  "score": number (out of 20),
  "strengths": ["English strength 1", "English strength 2"],
  "improvements": ["English suggestion 1 with wrong+correct German", "suggestion 2"],
  "model": "German model answer"
}
All strengths and improvements must be in English.`
          : `你是专业德语B1考试批改老师。严格按以下JSON格式回复，不要加任何其他内容：
{
  "score": 数字（满分20分，只返回数字）,
  "strengths": ["中文优点1", "中文优点2"],
  "improvements": ["中文改进建议1，包含错误写法+正确写法", "建议2"],
  "model": "德语范文"
}
所有 strengths 和 improvements 必须用中文写。`

      const userPrompt =
        language === 'en'
          ? `Writing task (German): ${promptText}\n\nStudent essay:\n${essay}`
          : `写作题目（德语）：${promptText}\n\n学生作文：\n${essay}`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.status}`)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) throw new Error('Empty response')
      setFeedback(normalizeFeedback(content))
    } catch (e) {
      setError(e instanceof Error ? e.message : w.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pt-0.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            {w.back}
          </button>
          <LanguageSwitch
            locale={locale}
            setLocale={setLocale}
            zhLabel={h.languageSwitchZh}
            enLabel={h.languageSwitchEn}
          />
        </div>

        <header className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {w.sectionLabel}
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{w.title}</h1>
          {task?.title_zh && task?.title_en && (
            <p className="mt-2 text-sm font-medium text-slate-700">
              {language === 'zh' ? task.title_zh : task.title_en}
            </p>
          )}
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {promptText}
          </p>
          {Array.isArray(checklist) && checklist.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </header>

        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder={w.placeholder}
          className="min-h-64 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base leading-relaxed text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {w.wordCount.replace('{n}', String(wordCount))}
          </span>
          <span className="font-medium text-slate-400">{targetRange}</span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || essay.trim().length === 0}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {loading ? w.loading : w.submit}
        </button>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        {feedback && (
          <section className="mt-8 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">📊 {w.scoreTitle}</h2>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {formatScore(feedback.score, w.scoreFormat)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">✅ {w.strengthsTitle}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {feedback.strengths.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <h2 className="font-semibold text-amber-950">⚠️ {w.improvementsTitle}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-950">
                {feedback.improvements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <h2 className="font-semibold text-emerald-950">💡 {w.sampleTitle}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-emerald-950">
                {feedback.model}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
