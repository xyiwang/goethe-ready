const RECORDS_KEY = 'goethe-ready-daily-records'
const MAKEUP_KEY = 'goethe-ready-makeup-by-date'
const PLAN_MODE_KEY = 'goethe-ready-plan-mode'

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function ymd(d) {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`
}

export function addDaysToYmd(dateStr, deltaDays) {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + deltaDays)
  return ymd(d)
}

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures
  }
}

/** @typedef {{ completed: string[]; missed: string[]; isFull?: boolean }} DailyRecord */

/** @returns {Record<string, DailyRecord>} */
export function getDailyRecords() {
  return readJson(RECORDS_KEY, {})
}

/** @param {Record<string, DailyRecord>} map */
export function setDailyRecords(map) {
  writeJson(RECORDS_KEY, map)
}

/**
 * @param {string} dateStr
 * @param {{ completed: string[]; missed: string[]; isFull: boolean }} payload
 */
export function saveDailyCheckin(dateStr, payload) {
  const all = getDailyRecords()
  all[dateStr] = {
    date: dateStr,
    completed: payload.completed,
    missed: payload.missed,
    isFull: payload.isFull,
  }
  setDailyRecords(all)
}

/** 周一、三、五有写作任务 */
export function baseTaskCountForDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  const day = d.getDay()
  const writing = day === 1 || day === 3 || day === 5
  return writing ? 4 : 3
}

/** @returns {Record<string, string[]>} date -> 补课任务 id 列表 */
export function getMakeupByDate() {
  return readJson(MAKEUP_KEY, {})
}

export function setMakeupByDate(map) {
  writeJson(MAKEUP_KEY, map)
}

/**
 * 将未完成任务均分到未来 3 天；每天补课不超过当日原计划的 50%（向下取整）
 * @param {string[]} missedBaseTaskIds 如 ['listening','vocab']
 * @param {string} fromDateStr 今天 YYYY-MM-DD
 */
export function applyMissedCompensation(missedBaseTaskIds, fromDateStr) {
  if (!missedBaseTaskIds.length) return

  const makeup = { ...getMakeupByDate() }
  const targetStrs = [1, 2, 3].map((d) => addDaysToYmd(fromDateStr, d))

  /** @type {string[][]} */
  const buckets = [[], [], []]
  missedBaseTaskIds.forEach((id, i) => {
    buckets[i % 3].push(id)
  })

  const capFor = (dateStr) => Math.floor(baseTaskCountForDate(dateStr) * 0.5)

  /** 均分顺序：D+1 的第1个、D+2 的第1个、D+3 的第1个，再接 D+1 的第2个… */
  const merged = []
  const maxLen = Math.max(buckets[0].length, buckets[1].length, buckets[2].length)
  for (let i = 0; i < maxLen; i++) {
    for (let j = 0; j < 3; j++) {
      if (buckets[j][i]) merged.push(buckets[j][i])
    }
  }

  let queue = merged
  let guard = 0
  while (queue.length && guard < 60) {
    guard += 1
    let placed = false
    for (let ti = 0; ti < 3 && queue.length; ti++) {
      const key = targetStrs[ti]
      const cap = capFor(key)
      const cur = [...(makeup[key] || [])]
      if (cur.length < cap) {
        const next = queue.shift()
        makeup[key] = [...cur, next]
        placed = true
      }
    }
    if (!placed) break
  }

  setMakeupByDate(makeup)
}

/**
 * 从今天往回数：连续「当日全完成打卡」的天数（仅计 isFull；含今天）
 * @param {string} todayStr
 */
export function computeFullCompletionStreak(todayStr) {
  const records = getDailyRecords()
  let streak = 0
  let cur = todayStr
  for (let i = 0; i < 400; i++) {
    const rec = records[cur]
    if (!rec || rec.isFull !== true) break
    streak += 1
    cur = addDaysToYmd(cur, -1)
  }
  return streak
}

/**
 * 从今天起连续多少天没有任何打卡记录（含今天未打卡）
 * @param {string} todayStr
 */
export function countConsecutiveDaysWithoutCheckin(todayStr) {
  const records = getDailyRecords()
  let n = 0
  let cur = todayStr
  for (let i = 0; i < 400; i++) {
    if (records[cur]) break
    n += 1
    cur = addDaysToYmd(cur, -1)
  }
  return n
}

export function clearMakeupAndResetPlan() {
  setMakeupByDate({})
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PLAN_MODE_KEY, 'reduced')
    } catch {
      // ignore storage failures
    }
  }
}
