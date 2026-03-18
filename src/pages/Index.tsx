import { useState, useCallback, useEffect } from 'react';
import { ExamHeader } from '@/components/ExamHeader';
import { PBQSection } from '@/components/PBQSection';
import { MCQSection } from '@/components/MCQSection';
import { ResultsScreen } from '@/components/ResultsScreen';
import { pbqSets, PBQQuestion } from '@/data/pbq';
import { mcqSets, MCQItem } from '@/data/mcq';
import {
  ExamState,
  ExamMode,
  loadState,
  saveState,
  clearState,
  loadMode,
  saveMode,
} from '@/lib/examState';

const Index = () => {
  const [state, setState] = useState<ExamState>(() => {
    const s = loadState();
    s.mode = loadMode();
    return s;
  });

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Get current set questions
  const currentPBQ: PBQQuestion[] = pbqSets.find(s => s.id === state.currentSet)?.questions || pbqSets[0].questions;
  const currentMCQ: MCQItem[] = mcqSets.find(s => s.id === state.currentSet)?.questions || mcqSets[0].questions;

  const setMode = (mode: ExamMode) => {
    saveMode(mode);
    setState((prev) => ({ ...prev, mode }));
  };

  const setCurrentSet = (set: string) => {
    // Reset answers when switching sets
    setState((prev) => ({
      ...prev,
      currentSet: set,
      pbqAnswers: {},
      mcqAnswers: {},
      flagsPBQ: [],
      flagsMCQ: [],
      pbqSubmitted: false,
      mcqSubmitted: false,
      startTime: Date.now(),
    }));
  };

  const handlePBQSubmit = useCallback(() => {
    setState((prev) => ({ ...prev, pbqSubmitted: true }));
  }, []);

  const handleMCQSubmit = useCallback(() => {
    setState((prev) => ({ ...prev, mcqSubmitted: true }));
  }, []);

  const handleReset = () => {
    clearState();
    const fresh = loadState();
    fresh.mode = loadMode();
    fresh.currentSet = state.currentSet;
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
  const allSubmitted = (showPBQ ? state.pbqSubmitted : true) && (showMCQ ? state.mcqSubmitted : true);

  return (
    <div className="min-h-screen flex flex-col">
      <ExamHeader
        mode={state.mode}
        onModeChange={setMode}
        onReset={handleReset}
        submitted={allSubmitted}
        currentSet={state.currentSet}
        onSetChange={setCurrentSet}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        {allSubmitted ? (
          <ResultsScreen
            pbqQuestions={showPBQ ? currentPBQ : []}
            mcqQuestions={showMCQ ? currentMCQ : []}
            pbqAnswers={state.pbqAnswers}
            mcqAnswers={state.mcqAnswers}
          />
        ) : (
          <div className={`grid gap-6 ${state.mode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
            {showPBQ && (
              <section aria-label="Performance-Based Questions">
                <h2 className="text-sm font-mono text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Performance-Based Questions — Set {state.currentSet}
                </h2>
                <PBQSection
                  questions={currentPBQ}
                  answers={state.pbqAnswers}
                  flags={state.flagsPBQ}
                  onAnswer={onPBQAnswer}
                  onToggleFlag={onPBQFlag}
                  submitted={state.pbqSubmitted}
                  onSubmit={handlePBQSubmit}
                />
              </section>
            )}
            {showMCQ && (
              <section aria-label="Multiple-Choice Questions">
                <h2 className="text-sm font-mono text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Multiple-Choice Questions — Set {state.currentSet}
                </h2>
                <MCQSection
                  questions={currentMCQ}
                  answers={state.mcqAnswers}
                  flags={state.flagsMCQ}
                  onAnswer={onMCQAnswer}
                  onToggleFlag={onMCQFlag}
                  submitted={state.mcqSubmitted}
                  onSubmit={handleMCQSubmit}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          Security+ SY0-701 PBQ/MCQ Trainer • 3 question sets (A, B, C) • Switch sets to practice variation
        </p>
      </footer>
    </div>
  );
};

export default Index;
