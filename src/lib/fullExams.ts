/**
 * Full Exam Configurations
 * Two full-length practice exams mimicking the real Security+ SY0-701.
 * Real exam: up to 90 questions, 90 minutes, ~5 PBQ + ~80 MCQ
 */

import { pbqSets, type PBQQuestion } from '@/data/pbq';
import { mcqSets, type MCQItem } from '@/data/mcq';

export interface FullExam {
  id: string;
  label: string;
  description: string;
  pbqQuestions: PBQQuestion[];
  mcqQuestions: MCQItem[];
  totalQuestions: number;
  durationMinutes: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function buildFullExams(): FullExam[] {
  // Exam 1: PBQ from sets A,B,C + MCQ from sets A,B,C
  const pbqPool1 = [...(pbqSets.find(s => s.id === 'A')?.questions || []),
                     ...(pbqSets.find(s => s.id === 'B')?.questions || []),
                     ...(pbqSets.find(s => s.id === 'C')?.questions || [])];
  const mcqPool1 = [...(mcqSets.find(s => s.id === 'A')?.questions || []),
                     ...(mcqSets.find(s => s.id === 'B')?.questions || []),
                     ...(mcqSets.find(s => s.id === 'C')?.questions || [])];

  // Exam 2: PBQ from sets D,E,F + MCQ from sets D,E
  const pbqPool2 = [...(pbqSets.find(s => s.id === 'D')?.questions || []),
                     ...(pbqSets.find(s => s.id === 'E')?.questions || []),
                     ...(pbqSets.find(s => s.id === 'F')?.questions || [])];
  const mcqPool2 = [...(mcqSets.find(s => s.id === 'D')?.questions || []),
                     ...(mcqSets.find(s => s.id === 'E')?.questions || [])];

  const exam1Pbq = pickN(pbqPool1, 5);
  const exam1Mcq = pickN(mcqPool1, 80);
  const exam2Pbq = pickN(pbqPool2, 5);
  const exam2Mcq = pickN(mcqPool2, Math.min(80, mcqPool2.length));

  return [
    {
      id: 'exam-1',
      label: 'Practice Exam 1',
      description: 'Full-length practice exam: 5 PBQ + 80 MCQ from Sets A–C. 90 minutes.',
      pbqQuestions: exam1Pbq,
      mcqQuestions: exam1Mcq,
      totalQuestions: exam1Pbq.length + exam1Mcq.length,
      durationMinutes: 90,
    },
    {
      id: 'exam-2',
      label: 'Practice Exam 2',
      description: 'Full-length practice exam: 5 PBQ + MCQ from Sets D–F. 90 minutes.',
      pbqQuestions: exam2Pbq,
      mcqQuestions: exam2Mcq,
      totalQuestions: exam2Pbq.length + exam2Mcq.length,
      durationMinutes: 90,
    },
  ];
}
