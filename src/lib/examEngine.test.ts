import { describe, it, expect } from 'vitest';
import { isMCQCorrect, calculateScore } from '@/lib/examEngine';
import type { MCQuestion, PBQuestion } from '@/data/questions';

const single: MCQuestion = {
  id: 'm1', domain: 'D1', type: 'single', difficulty: 1,
  question: 'q', options: ['a','b','c','d'], answer: 2, explanation: '',
};
const multi: MCQuestion = {
  id: 'm2', domain: 'D2', type: 'select-two', difficulty: 1,
  question: 'q', options: ['a','b','c','d'], answer: [0, 3], explanation: '',
};

describe('examEngine', () => {
  it('scores single correctly', () => {
    expect(isMCQCorrect(single, 2)).toBe(true);
    expect(isMCQCorrect(single, 1)).toBe(false);
    expect(isMCQCorrect(single, undefined)).toBe(false);
  });

  it('scores select-two regardless of order', () => {
    expect(isMCQCorrect(multi, [3, 0])).toBe(true);
    expect(isMCQCorrect(multi, [0, 1])).toBe(false);
  });

  it('calculates scaled score on 100-900 scale', () => {
    const r = calculateScore(
      [] as PBQuestion[],
      [single, multi],
      {},
      { m1: 2, m2: [0, 3] },
      Date.now(),
    );
    expect(r.rawCorrect).toBe(2);
    expect(r.rawTotal).toBe(2);
    expect(r.scaledScore).toBe(900);
    expect(r.passed).toBe(true);
  });

  it('fails when below scaled 750', () => {
    const r = calculateScore([] as PBQuestion[], [single, multi], {}, { m1: 2 }, Date.now());
    expect(r.scaledScore).toBeLessThan(750);
    expect(r.passed).toBe(false);
  });
});
