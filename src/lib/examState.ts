export type ExamMode = 'pbq' | 'mcq' | 'both';
export type AppView = 'dashboard' | 'practice' | 'exam' | 'review' | 'readiness';

export interface ExamState {
  pbqAnswers: Record<string, any>;
  mcqAnswers: Record<string, number | number[]>;
  flagsPBQ: string[];
  flagsMCQ: string[];
  startTime: number;
  mode: ExamMode;
  currentSet: string;
  pbqSubmitted: boolean;
  mcqSubmitted: boolean;
}

const STORAGE_KEY = 'secplus-exam-state';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function createFreshState(): ExamState {
  return {
    pbqAnswers: {},
    mcqAnswers: {},
    flagsPBQ: [],
    flagsMCQ: [],
    startTime: Date.now(),
    mode: 'both',
    currentSet: 'A',
    pbqSubmitted: false,
    mcqSubmitted: false,
  };
}

export function loadState(): ExamState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshState();
    const state: ExamState = JSON.parse(raw);
    if (Date.now() - state.startTime > MAX_AGE_MS) return createFreshState();
    return state;
  } catch {
    return createFreshState();
  }
}

export function saveState(state: ExamState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function loadMode(): ExamMode {
  return (localStorage.getItem('secplus-mode') as ExamMode) || 'both';
}

export function saveMode(mode: ExamMode): void {
  localStorage.setItem('secplus-mode', mode);
}
