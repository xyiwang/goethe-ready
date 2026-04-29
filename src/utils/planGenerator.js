export const PLAN_STORAGE_KEY = 'goethe-ready-study-plan'

const DAY_MS = 24 * 60 * 60 * 1000

const LEVEL_CONFIGS = {
  beginner: {
    vocabStart: 1,
    totalVocab: 2800,
    grammarStart: 1,
    totalGrammar: 20,
  },
  a1a2: {
    vocabStart: 500,
    totalVocab: 2300,
    grammarStart: 8,
    totalGrammar: 12,
  },
  b1: {
    vocabStart: 1,
    totalVocab: 800,
    grammarStart: 1,
    totalGrammar: 8,
    grammarMode: 'past-papers',
  },
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function normalizeDays(days) {
  const n = parseInt(String(days).trim(), 10)
  return Number.isNaN(n) || n <= 0 ? 1 : n
}

function normalizeLevel(level) {
  if (level === 'beginner' || level === '零基础' || level === 'Complete beginner') {
    return 'beginner'
  }
  if (level === 'a1a2' || level === '已过A1/A2' || level === 'Finished A1 / A2') {
    return 'a1a2'
  }
  if (level === 'b1' || level === 'B1冲高分' || level === 'B1 — aiming high') {
    return 'b1'
  }
  return 'beginner'
}

export function todayYmd(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDayIndex(startDate, today = new Date()) {
  const start = new Date(`${startDate}T12:00:00`)
  const now = new Date(today)
  now.setHours(12, 0, 0, 0)
  const diff = Math.floor((now.getTime() - start.getTime()) / DAY_MS)
  return Math.max(1, diff + 1)
}

export function generatePlan(days, level) {
  const normalizedDays = normalizeDays(days)
  const levelKey = normalizeLevel(level)
  const config = LEVEL_CONFIGS[levelKey]

  const dailyVocab = clamp(Math.ceil(config.totalVocab / normalizedDays), 10, 40)
  const grammarInterval = Math.max(1, Math.floor(normalizedDays / config.totalGrammar))
  const listeningInterval = Math.max(1, Math.floor(normalizedDays / 30))

  return {
    days: normalizedDays,
    level: levelKey,
    vocabStart: config.vocabStart,
    totalVocab: config.totalVocab,
    grammarStart: config.grammarStart,
    totalGrammar: config.totalGrammar,
    grammarMode: config.grammarMode ?? 'new-points',
    dailyVocab,
    grammarInterval,
    listeningInterval,
    writingDays: [1, 3, 5],
    sprintMode: normalizedDays <= 7,
    startDayOfWeek: new Date().getDay(),
  }
}

export function getTodayTasks(plan, dayIndex) {
  const safeDayIndex = Math.max(1, parseInt(String(dayIndex), 10) || 1)
  const remainingDays = Math.max(0, plan.days - safeDayIndex + 1)

  const grammarSlot = Math.floor((safeDayIndex - 1) / plan.grammarInterval) + 1
  const listeningSlot = Math.floor((safeDayIndex - 1) / plan.listeningInterval) + 1
  const weekday = (plan.startDayOfWeek + safeDayIndex - 1) % 7

  return {
    todayVocab: plan.dailyVocab,
    todayGrammar:
      (safeDayIndex - 1) % plan.grammarInterval === 0 && grammarSlot <= plan.totalGrammar,
    todayListening: (safeDayIndex - 1) % plan.listeningInterval === 0 && listeningSlot <= 30,
    todayWriting: plan.writingDays.includes(weekday),
    isSprintMode: plan.sprintMode || remainingDays <= 7,
  }
}
