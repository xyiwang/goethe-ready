import { useEffect, useMemo, useState } from 'react'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import * as checkin from '../utils/checkin.js'
import {
  PLAN_STORAGE_KEY,
  generatePlan,
  getDayIndex,
  getTodayTasks,
} from '../utils/planGenerator.js'

const TASK_IDS = ['vocab', 'grammar', 'listening', 'writing']

const TASK_ICONS = {
  vocab: '📚',
  grammar: '📖',
  listening: '🎧',
  writing: '✍️',
}

const STREAK_SESSION_KEY = 'goethe-dismiss-streak'

/**
 * @param {{
 *   messages: { dashboard: Record<string, unknown>; home: { levels: Record<string, string>; languageSwitchZh: string; languageSwitchEn: string } }
 *   locale: 'zh' | 'en'
 *   setLocale: (locale: 'zh' | 'en') => void
 *   days: string
 *   levelId: string
 *   levelLabel: string
 *   onBack?: () => void
 *   onStartVocab?: () => void
 *   onStartGrammar?: () => void
 *   onStartWriting?: () => void
 *   onViewProgress?: () => void
 * }} props
 */
export function DashboardPage({
  messages,
  locale,
  setLocale,
  days,
  levelId,
  levelLabel,
  onBack,
  onStartVocab,
  onStartGrammar,
  onStartWriting,
  onViewProgress,
}) {
  const { dashboard: d, home: h } = messages
  const levelDisplay = (levelId && h.levels[levelId]) || levelLabel

  const todayStr = useMemo(() => checkin.ymd(new Date()), [])
  const storedStudyPlan = useMemo(() => {
    if (typeof localStorage === 'undefined') return null
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  const activePlan = useMemo(() => {
    return storedStudyPlan?.plan ?? generatePlan(days, levelId)
  }, [days, levelId, storedStudyPlan])

  const dayIndex = useMemo(() => {
    return storedStudyPlan?.startDate ? getDayIndex(storedStudyPlan.startDate) : 1
  }, [storedStudyPlan])

  const todayPlan = useMemo(() => getTodayTasks(activePlan, dayIndex), [activePlan, dayIndex])

  const taskDefs = useMemo(() => {
    const taskMsgs = d.tasks
    const ids = TASK_IDS.filter((id) => {
      if (id === 'vocab') return todayPlan.todayVocab > 0
      if (id === 'grammar') return todayPlan.todayGrammar
      if (id === 'listening') return todayPlan.todayListening
      if (id === 'writing') return todayPlan.todayWriting
      return true
    })

    return ids.map((id) => {
      const t = taskMsgs[id]
      return {
        id,
        icon: TASK_ICONS[id],
        title: t.title,
        description:
          id === 'vocab'
            ? d.vocabTodayDescription.replace('{n}', String(todayPlan.todayVocab))
            : t.description,
        isMakeup: false,
        rowKey: id,
        baseId: id,
      }
    })
  }, [d.tasks, d.vocabTodayDescription, todayPlan])

  const makeupRaw = useMemo(() => {
    const map = checkin.getMakeupByDate()
    return map[todayStr] || []
  }, [todayStr])

  const makeupTaskDefs = useMemo(() => {
    return makeupRaw.map((baseId, idx) => {
      const t = d.tasks[baseId]
      return {
        id: baseId,
        baseId,
        rowKey: `${baseId}__mk__${idx}`,
        isMakeup: true,
        icon: TASK_ICONS[baseId],
        title: t.title,
        description: t.description,
      }
    })
  }, [makeupRaw, d.tasks])

  const [done, setDone] = useState({})
  const [checkinBanner, setCheckinBanner] = useState(/** @type {string | null} */ (null))
  const [modalTick, setModalTick] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 合并 base + 补课行 key，与任务列表保持同步
    setDone((prev) => {
      const next = { ...prev }
      for (const t of taskDefs) {
        if (!(t.rowKey in next)) next[t.rowKey] = false
      }
      for (const t of makeupTaskDefs) {
        if (!(t.rowKey in next)) next[t.rowKey] = false
      }
      const allowed = new Set([
        ...taskDefs.map((t) => t.rowKey),
        ...makeupTaskDefs.map((t) => t.rowKey),
      ])
      for (const k of Object.keys(next)) {
        if (!allowed.has(k)) delete next[k]
      }
      return next
    })
  }, [taskDefs, makeupTaskDefs])

  const streakEligible = useMemo(() => {
    void modalTick
    const records = checkin.getDailyRecords()
    if (Object.keys(records).length === 0) return false
    return checkin.countConsecutiveDaysWithoutCheckin(todayStr) >= 3
  }, [todayStr, modalTick])

  const streakSessionDismissed =
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STREAK_SESSION_KEY)
  const showStreakModal = streakEligible && !streakSessionDismissed

  const allRows = useMemo(() => [...taskDefs, ...makeupTaskDefs], [taskDefs, makeupTaskDefs])

  const toggleTask = (rowKey) => {
    setDone((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }))
  }

  const total = allRows.length
  const completed = allRows.filter((t) => done[t.rowKey]).length
  const allDone = total > 0 && completed === total

  const remainingDays = Math.max(0, activePlan.days - dayIndex + 1)
  const daysDisplay = Number.isNaN(remainingDays) ? days : remainingDays
  const isSprint = todayPlan.isSprintMode

  const todayRecord = checkin.getDailyRecords()[todayStr]

  const handleCheckin = () => {
    if (checkin.getDailyRecords()[todayStr]) return

    const missedSet = new Set()
    const completedSet = new Set()
    for (const row of allRows) {
      const base = row.baseId
      if (done[row.rowKey]) completedSet.add(base)
      else missedSet.add(base)
    }
    const missed = [...missedSet]
    const completedList = [...completedSet]
    const isFull = missed.length === 0

    checkin.saveDailyCheckin(todayStr, {
      completed: completedList,
      missed,
      isFull,
    })

    if (missed.length) {
      checkin.applyMissedCompensation(missed, todayStr)
    }

    if (isFull) {
      const streak = checkin.computeFullCompletionStreak(todayStr)
      setCheckinBanner(d.checkinSuccess.replace('{n}', String(streak)))
    } else {
      setCheckinBanner(d.checkinPartial)
    }
  }

  const handleContinuePlan = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STREAK_SESSION_KEY, '1')
    }
    setModalTick((n) => n + 1)
  }

  const handleResetPlan = () => {
    checkin.clearMakeupAndResetPlan()
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STREAK_SESSION_KEY)
    }
    setModalTick((n) => n + 1)
  }

  const renderTaskCard = (task) => {
    const isDone = done[task.rowKey]
    return (
      <li key={task.rowKey} className="list-none">
        <div
          className={`overflow-hidden rounded-xl border transition ${
            isDone ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => toggleTask(task.rowKey)}
            aria-pressed={isDone}
            className={`flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              isDone ? '' : 'hover:bg-slate-50/80'
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {task.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{task.title}</p>
                {task.isMakeup && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200">
                    {d.makeupTag}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">{task.description}</p>
            </div>
            <span className="pointer-events-none shrink-0" aria-hidden>
              {isDone ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              ) : (
                <span className="block h-10 w-10 rounded-full border-2 border-slate-300 bg-white" />
              )}
            </span>
          </button>
          {!task.isMakeup && task.id === 'vocab' && onStartVocab && (
            <div className="border-t border-slate-200/80 bg-white/60 px-4 py-3">
              <button
                type="button"
                onClick={onStartVocab}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {d.startVocab}
              </button>
            </div>
          )}
          {!task.isMakeup && task.id === 'grammar' && onStartGrammar && (
            <div className="border-t border-slate-200/80 bg-white/60 px-4 py-3">
              <button
                type="button"
                onClick={onStartGrammar}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {d.startGrammar}
              </button>
            </div>
          )}
          {task.isMakeup && task.baseId === 'vocab' && onStartVocab && (
            <div className="border-t border-slate-200/80 bg-white/60 px-4 py-3">
              <button
                type="button"
                onClick={onStartVocab}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {d.startVocab}
              </button>
            </div>
          )}
          {task.isMakeup && task.baseId === 'grammar' && onStartGrammar && (
            <div className="border-t border-slate-200/80 bg-white/60 px-4 py-3">
              <button
                type="button"
                onClick={onStartGrammar}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {d.startGrammar}
              </button>
            </div>
          )}
          {!task.isMakeup && task.id === 'writing' && onStartWriting && (
            <div className="border-t border-slate-200/80 bg-white/60 px-4 py-3">
              <button
                type="button"
                onClick={onStartWriting}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {d.startWriting}
              </button>
            </div>
          )}
          {task.isMakeup && task.baseId === 'writing' && onStartWriting && (
            <div className="border-t border-slate-200/80 bg-white/60 px-4 py-3">
              <button
                type="button"
                onClick={onStartWriting}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                {d.startWriting}
              </button>
            </div>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="min-h-dvh bg-white px-6 py-10 text-slate-900 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0 pt-0.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700"
              >
                {d.backHome}
              </button>
            )}
          </div>
          <LanguageSwitch
            locale={locale}
            setLocale={setLocale}
            zhLabel={h.languageSwitchZh}
            enLabel={h.languageSwitchEn}
          />
        </div>

        {onViewProgress && (
          <button
            type="button"
            onClick={onViewProgress}
            className="mb-6 w-full rounded-xl border border-emerald-200 bg-emerald-50/80 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            {d.viewProgress}
          </button>
        )}

        {isSprint && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold leading-snug text-rose-900">
            {d.sprintBanner}
          </div>
        )}

        <header className="mb-10 rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {d.daysLeft} <span className="text-emerald-600 tabular-nums">{daysDisplay}</span> {d.daysUnit}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {d.currentLevelPrefix}
            <span className="font-medium text-slate-800">{levelDisplay}</span>
          </p>
        </header>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {d.todayTasks}
        </h2>

        <ul className="flex flex-col gap-3">{allRows.map((task) => renderTaskCard(task))}</ul>

        <section className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          {checkinBanner && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-900 ring-1 ring-emerald-100">
              {checkinBanner}
            </p>
          )}
          {!todayRecord && (
            <button
              type="button"
              onClick={handleCheckin}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {d.doneCheckin}
            </button>
          )}
          {todayRecord && !checkinBanner && (
            <p className="text-center text-xs font-medium text-slate-500">{d.alreadyCheckedIn}</p>
          )}
        </section>

        <section className="mt-4 mb-8">
          {allDone ? (
            <p className="text-center text-base font-semibold text-emerald-700">{d.allDone}</p>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">{d.progressLabel}</span>
              <span className="tabular-nums text-base font-semibold text-emerald-700">
                {completed}/{total} {d.progressSuffix}
              </span>
            </div>
          )}
        </section>
      </div>

      {showStreakModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-center text-base font-medium leading-relaxed text-slate-800">
              {d.streakModalBody}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleResetPlan}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                {d.resetPlan}
              </button>
              <button
                type="button"
                onClick={handleContinuePlan}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {d.continuePlan}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
