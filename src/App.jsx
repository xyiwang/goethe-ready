import { useState } from 'react'

const LEVELS = [
  { id: 'beginner', label: '零基础' },
  { id: 'a1a2', label: '已过A1/A2' },
  { id: 'b1', label: 'B1冲高分' },
]

function App() {
  const [days, setDays] = useState('')
  const [level, setLevel] = useState(null)
  const [generating, setGenerating] = useState(false)

  const handleStart = () => {
    setGenerating(true)
  }

  if (generating) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white px-6">
        <p className="text-center text-lg font-medium tracking-tight text-slate-700">
          正在为你生成专属计划...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-14 text-slate-900 sm:py-20">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            GoetheReady 🇩🇪
          </h1>
          <p className="mt-3 text-base text-slate-500 sm:text-lg">
            歌德考试智能备考平台
          </p>
        </header>

        <label className="sr-only" htmlFor="exam-days">
          距离考试天数
        </label>
        <input
          id="exam-days"
          type="text"
          inputMode="numeric"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="距离考试还有多少天？"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />

        <p className="mb-3 mt-8 text-left text-sm font-medium text-slate-600">
          当前水平
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-2">
          {LEVELS.map(({ id, label }) => {
            const selected = level === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setLevel(id)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition sm:flex-1 sm:min-w-[calc(33.333%-0.5rem)] ${
                  selected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-12 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:bg-emerald-800"
        >
          开始制定我的备考计划
        </button>
      </div>
    </div>
  )
}

export default App
