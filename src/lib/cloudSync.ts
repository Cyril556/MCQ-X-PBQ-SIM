/**
 * Cloud sync layer.
 * - Mirrors local exam attempts and question stats to Supabase via the
 *   device-scoped client.
 * - Subscribes to realtime changes so multiple tabs / devices using the same
 *   anonymous device-id stay in sync.
 *
 * This is fire-and-forget: localStorage remains the source of truth offline,
 * the cloud is the canonical store when online.
 */
import { cloud, deviceId } from '@/integrations/supabase/deviceClient';
import type { ExamAttempt, QuestionStats } from '@/lib/examHistory';
import { toast } from 'sonner';

export async function pushExamAttempt(a: ExamAttempt): Promise<void> {
  try {
    const scaled = Math.round(100 + (a.percentage / 100) * 800);
    const { error } = await cloud.from('exam_attempts').insert({
      device_id: deviceId,
      mode: a.mode,
      exam_number: a.examId ? Number(a.examId) || null : null,
      score_total: a.totalQuestions,
      score_raw: a.correctAnswers,
      score_scaled: scaled,
      passed: a.passed,
      duration_seconds: Math.round((a.endTime - a.startTime) / 1000),
      domain_breakdown: a.domainScores as never,
      question_results: a.questions as never,
      confidence_summary: {} as never,
    });
  } catch (e) {
    console.warn('[cloudSync] pushExamAttempt failed', e);
  }
}

export async function upsertQuestionStat(s: QuestionStats): Promise<void> {
  try {
    await cloud.from('question_stats').upsert(
      {
        device_id: deviceId,
        question_id: s.questionId,
        question_type: s.type,
        domain: s.domain,
        times_attempted: s.timesAttempted,
        times_correct: s.timesCorrect,
        times_failed: s.timesFailed,
        last_result: s.streak > 0 ? 'correct' : s.streak < 0 ? 'wrong' : null,
        last_attempted_at: new Date(s.lastAttempt).toISOString(),
      },
      { onConflict: 'device_id,question_id' }
    );
  } catch (e) {
    console.warn('[cloudSync] upsertQuestionStat failed', e);
  }
}

export async function fetchAttempts() {
  const { data, error } = await cloud
    .from('exam_attempts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function fetchStats() {
  const { data, error } = await cloud.from('question_stats').select('*');
  if (error) throw error;
  return data ?? [];
}

export function subscribeAttempts(onChange: () => void) {
  const channel = cloud
    .channel('exam_attempts:' + deviceId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'exam_attempts' },
      onChange
    )
    .subscribe();
  return () => {
    cloud.removeChannel(channel);
  };
}

export function subscribeStats(onChange: () => void) {
  const channel = cloud
    .channel('question_stats:' + deviceId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'question_stats' },
      onChange
    )
    .subscribe();
  return () => {
    cloud.removeChannel(channel);
  };
}
