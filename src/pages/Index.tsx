import { useState, useCallback, useEffect } from 'react';
import { ExamHeader } from '@/components/ExamHeader';
import { PBQSection } from '@/components/PBQSection';
import { MCQSection, MCQItem } from '@/components/MCQSection';
import { ResultsScreen } from '@/components/ResultsScreen';
import { useTimer } from '@/hooks/useTimer';
import { pbqQuestions } from '@/data/pbq';
import mcqData from '@/data/mcq.json';
import {
  ExamState,
  ExamMode,
  loadState,
  saveState,
  clearState,
  loadMode,
  saveMode,
} from '@/lib/examState';
import { useToast } from '@/hooks/use-toast';

const mcqQuestions: MCQItem[] = mcqData as MCQItem[];

const EXAM_DURATION_MINUTES = 30;

const Index = () => {
  const { toast } = useToast();
  const [state, setState] = useState<ExamState>(() => {
    const s = loadState();
    s.mode = loadMode();
    return s;
  });

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleExpire = useCallback(() => {
    setState((prev) => ({ ...prev, submitted: true }));
    toast({ title: 'Time\'s up!', description: 'Your exam has been automatically submitted.' });
  }, [toast]);

  const { display, isWarning, isCritical } = useTimer({
    durationMinutes: EXAM_DURATION_MINUTES,
    startTime: state.startTime,
    onExpire: handleExpire,
    paused: state.submitted,
  });

  const setMode = (mode: ExamMode) => {
    saveMode(mode);
    setState((prev) => ({ ...prev, mode }));
  };

  const handleSubmit = () => {
    setState((prev) => ({ ...prev, submitted: true }));
  };

  const handleReset = () => {
    clearState();
    const fresh = loadState();
    fresh.mode = loadMode();
    setState(fresh);
  };

  // PBQ handlers
  const onPBQAnswer = (qId: string, answer: any) => {
    setState((prev) => ({ ...prev, pbqAnswers: { ...prev.pbqAnswers, [qId]: answer } }));
  };

  const onPBQFlag = (qId: string) => {
    setState((prev) => ({
      ...prev,
      flagsPBQ: prev.flagsPBQ.includes(qId)
        ? prev.flagsPBQ.filter((f) => f !== qId)
        : [...prev.flagsPBQ, qId],
    }));
  };

  // MCQ handlers
  const onMCQAnswer = (qId: string, answer: number | number[]) => {
    setState((prev) => ({ ...prev, mcqAnswers: { ...prev.mcqAnswers, [qId]: answer } }));
  };

  const onMCQFlag = (qId: string) => {
    setState((prev) => ({
      ...prev,
      flagsMCQ: prev.flagsMCQ.includes(qId)
        ? prev.flagsMCQ.filter((f) => f !== qId)
        : [...prev.flagsMCQ, qId],
    }));
  };

  const showPBQ = state.mode === 'pbq' || state.mode === 'both';
  const showMCQ = state.mode === 'mcq' || state.mode === 'both';

  return (
    <div className="min-h-screen flex flex-col">
      <ExamHeader
        timerDisplay={display}
        isWarning={isWarning}
        isCritical={isCritical}
        mode={state.mode}
        onModeChange={setMode}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitted={state.submitted}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        {state.submitted ? (
          <ResultsScreen
            pbqQuestions={pbqQuestions}
            mcqQuestions={mcqQuestions}
            pbqAnswers={state.pbqAnswers}
            mcqAnswers={state.mcqAnswers}
            startTime={state.startTime}
          />
        ) : (
          <div className={`grid gap-6 ${state.mode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
            {showPBQ && (
              <section aria-label="Performance-Based Questions">
                <h2 className="text-sm font-mono text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Performance-Based Questions
                </h2>
                <PBQSection
                  questions={pbqQuestions}
                  answers={state.pbqAnswers}
                  flags={state.flagsPBQ}
                  onAnswer={onPBQAnswer}
                  onToggleFlag={onPBQFlag}
                  submitted={state.submitted}
                />
              </section>
            )}
            {showMCQ && (
              <section aria-label="Multiple-Choice Questions">
                <h2 className="text-sm font-mono text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Multiple-Choice Questions
                </h2>
                <MCQSection
                  questions={mcqQuestions}
                  answers={state.mcqAnswers}
                  flags={state.flagsMCQ}
                  onAnswer={onMCQAnswer}
                  onToggleFlag={onMCQFlag}
                  submitted={state.submitted}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          Security+ SY0-701 PBQ/MCQ Trainer • Replace <code className="text-primary">src/data/mcq.json</code> & <code className="text-primary">src/data/pbq.ts</code> with your own questions
        </p>
      </footer>
    </div>
  );
};

export default Index;
