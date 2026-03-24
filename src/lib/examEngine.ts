/**
 * Exam Engine — scoring, state management, and utilities
 */

import type { MCQuestion, PBQuestion, Domain } from '@/data/questions';
import { DOMAIN_LABELS } from '@/data/questions';

export interface ExamState {
  mcqAnswers: Record<string, number | number[]>;
  pbqAnswers: Record<string, any>;
  flags: Set<string>;
  currentIndex: number;
  submitted: boolean;
  startTime: number;
  questionTimes: Record<string, number>;
}

export function createExamState(): ExamState {
  return {
    mcqAnswers: {},
    pbqAnswers: {},
    flags: new Set(),
    currentIndex: 0,
    submitted: false,
    startTime: Date.now(),
    questionTimes: {},
  };
}

export function isMCQCorrect(q: MCQuestion, ans: number | number[] | undefined): boolean {
  if (ans === undefined) return false;
  if (q.type === 'single') return ans === q.answer;
  const sel = [...(ans as number[])].sort();
  const cor = [...(q.answer as number[])].sort();
  return JSON.stringify(sel) === JSON.stringify(cor);
}

export function isPBQCorrect(q: PBQuestion, ans: any): boolean {
  if (!ans) return false;
  switch (q.type) {
    case 'firewall':
      return q.correctActions.every((a, i) => (ans as string[])?.[i] === a);
    case 'ordering':
      return q.steps.every(s => (ans as string[])?.[s.correctPosition] === s.label);
    case 'log-analysis': {
      const a = ans as { attackType?: string; sourceIP?: string; response?: number };
      return a.attackType === q.correctAttackType && a.sourceIP === q.correctSourceIP && a.response === q.correctResponse;
    }
    case 'matching':
      return q.items.every(it => ans?.[it.left] === it.correctRight);
    case 'placement':
      return q.items.every(it => ans?.[it.label] === it.correctZone);
    default:
      return false;
  }
}

export interface ScoreResult {
  rawCorrect: number;
  rawTotal: number;
  scaledScore: number;
  passed: boolean;
  domainScores: Record<string, { correct: number; total: number; percentage: number }>;
  timeUsedMinutes: number;
}

export function calculateScore(
  pbqs: PBQuestion[],
  mcqs: MCQuestion[],
  pbqAnswers: Record<string, any>,
  mcqAnswers: Record<string, number | number[]>,
  startTime: number,
): ScoreResult {
  let rawCorrect = 0;
  const rawTotal = pbqs.length + mcqs.length;
  const domainScores: Record<string, { correct: number; total: number; percentage: number }> = {};

  // Initialize all domains
  Object.values(DOMAIN_LABELS).forEach(label => {
    domainScores[label] = { correct: 0, total: 0, percentage: 0 };
  });

  // Score PBQs
  pbqs.forEach(q => {
    const domainLabel = DOMAIN_LABELS[q.domain];
    domainScores[domainLabel].total++;
    if (isPBQCorrect(q, pbqAnswers[q.id])) {
      rawCorrect++;
      domainScores[domainLabel].correct++;
    }
  });

  // Score MCQs
  mcqs.forEach(q => {
    const domainLabel = DOMAIN_LABELS[q.domain];
    domainScores[domainLabel].total++;
    if (isMCQCorrect(q, mcqAnswers[q.id])) {
      rawCorrect++;
      domainScores[domainLabel].correct++;
    }
  });

  // Calculate percentages
  Object.values(domainScores).forEach(d => {
    d.percentage = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
  });

  // Scaled score: (raw/total) × 900, rounded to nearest 10
  const scaledScore = Math.round(((rawCorrect / rawTotal) * 900) / 10) * 10;
  const timeUsedMinutes = Math.round((Date.now() - startTime) / 60000);

  return {
    rawCorrect,
    rawTotal,
    scaledScore,
    passed: scaledScore >= 750,
    domainScores,
    timeUsedMinutes,
  };
}
