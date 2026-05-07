import { supabase } from './supabase'

const PLAN_TABLE = 'user_plans'
const CHECKIN_TABLE = 'daily_checkins'
const VOCAB_TABLE = 'vocab_progress'

export async function savePlan(userId, days, level, startDate) {
  if (!userId) return null
  const user_id = userId
  const start_date = startDate
  const payload = { user_id, days, level, start_date }

  const { data: existing, error: findError } = await supabase
    .from(PLAN_TABLE)
    .select('id')
    .eq('user_id', user_id)
    .maybeSingle()
  if (findError) throw findError

  if (existing?.id) {
    const { data, error } = await supabase
      .from(PLAN_TABLE)
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase.from(PLAN_TABLE).insert(payload).select().single()
  if (error) throw error
  return data
}

export async function getPlan(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from(PLAN_TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function deletePlan(userId) {
  if (!userId) return null
  const { error } = await supabase.from(PLAN_TABLE).delete().eq('user_id', userId)
  if (error) throw error
  return true
}

export async function saveCheckin(userId, date, completedTasks, vocabCount, isComplete) {
  if (!userId) return null
  const payload = {
    user_id: userId,
    date,
    completed_tasks: completedTasks,
    vocab_count: vocabCount,
    is_complete: isComplete,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from(CHECKIN_TABLE)
    .upsert(payload, { onConflict: 'user_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCheckins(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from(CHECKIN_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function saveVocabProgress(userId, vocabIndex, masteredIds) {
  if (!userId) return null
  const payload = {
    user_id: userId,
    vocab_index: vocabIndex,
    mastered_ids: masteredIds,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from(VOCAB_TABLE)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getVocabProgress(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from(VOCAB_TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}
export async function getWordReviews(userId) {
  const { data, error } = await supabase
    .from('word_reviews')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export async function upsertWordReview(userId, wordId, fields) {
  const { error } = await supabase
    .from('word_reviews')
    .upsert(
      { user_id: userId, word_id: String(wordId), ...fields },
      { onConflict: 'user_id,word_id' }
    )
  if (error) throw error
}

export async function getTodayReviewCount(userId) {
  if (!userId) return 0
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('word_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('reviewed_at', startOfToday.toISOString())
  if (error) throw error
  return count ?? 0
}

export async function getMatureWordCount(userId) {
  if (!userId) return 0
  const { count, error } = await supabase
    .from('word_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('state', 2)
  if (error) throw error
  return count ?? 0
}