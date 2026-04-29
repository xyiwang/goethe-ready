import { useEffect, useMemo, useRef, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'

const TOPIC_TYPE = 'Teil 2'
const KEYWORDS = ['wohnen', 'gefallen', 'Sehenswürdigkeit']
const PREP_SECONDS = 60

function formatSeconds(total) {
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function normalizeFeedback(raw) {
  try {
    const parsed = JSON.parse(raw)
    return {
      pronunciation: parsed.pronunciation ?? { score: '', advice: '' },
      grammar: parsed.grammar ?? { score: '', advice: '' },
      vocabulary: parsed.vocabulary ?? { score: '', advice: '' },
      fluency: parsed.fluency ?? { score: '', advice: '' },
      overall: parsed.overall ?? '',
    }
  } catch {
    return {
      pronunciation: { score: '', advice: raw },
      grammar: { score: '', advice: '' },
      vocabulary: { score: '', advice: '' },
      fluency: { score: '', advice: '' },
      overall: '',
    }
  }
}

/**
 * @param {{
 *   messages: { speaking: Record<string, unknown>; home: { languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   language?: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   onBack: () => void
 * }} props
 */
export function SpeakingPage({ messages, locale, language = locale, setLocale, onBack }) {
  const { speaking: s, home: h } = messages
  const [prepLeft, setPrepLeft] = useState(PREP_SECONDS)
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const recognitionRef = useRef(null)
  const recordTimerRef = useRef(null)

  const supportSpeech = useMemo(() => !!getSpeechRecognition(), [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPrepLeft((n) => Math.max(0, n - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current)
    }
  }, [])

  const startRecording = () => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setError(s.unsupported)
      return
    }

    setError('')
    setTranscript('')
    setInterimTranscript('')
    setRecordSeconds(0)

    const recognition = new SpeechRecognition()
    recognition.lang = 'de-DE'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) finalText += text
        else interimText += text
      }
      if (finalText) {
        setTranscript((prev) => `${prev} ${finalText}`.trim())
      }
      setInterimTranscript(interimText.trim())
    }

    recognition.onerror = () => {
      setError(s.recordingError)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current)
        recordTimerRef.current = null
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    recordTimerRef.current = window.setInterval(() => {
      setRecordSeconds((n) => n + 1)
    }, 1000)
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const handleFeedback = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      setError(s.missingKey)
      return
    }

    setLoading(true)
    setError('')
    setFeedback(null)

    const systemPrompt =
      language === 'en'
        ? `You are a German B1 speaking exam evaluator. Give all feedback in English.
Evaluate the student's German speaking response in four dimensions: pronunciation advice, grammar, vocabulary, and fluency.
Give each dimension a score from 1 to 5 and specific advice. Return JSON only:
{"pronunciation":{"score":1,"advice":"..."},"grammar":{"score":1,"advice":"..."},"vocabulary":{"score":1,"advice":"..."},"fluency":{"score":1,"advice":"..."},"overall":"..."}`
        : `你是德语B1口语考试评估老师，用中文给出反馈。
从发音建议、语法、词汇、流利度四个维度评价，每个维度给1-5分，最后给出总体建议。
只返回 JSON：
{"pronunciation":{"score":1,"advice":"..."},"grammar":{"score":1,"advice":"..."},"vocabulary":{"score":1,"advice":"..."},"fluency":{"score":1,"advice":"..."},"overall":"..."}`

    const userPrompt =
      language === 'en'
        ? `Speaking task: ${s.topic}\n\nStudent transcript:\n${transcript}`
        : `口语题目：${s.topic}\n\n学生转写：\n${transcript}`

    try {
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
      setFeedback(normalizeFeedback(content))
    } catch (e) {
      setError(e instanceof Error ? e.message : s.genericError)
    } finally {
      setLoading(false)
    }
  }

  const fullTranscript = `${transcript}${interimTranscript ? ` ${interimTranscript}` : ''}`.trim()
  const cards = feedback
    ? [
        ['pronunciation', s.dimensions.pronunciation, feedback.pronunciation],
        ['grammar', s.dimensions.grammar, feedback.grammar],
        ['vocabulary', s.dimensions.vocabulary, feedback.vocabulary],
        ['fluency', s.dimensions.fluency, feedback.fluency],
      ]
    : []

  return (
    <div className="min-h-dvh bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pt-0.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            {s.back}
          </button>
          <LanguageSwitch
            locale={locale}
            setLocale={setLocale}
            zhLabel={h.languageSwitchZh}
            enLabel={h.languageSwitchEn}
          />
        </div>

        <header className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-5">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            {TOPIC_TYPE}
          </span>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">{s.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.topic}</p>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">{s.prepareTime}</span>
            <span className="text-2xl font-bold tabular-nums text-emerald-700">
              {formatSeconds(prepLeft)}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {KEYWORDS.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {kw}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-center">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={!supportSpeech}
            className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full text-5xl shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-200 ${
              isRecording
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            aria-pressed={isRecording}
          >
            🎙️
          </button>
          <p className="mt-4 text-sm font-medium text-slate-600">
            {isRecording
              ? `${s.recording} ${recordSeconds}s`
              : supportSpeech
                ? s.tapToRecord
                : s.unsupported}
          </p>
        </section>

        {fullTranscript && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-slate-900">{s.transcriptTitle}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {fullTranscript}
            </p>
          </section>
        )}

        <button
          type="button"
          onClick={handleFeedback}
          disabled={loading || transcript.trim().length === 0}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {loading ? s.loading : s.getFeedback}
        </button>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        {feedback && (
          <section className="mt-8 space-y-4">
            {cards.map(([key, label, item]) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">{label}</h2>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                    {item.score}/5
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.advice}</p>
              </div>
            ))}
            {feedback.overall && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <h2 className="font-semibold text-emerald-950">{s.overallTitle}</h2>
                <p className="mt-2 text-sm leading-relaxed text-emerald-950">{feedback.overall}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
