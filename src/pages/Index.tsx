import { useState, useCallback, useEffect, useMemo } from 'react';
import { ExamHeader } from '@/components/ExamHeader';
import { PBQSection } from '@/components/PBQSection';
import { MCQSection } from '@/components/MCQSection';
import { IntegratedExam } from '@/components/IntegratedExam';
import { ReviewMode } from '@/components/ReviewMode';
import { ReadinessDashboard } from '@/components/ReadinessDashboard';
import { Dashboard } from '@/components/Dashboard';
import { pbqSets, PBQQuestion } from '@/data/pbq';
import { mcqSets, MCQItem } from '@/data/mcq';
import { buildFullExams, type FullExam } from '@/lib/fullExams';
import { saveAttempt, type QuestionAttempt, type ExamAttempt } from '@/lib/examHistory';
import {
  ExamState,
  ExamMode,
  AppView,
  loadState,
  saveState,
  clearState,
  loadMode,
  saveMode,
} from '@/lib/examState';

const Index = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [activeExam, setActiveExam] = useState<FullExam | null>(null);
  const [state, setState] = useState<ExamState>(() => {
    const s = loadState();
    s.mode = loadMode();
    return s;
  });
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const allPBQ: PBQQuestion[] = pbqSets.find(s => s.id === state.currentSet)?.questions || [];
  const allMCQ: MCQItem[] = mcqSets.find(s => s.id === state.currentSet)?.questions || [];

  const currentPBQ = useMemo(() => {
    if (selectedDomains.length === 0) return allPBQ;
    return allPBQ.filter(q => selectedDomains.includes(q.domain));
  }, [allPBQ, selectedDomains]);

  const currentMCQ = useMemo(() => {
    if (selectedDomains.length === 0) return allMCQ;
    return allMCQ.filter(q => selectedDomains.includes(q.domain));
  }, [allMCQ, selectedDomains]);

  const setMode = (mode: ExamMode) => {
    saveMode(mode);
    setState(prev => ({ ...prev, mode }));
  };

  const setCurrentSet = (set: string) => {
    setState(prev => ({
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
    setState(prev => ({ ...prev, pbqSubmitted: true }));
  }, []);

  const handleMCQSubmit = useCallback(() => {
    setState(prev => ({ ...prev, mcqSubmitted: true }));
  }, []);

  const handleReset = () => {
    clearState();
    const fresh = loadState();
    fresh.mode = loadMode();
    fresh.currentSet = state.currentSet;
    setState(fresh);
    setSelectedDomains([]);
  };

  const onPBQAnswer = (qId: string, answer: any) => {
    setState(prev => ({ ...prev, pbqAnswers: { ...prev.pbqAnswers, [qId]: answer } }));
  };

  const onPBQFlag = (qId: string) => {
    setState(prev => ({
      ...prev,
      flagsPBQ: prev.flagsPBQ.includes(qId) ? prev.flagsPBQ.filter(f => f !== qId) : [...prev.flagsPBQ, qId],
    }));
  };

  const onMCQAnswer = (qId: string, answer: number | number[]) => {
    setState(prev => ({ ...prev, mcqAnswers: { ...prev.mcqAnswers, [qId]: answer } }));
  };

  const onMCQFlag = (qId: string) => {
    setState(prev => ({
      ...prev,
      flagsMCQ: prev.flagsMCQ.includes(qId) ? prev.flagsMCQ.filter(f => f !== qId) : [...prev.flagsMCQ, qId],
    }));
  };

  const startFullExam = (examIndex: number) => {
    const exams = buildFullExams();
    setActiveExam(exams[examIndex]);
    setView('exam');
  };

  const showPBQ = state.mode === 'pbq' || state.mode === 'both';
  const showMCQ = state.mode === 'mcq' || state.mode === 'both';

  // Full exam view
  if (view === 'exam' && activeExam) {
    return (
      <IntegratedExam
        examId={activeExam.id}
        examLabel={activeExam.label}
        pbqQuestions={activeExam.pbqQuestions}
        mcqQuestions={activeExam.mcqQuestions}
        durationMinutes={activeExam.durationMinutes}
        onFinish={() => { setActiveExam(null); setView('dashboard'); }}
      />
    );
  }

  // Review mode
  if (view === 'review') {
    return <ReviewMode onBack={() => setView('dashboard')} />;
  }

  // Readiness dashboard
  if (view === 'readiness') {
    return <ReadinessDashboard onBack={() => setView('dashboard')} />;
  }

  // Dashboard
  if (view === 'dashboard') {
    return <Dashboard
      onStartPractice={() => setView('practice')}
      onStartExam={startFullExam}
      onOpenReview={() => setView('review')}
      onOpenReadiness={() => setView('readiness')}
    />;
  }

  // Practice mode
  return (
    <div className="min-h-screen flex flex-col">
      <ExamHeader
        mode={state.mode}
        onModeChange={setMode}
        onReset={handleReset}
        submitted={false}
        currentSet={state.currentSet}
        onSetChange={setCurrentSet}
        selectedDomains={selectedDomains}
        onDomainsChange={setSelectedDomains}
        onBackToDashboard={() => setView('dashboard')}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        {state.mode === 'both' ? (
          /* Integrated mode: PBQ then MCQ in single column */
          <div className="max-w-3xl mx-auto space-y-8">
            {currentPBQ.length > 0 && (
              <section aria-label="Performance-Based Questions">
                <h2 className="text-sm font-mono text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  PBQ — Set {state.currentSet}
                  {selectedDomains.length > 0 && <span className="text-muted-foreground text-[10px] normal-case">({currentPBQ.length} filtered)</span>}
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
            {currentMCQ.length > 0 && (
              <section aria-label="Multiple-Choice Questions">
                <h2 className="text-sm font-mono text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  MCQ — Set {state.currentSet}
                  {selectedDomains.length > 0 && <span className="text-muted-foreground text-[10px] normal-case">({currentMCQ.length} filtered)</span>}
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
        ) : (
          <div className="max-w-3xl mx-auto">
            {showPBQ && currentPBQ.length > 0 && (
              <section aria-label="Performance-Based Questions">
                <h2 className="text-sm font-mono text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  PBQ — Set {state.currentSet}
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
            {showMCQ && currentMCQ.length > 0 && (
              <section aria-label="Multiple-Choice Questions">
                <h2 className="text-sm font-mono text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  MCQ — Set {state.currentSet}
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
            {((showPBQ && currentPBQ.length === 0) || (showMCQ && currentMCQ.length === 0)) && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-mono text-sm">No questions available for Set {state.currentSet} with current filters.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          Security+ SY0-701 Trainer • {pbqSets.length} PBQ sets • {mcqSets.length} MCQ sets
        </p>
      </footer>
    </div>
  );
};

export default Index;
