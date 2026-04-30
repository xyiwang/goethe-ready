import { useEffect, useMemo, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import writingTasks from '../data/writing.js'
import { PLAN_STORAGE_KEY, getDayIndex } from '../utils/planGenerator.js'

function countWords(text) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatRemaining(seconds) {
  const safe = Math.max(0, seconds)
  const mm = Math.floor(safe / 60)
  const ss = safe % 60
  return `${pad2(mm)}:${pad2(ss)}`
}

function pickWeeklyTask() {
  if (!Array.isArray(writingTasks) || writingTasks.length === 0) {
    return { task: null, dayIndex: 1, weekNumber: 1, teilNumber: 1 }
  }

  let dayIndex = 1
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY)
      const payload = raw ? JSON.parse(raw) : null
      dayIndex = payload?.startDate ? getDayIndex(payload.startDate) : 1
    } catch {
      dayIndex = 1
    }
  }

  const weekNumber = Math.floor((dayIndex - 1) / 7) + 1
  const mod = dayIndex % 3
  const teilNumber = mod === 0 ? 1 : mod === 1 ? 2 : 3
  const teilTasks = writingTasks.filter((item) => item.teil === teilNumber)
  const safeTeilTasks = teilTasks.length > 0 ? teilTasks : writingTasks

  const baseIndex = Math.floor(dayIndex / 3)
  const idx = baseIndex % safeTeilTasks.length

  return {
    task: safeTeilTasks[idx],
    dayIndex,
    weekNumber,
    teilNumber,
  }
}

function normalizeFeedback(raw, fallbackTotal) {
  try {
    const parsed = JSON.parse(raw)
    const score = Number(parsed.score)
    const strengths = Array.isArray(parsed.strengths)
      ? parsed.strengths.map((x) => String(x))
      : [String(parsed.strengths ?? '')]
    const improvements = Array.isArray(parsed.improvements)
      ? parsed.improvements.map((x) => String(x))
      : [String(parsed.improvements ?? '')]

    const coverageSource = parsed.keyPointCoverage ?? parsed.coverage ?? {}
    const total = Number(coverageSource.total)
    const covered = Number(coverageSource.covered)
    const details = Array.isArray(coverageSource.details)
      ? coverageSource.details.map((item) => ({
          point: String(item?.point ?? ''),
          covered: Boolean(item?.covered),
          comment: String(item?.comment ?? ''),
        }))
      : []

    return {
      score: Number.isNaN(score) ? parsed.score ?? '' : score,
      strengths,
      improvements,
      model: String(parsed.model ?? parsed.sample ?? ''),
      keyPointCoverage: {
        total: Number.isNaN(total) ? fallbackTotal : total,
        covered: Number.isNaN(covered) ? 0 : covered,
        details,
      },
    }
  } catch {
    return {
      score: '',
      strengths: [],
      improvements: [raw],
      model: '',
      keyPointCoverage: {
        total: fallbackTotal,
        covered: 0,
        details: [],
      },
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

  const { task, dayIndex, weekNumber } = useMemo(() => pickWeeklyTask(), [])
  const requirements = language === 'zh' ? task?.requirements_zh : task?.requirements_en
  const requirementsSafe = Array.isArray(requirements) ? requirements : []

  const [requirementChecks, setRequirementChecks] = useState(() =>
    Array.from({ length: requirementsSafe.length }, () => false),
  )
  const [remainingSeconds, setRemainingSeconds] = useState(() => (task?.timeLimit ?? 20) * 60)

  useEffect(() => {
    setRequirementChecks(Array.from({ length: requirementsSafe.length }, () => false))
    setRemainingSeconds((task?.timeLimit ?? 20) * 60)
    setEssay('')
    setFeedback(null)
    setError('')
  }, [task?.id, requirementsSafe.length])

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const wordCount = useMemo(() => countWords(essay), [essay])
  const checkedCount = useMemo(
    () => requirementChecks.filter(Boolean).length,
    [requirementChecks],
  )

  const promptTitle = task ? (language === 'zh' ? task.situation_zh : task.situation_en) : w.prompt
  const promptLead = task ? (language === 'zh' ? task.task_zh : task.task_en) : ''
  const targetRange = task
    ? language === 'zh'
      ? `目标：${task.wordCount.min}-${task.wordCount.max}词`
      : `Target: ${task.wordCount.min}-${task.wordCount.max} words`
    : w.targetCount
  const coverageLabel = language === 'zh' ? '要点完成度' : 'Key Point Coverage'
  const timerLabel = language === 'zh' ? '倒计时' : 'Countdown'
  const selfCheckLabel = language === 'zh' ? '自评已完成要点' : 'Self-checked points'
  const weekInfo = language === 'zh' ? `第 ${weekNumber} 周` : `Week ${weekNumber}`
  const dayInfo = language === 'zh' ? `备考第 ${dayIndex} 天` : `Day ${dayIndex}`
  const hasFeedback = Boolean(feedback)

  const toggleRequirement = (index) => {
    setRequirementChecks((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

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
          ? `You are a German Goethe B1 writing examiner. Reply strictly in this JSON format:
{
  "score": number (out of 20),
  "strengths": ["English point 1", "English point 2"],
  "improvements": ["English suggestion 1 with wrong+correct German", "suggestion 2"],
  "model": "German model answer",
  "keyPointCoverage": {
    "covered": number,
    "total": number,
    "details": [
      { "point": "requirement text", "covered": true, "comment": "short explanation in English" }
    ]
  }
}
All strengths/improvements/comments must be in English.`
          : `你是专业德语歌德B1写作考官。严格按以下JSON格式回复，不要输出其他内容：
{
  "score": 数字（满分20，只返回数字）,
  "strengths": ["中文优点1", "中文优点2"],
  "improvements": ["中文建议1（含错误+正确写法）", "建议2"],
  "model": "德语参考范文",
  "keyPointCoverage": {
    "covered": 数字,
    "total": 数字,
    "details": [
      { "point": "要点文本", "covered": true, "comment": "中文简短说明" }
    ]
  }
}
请重点检查考生作文是否覆盖全部要求要点。`

      const reqLines = requirementsSafe
        .map((item, idx) => `${idx + 1}. ${item}`)
        .join('\n')
      const checkedLines = requirementsSafe
        .filter((_, idx) => requirementChecks[idx])
        .map((item) => `- ${item}`)
        .join('\n')

      const userPrompt =
        language === 'en'
          ? `Task meta:
- Part: ${task?.teil_en || 'Part 1'}
- Type: ${task?.type_en || 'Semi-formal Email'}
- Time limit: ${task?.timeLimit || 20} minutes
- Word target: ${task?.wordCount?.min || 80}-${task?.wordCount?.max || 100}

Situation:
${task?.situation_en || promptTitle}

Instruction:
${task?.task_en || 'Write your text.'}

Required key points:
${reqLines}

Student self-check (reference only):
${checkedLines || '- none'}

Student essay:
${essay}`
          : `题目信息：
- 部分：${task?.teil_zh || '第一部分'}
- 题型：${task?.type_zh || '半正式邮件'}
- 限时：${task?.timeLimit || 20}分钟
- 字数目标：${task?.wordCount?.min || 80}-${task?.wordCount?.max || 100}

情境：
${task?.situation_zh || promptTitle}

写作任务：
${task?.task_zh || '完成写作。'}

必须覆盖的要点：
${reqLines}

学生自评勾选（仅供参考）：
${checkedLines || '- 无'}

学生作文：
${essay}`

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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
      })

      if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) throw new Error('Empty response')
      setFeedback(normalizeFeedback(content, requirementsSafe.length || 3))
    } catch (e) {
      setError(e instanceof Error ? e.message : w.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-5xl">
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{w.sectionLabel}</p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                {weekInfo}
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                {dayInfo}
              </span>
              {task && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {language === 'zh' ? task.teil_zh : task.teil_en}
                </span>
              )}
            </div>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{w.title}</h1>
          {task && (
            <p className="mt-1 text-sm font-medium text-slate-700">
              {language === 'zh' ? task.type_zh : task.type_en}
            </p>
          )}
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{promptTitle}</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{promptLead}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{timerLabel}</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">{formatRemaining(remainingSeconds)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{coverageLabel}</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {feedback
                  ? `${feedback.keyPointCoverage.covered}/${feedback.keyPointCoverage.total}`
                  : `${checkedCount}/${requirementsSafe.length}`}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">{selfCheckLabel}</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {checkedCount}/{requirementsSafe.length}
              </p>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{language === 'zh' ? '必须完成的3个要点' : '3 Required Key Points'}</h2>
          <ul className="mt-3 space-y-2">
            {requirementsSafe.map((item, idx) => (
              <li key={item}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={Boolean(requirementChecks[idx])}
                    onChange={() => toggleRequirement(idx)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                  />
                  <span className="text-sm text-slate-800">{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-4">
          {!hasFeedback && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                {language === 'zh' ? '你的作文' : 'Your Essay'}
              </h2>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder={w.placeholder}
                className="min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-4 text-base leading-relaxed text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">{w.wordCount.replace('{n}', String(wordCount))}</span>
                <span className="font-medium text-slate-400">{targetRange}</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || essay.trim().length === 0}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {loading ? w.loading : w.submit}
              </button>
              {loading && (
                <p className="mt-3 text-sm font-medium text-emerald-700">
                  {language === 'zh' ? 'AI 正在批改，请稍候...' : 'AI is reviewing, please wait...'}
                </p>
              )}
              {error && (
                <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </p>
              )}
            </section>
          )}

          {hasFeedback && (
            <>
              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="font-semibold text-slate-900">📊 {w.scoreTitle}</h2>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">
                    {formatScore(feedback.score, w.scoreFormat)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-800">
                    {coverageLabel}：{feedback.keyPointCoverage.covered}/{feedback.keyPointCoverage.total}
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

                {Array.isArray(feedback.keyPointCoverage.details) &&
                  feedback.keyPointCoverage.details.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h2 className="font-semibold text-slate-900">
                        {language === 'zh' ? '要点覆盖明细' : 'Key Point Coverage Details'}
                      </h2>
                      <ul className="mt-3 space-y-2">
                        {feedback.keyPointCoverage.details.map((item, i) => (
                          <li
                            key={`${item.point}-${i}`}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                          >
                            <p className="font-medium text-slate-800">{item.point}</p>
                            <p
                              className={`mt-1 font-semibold ${item.covered ? 'text-emerald-700' : 'text-rose-700'}`}
                            >
                              {item.covered
                                ? language === 'zh'
                                  ? '已覆盖'
                                  : 'Covered'
                                : language === 'zh'
                                  ? '未覆盖'
                                  : 'Missing'}
                            </p>
                            {item.comment && <p className="mt-1 text-slate-600">{item.comment}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </section>

              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-emerald-950">
                  {language === 'zh' ? '参考范文对比' : 'Reference Model Comparison'}
                </h2>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {language === 'zh' ? '你的作文' : 'Your Essay'}
                    </p>
                    <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-900">
                      {essay}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      {language === 'zh' ? '参考范文' : 'Reference Model'}
                    </p>
                    <p className="whitespace-pre-line rounded-xl border border-emerald-200 bg-white px-4 py-4 text-sm leading-relaxed text-emerald-950">
                      {(feedback && feedback.model) || task?.modelAnswer_de || ''}
                    </p>
                  </div>
                </div>
                {task && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {language === 'zh' ? '评分标准' : 'Scoring Criteria'}
                    </h3>
                    <p className="mt-2 text-sm text-slate-700">
                      {language === 'zh' ? task.scoringCriteria_zh : task.scoringCriteria_en}
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
