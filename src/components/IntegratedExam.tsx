import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { PBQQuestion } from '@/data/pbq';
import { LogicCheck, type LogicCheckQuestion } from '@/components/LogicCheck';
import { MCQItem } from '@/data/mcq';
import { FeedbackDialog, FeedbackItem } from '@/components/FeedbackDialog';
import { ExamTimer, QuestionStopwatch } from '@/components/ExamTimer';
import { saveAttempt, type QuestionAttempt, type ExamAttempt } from '@/lib/examHistory';
import { Flag, CheckCircle2, XCircle, GripVertical, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';

type UnifiedQuestion =
  | { kind: 'pbq'; data: PBQQuestion }
  | { kind: 'mcq'; data: MCQItem };

interface IntegratedExamProps {
  examId: string;
  examLabel: string;
  pbqQuestions: PBQQuestion[];
  mcqQuestions: MCQItem[];
  durationMinutes: number;
  onFinish: () => void;
}

function isPBQCorrect(q: PBQQuestion, ans: any): boolean {
  if (!ans) return false;
  if (q.type === 'firewall' && q.correctActions) return (ans as string[]).every((a: string, i: number) => a === q.correctActions![i]);
  if (q.type === 'matching' && q.matchingItems) return q.matchingItems.every(it => ans[it.source] === it.target);
  if (q.type === 'classification' && q.classificationItems) return q.classificationItems.every(it => ans[it.item] === it.category);
  if (q.type === 'placement' && q.placementItems) return q.placementItems.every(it => ans[it.item] === it.correctZone);
  if (q.type === 'ordering' && q.orderItems) return q.orderItems.every(it => (ans as string[])[it.correctPosition] === it.step);
  return false;
}

function isMCQCorrect(q: MCQItem, ans: number | number[] | undefined): boolean {
  if (ans === undefined) return false;
  if (q.type === 'single') return ans === q.answer;
  const sel = [...(ans as number[])].sort();
  const cor = [...(q.answer as number[])].sort();
  return JSON.stringify(sel) === JSON.stringify(cor);
}

export function IntegratedExam({ examId, examLabel, pbqQuestions, mcqQuestions, durationMinutes, onFinish }: IntegratedExamProps) {
    // Randomly interleave PBQs throughout MCQs (realistic exam behavior)
  const questions = useMemo<UnifiedQuestion[]>(() => {
    const pbqList = pbqQuestions.map(q => ({ kind: 'pbq' as const, data: q }));
    const mcqList = mcqQuestions.map(q => ({ kind: 'mcq' as const, data: q }));
    const combined: UnifiedQuestion[] = [...mcqList];
    
    // Insert PBQs at random positions throughout the exam
    pbqList.forEach(pbq => {
      const randomIndex = Math.floor(Math.random() * (combined.length + 1));
      combined.splice(randomIndex, 0, pbq);
    });
    
    return combined;
  }, [pbqQuestions, mcqQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pbqAnswers, setPbqAnswers] = useState<Record<string, any>>({});
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number | number[]>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLogicCheck, setShowLogicCheck] = useState(false);
  const [logicCheckQuestions, setLogicCheckQuestions] = useState<LogicCheckQuestion[]>([]);
  const [showNav, setShowNav] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<Record<string, number>>({});

  const handleTimeUpdate = useCallback((qId: string, seconds: number) => {
    setQuestionTimes(prev => ({ ...prev, [qId]: (prev[qId] || 0) + seconds }));
  }, []);

  const current = questions[currentIndex];
  const qId = current.kind === 'pbq' ? current.data.id : current.data.id;

  const toggleFlag = () => {
    setFlags(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId); else next.add(qId);
      return next;
    });
  };

  const getAnsweredCount = () => {
    let count = 0;
    questions.forEach(q => {
      if (q.kind === 'pbq') {
        const ans = pbqAnswers[q.data.id];
        if (ans && (Array.isArray(ans) ? ans.some(a => a !== '') : Object.keys(ans).length > 0)) count++;
      } else {
        if (mcqAnswers[q.data.id] !== undefined) count++;
      }
    });
    return count;
  };

  const handleSubmit = () => {
    // Save time for current question
    handleTimeUpdate(qId, 0);
    setSubmitted(true);
    setShowFeedback(true);

    // Build attempt record
    const attemptQuestions: QuestionAttempt[] = questions.map(q => {
      if (q.kind === 'pbq') {
        const ans = pbqAnswers[q.data.id];
        const correct = isPBQCorrect(q.data, ans);
        return {
          questionId: q.data.id,
          questionText: q.data.title,
          domain: q.data.domain,
          type: 'pbq' as const,
          isCorrect: correct,
          userAnswer: ans ? JSON.stringify(ans) : 'Not answered',
          correctAnswer: '',
          explanation: q.data.explanation || '',
          timeSpentSeconds: questionTimes[q.data.id] || 0,
          timestamp: Date.now(),
        };
      } else {
        const ans = mcqAnswers[q.data.id];
        const correct = isMCQCorrect(q.data, ans);
        let userAnswer = 'Not answered';
        let correctAnswer = '';
        if (q.data.type === 'single') {
          if (ans !== undefined) userAnswer = q.data.options[ans as number] || '—';
          correctAnswer = q.data.options[q.data.answer as number] || '—';
        } else {
          if (ans !== undefined) userAnswer = (ans as number[]).map(i => q.data.options[i]).join(', ');
          correctAnswer = (q.data.answer as number[]).map(i => q.data.options[i]).join(', ');
        }
        return {
          questionId: q.data.id,
          questionText: q.data.question,
          domain: q.data.domain,
          type: 'mcq' as const,
          isCorrect: correct,
          userAnswer,
          correctAnswer,
          explanation: q.data.explanation,
          timeSpentSeconds: questionTimes[q.data.id] || 0,
          timestamp: Date.now(),
        };
      }
    });

    const correctCount = attemptQuestions.filter(q => q.isCorrect).length;
    const domainScores: Record<string, { correct: number; total: number }> = {};
    attemptQuestions.forEach(q => {
      if (!domainScores[q.domain]) domainScores[q.domain] = { correct: 0, total: 0 };
      domainScores[q.domain].total++;
      if (q.isCorrect) domainScores[q.domain].correct++;
    });

    const attempt: ExamAttempt = {
      id: `${examId}-${Date.now()}`,
      mode: 'exam',
      examId,
      startTime,
      endTime: Date.now(),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      percentage: Math.round((correctCount / questions.length) * 100),
      passed: Math.round((correctCount / questions.length) * 100) >= 75,
      questions: attemptQuestions,
      domainScores,
    };
    saveAttempt(attempt);

    // Build Logic Check questions for wrong MCQ answers only
    const lcqs: LogicCheckQuestion[] = questions
      .filter(q => q.kind === 'mcq')
      .filter(q => {
        const ans = mcqAnswers[q.data.id];
        return ans !== undefined && !isMCQCorrect(q.data, ans);
      })
      .map(q => {
        const mcq = q.data;
        const ans = mcqAnswers[mcq.id] as number | number[];
        const correctIdx = mcq.type === 'single' ? mcq.answer as number : (mcq.answer as number[])[0];
        const userIdx = mcq.type === 'single' ? ans as number : (ans as number[])[0];
        return {
          questionId: mcq.id,
          questionText: mcq.question,
          options: mcq.options,
          correctIndex: correctIdx,
          userIndex: userIdx,
          explanation: mcq.explanation,
          domain: mcq.domain,
        };
      });
    if (lcqs.length > 0) setLogicCheckQuestions(lcqs);
  };

  const handleTimerExpire = () => {
    if (!submitted) handleSubmit();
  };

  // Build feedback items
  const feedbackItems: FeedbackItem[] = questions.map(q => {
    if (q.kind === 'pbq') {
      const ans = pbqAnswers[q.data.id];
      const correct = isPBQCorrect(q.data, ans);
      let userAnswer = 'Not answered';
      let correctAnswer = '';
      if (q.data.type === 'firewall' && q.data.correctActions) {
        if (ans) userAnswer = (ans as string[]).map((v: string, i: number) => `Rule ${i + 1}: ${v || '—'}`).join(', ');
        correctAnswer = q.data.correctActions.map((v, i) => `Rule ${i + 1}: ${v}`).join(', ');
      } else if (q.data.type === 'ordering' && q.data.orderItems) {
        if (ans) userAnswer = (ans as string[]).map((s: string, i: number) => `${i + 1}. ${s}`).join(' → ');
        correctAnswer = [...q.data.orderItems].sort((a, b) => a.correctPosition - b.correctPosition).map((it, i) => `${i + 1}. ${it.step}`).join(' → ');
      }
      return { question: q.data.title, isCorrect: correct, userAnswer, correctAnswer, explanation: q.data.explanation || '' };
    } else {
      const ans = mcqAnswers[q.data.id];
      const correct = isMCQCorrect(q.data, ans);
      let userAnswer = 'Not answered';
      let correctAnswer = '';
      if (q.data.type === 'single') {
        if (ans !== undefined) userAnswer = q.data.options[ans as number] || '—';
        correctAnswer = q.data.options[q.data.answer as number] || '—';
      } else {
        if (ans !== undefined) userAnswer = (ans as number[]).map(i => q.data.options[i]).join(', ');
        correctAnswer = (q.data.answer as number[]).map(i => q.data.options[i]).join(', ');
      }
      return { question: q.data.question, isCorrect: correct, userAnswer, correctAnswer, explanation: q.data.explanation };
    }
  });

  const score = feedbackItems.filter(f => f.isCorrect).length;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'j') setCurrentIndex(i => Math.min(questions.length - 1, i + 1));
      if (e.key === 'ArrowLeft' || e.key === 'k') setCurrentIndex(i => Math.max(0, i - 1));
      if (e.key === 'f') toggleFlag();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [qId, questions.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <FeedbackDialog
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        title={`${examLabel} — Results`}
        items={feedbackItems}
        score={score}
        total={questions.length}
              onLogicCheck={logicCheckQuestions.length > 0 ? () => setShowLogicCheck(true) : undefined}
      />
            {showLogicCheck && (
        <LogicCheck
          questions={logicCheckQuestions}
          onComplete={() => { setShowLogicCheck(false); setLogicCheckQuestions([]); }}
          onSkip={() => { setShowLogicCheck(false); setLogicCheckQuestions([]); }}
        />
      )}

      {/* Exam header bar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold font-mono text-foreground">{examLabel}</h2>
            <span className="text-xs text-muted-foreground font-mono">
              Q{currentIndex + 1}/{questions.length}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
              current.kind === 'pbq' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
            }`}>{current.kind}</span>
          </div>

          <div className="flex items-center gap-3">
            <QuestionStopwatch
              questionId={qId}
              onTimeUpdate={handleTimeUpdate}
              running={!submitted}
            />
            <ExamTimer
              durationMinutes={durationMinutes}
              startTime={startTime}
              onExpire={handleTimerExpire}
              paused={submitted}
            />
            <button
              onClick={() => setShowNav(!showNav)}
              className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label="Question navigator"
            >
              <ListChecks className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Question navigator */}
        {showNav && (
          <div className="border-t border-border bg-card/90 px-4 py-3 animate-fade-in">
            <div className="container mx-auto flex flex-wrap gap-1.5">
              {questions.map((q, i) => {
                const id = q.kind === 'pbq' ? q.data.id : q.data.id;
                const answered = q.kind === 'pbq'
                  ? (pbqAnswers[id] && (Array.isArray(pbqAnswers[id]) ? (pbqAnswers[id] as any[]).some((a: any) => a !== '') : Object.keys(pbqAnswers[id]).length > 0))
                  : mcqAnswers[id] !== undefined;
                const flagged = flags.has(id);
                const isCorrect = submitted && (q.kind === 'pbq' ? isPBQCorrect(q.data, pbqAnswers[id]) : isMCQCorrect(q.data, mcqAnswers[id]));
                const isWrong = submitted && answered && !isCorrect;

                return (
                  <button key={id} onClick={() => setCurrentIndex(i)}
                    className={`relative w-8 h-8 rounded text-[10px] font-mono font-bold transition-all ${
                      i === currentIndex ? 'bg-primary text-primary-foreground ring-2 ring-primary/50' :
                      submitted && isCorrect ? 'bg-success/20 text-success border border-success/30' :
                      submitted && isWrong ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                      answered ? 'bg-muted text-foreground' :
                      'bg-card text-muted-foreground border border-border hover:border-primary/50'
                    }`}>
                    {i + 1}
                    {flagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Question content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
          {/* Domain & flag */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-primary uppercase tracking-wider">
                {current.kind === 'pbq' ? current.data.domain : current.data.domain}
              </span>
              {/* Confidence rating */}
              {!submitted && (
                <div className="flex items-center gap-1 ml-3">
                  <span className="text-[10px] text-muted-foreground">Confidence:</span>
                  {[1, 2, 3].map(level => (
                    <button key={level} onClick={() => setConfidence(prev => ({ ...prev, [qId]: level }))}
                      className={`w-5 h-5 rounded-full text-[9px] font-bold border transition-all ${
                        (confidence[qId] || 0) >= level
                          ? level === 1 ? 'bg-destructive/20 border-destructive text-destructive'
                            : level === 2 ? 'bg-warning/20 border-warning text-warning'
                            : 'bg-success/20 border-success text-success'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >{level}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFlag}
              className={`p-2 rounded-md transition-colors ${
                flags.has(qId) ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent'
              }`}>
              <Flag className="h-4 w-4" />
            </button>
          </div>

          {/* Render question based on type */}
          {current.kind === 'pbq' ? (
            <PBQQuestionRenderer
              question={current.data}
              answer={pbqAnswers[current.data.id]}
              onAnswer={(ans) => setPbqAnswers(prev => ({ ...prev, [current.data.id]: ans }))}
              submitted={submitted}
            />
          ) : (
            <MCQQuestionRenderer
              question={current.data}
              answer={mcqAnswers[current.data.id]}
              onAnswer={(ans) => setMcqAnswers(prev => ({ ...prev, [current.data.id]: ans }))}
              submitted={submitted}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-30 transition-all">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
              {getAnsweredCount()}/{questions.length} answered • ← → or J/K to navigate • F to flag
            </span>

            {currentIndex < questions.length - 1 ? (
              <button onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submitted ? () => setShowFeedback(true) : handleSubmit}
                className={`px-5 py-2 rounded-md text-sm font-bold transition-all ${
                  submitted ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-accent text-accent-foreground hover:opacity-90 shadow-lg'
                }`}>
                {submitted ? 'View Results' : 'Submit Exam'}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm py-3">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4">
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={getAnsweredCount() === 0}
              className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-40"
            >
              Submit Exam ({getAnsweredCount()}/{questions.length})
            </button>
          )}
          {submitted && (
            <div className="flex items-center gap-4">
              <button onClick={() => setShowFeedback(true)}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                View Full Results
              </button>
              <button onClick={onFinish}
                className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== PBQ Renderer ===== */
function PBQQuestionRenderer({ question, answer, onAnswer, submitted }: {
  question: PBQQuestion; answer: any; onAnswer: (a: any) => void; submitted: boolean;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">{question.title}</h3>
      <p className="text-sm text-muted-foreground mb-5">{question.description}</p>

      {question.type === 'firewall' && <FirewallRenderer q={question} ans={answer || []} onAns={onAnswer} sub={submitted} />}
      {question.type === 'matching' && <MatchingRenderer q={question} ans={answer || {}} onAns={onAnswer} sub={submitted} />}
      {question.type === 'classification' && <ClassificationRenderer q={question} ans={answer || {}} onAns={onAnswer} sub={submitted} />}
      {question.type === 'placement' && <PlacementRenderer q={question} ans={answer || {}} onAns={onAnswer} sub={submitted} />}
      {question.type === 'ordering' && <OrderingRenderer q={question} ans={answer || []} onAns={onAnswer} sub={submitted} />}

      {submitted && question.explanation && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
          <span className="font-bold text-primary text-xs">EXPLANATION:</span> {question.explanation}
        </div>
      )}
    </div>
  );
}

/* ===== MCQ Renderer ===== */
function MCQQuestionRenderer({ question, answer, onAnswer, submitted }: {
  question: MCQItem; answer: number | number[] | undefined; onAnswer: (a: number | number[]) => void; submitted: boolean;
}) {
  const isSelected = (idx: number) => {
    if (answer === undefined) return false;
    if (question.type === 'single') return answer === idx;
    return (answer as number[]).includes(idx);
  };

  const isCorrectOption = (idx: number) => {
    if (question.type === 'single') return question.answer === idx;
    return (question.answer as number[]).includes(idx);
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    if (question.type === 'single') {
      onAnswer(idx);
    } else {
      const prev = (answer as number[] | undefined) || [];
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx];
      onAnswer(next);
    }
  };

  const showInline = submitted && answer !== undefined;

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-1">{question.question}</h3>
      {question.type === 'multiple' && <p className="text-xs text-muted-foreground mb-4 italic">Select all that apply</p>}

      <div className="flex flex-col gap-2 mt-4">
        {question.options.map((opt, idx) => {
          const selected = isSelected(idx);
          const correct = isCorrectOption(idx);

          let optionClass = 'bg-muted/50 border-border text-foreground hover:border-primary/40';
          if (showInline && selected && correct) optionClass = 'bg-success/10 border-success text-success';
          else if (showInline && selected && !correct) optionClass = 'bg-destructive/10 border-destructive text-destructive';
          else if (showInline && !selected && correct) optionClass = 'bg-success/5 border-success/50 text-success';
          else if (selected) optionClass = 'bg-primary/10 border-primary text-foreground';

          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={submitted}
              className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm text-left transition-all ${optionClass}`}>
              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{opt}</span>
              {showInline && selected && correct && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
              {showInline && selected && !correct && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
          <span className="font-bold text-primary text-xs">EXPLANATION:</span> {question.explanation}
        </div>
      )}
    </div>
  );
}

/* ===== Sub-renderers ===== */

function FirewallRenderer({ q, ans, onAns, sub }: { q: PBQQuestion; ans: string[]; onAns: (a: string[]) => void; sub: boolean }) {
  if (!q.firewallRules) return null;
  const rules = q.firewallRules;
  const curr: string[] = ans.length ? ans : rules.map(() => '');
  const set = (i: number, v: string) => { const n = [...curr]; n[i] = v; onAns(n); };

  return (
    <div>
      {q.firewallScenario && <div className="bg-muted/50 border border-border rounded-md p-4 mb-4 text-sm text-muted-foreground font-mono leading-relaxed">{q.firewallScenario}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            {['Rule','Source','Dest','Port','Proto','Action'].map(h => <th key={h} className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">{h}</th>)}
          </tr></thead>
          <tbody>
            {rules.map((r, i) => {
              const ok = sub && curr[i] && q.correctActions && curr[i] === q.correctActions[i];
              const bad = sub && curr[i] && q.correctActions && curr[i] !== q.correctActions[i];
              return (
                <tr key={r.ruleId} className={`border-b border-border/50 ${ok ? 'bg-success/5' : bad ? 'bg-destructive/5' : ''}`}>
                  <td className="py-2 px-3 font-mono">{r.ruleId}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.sourceIP}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.destIP}</td>
                  <td className="py-2 px-3 font-mono">{r.port}</td>
                  <td className="py-2 px-3 font-mono">{r.protocol}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1 items-center">
                      {['ALLOW','DENY'].map(a => (
                        <button key={a} disabled={sub} onClick={() => set(i, a)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${curr[i] === a ? (a === 'ALLOW' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground') : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{a}</button>
                      ))}
                      {ok && <CheckCircle2 className="h-4 w-4 text-success ml-1" />}
                      {bad && <span className="flex items-center gap-1 ml-1"><XCircle className="h-4 w-4 text-destructive" /><span className="text-xs text-success font-mono">{q.correctActions![i]}</span></span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchingRenderer({ q, ans, onAns, sub }: { q: PBQQuestion; ans: Record<string, string>; onAns: (a: Record<string, string>) => void; sub: boolean }) {
  const items = q.matchingItems || [];
  const targets = q.matchingTargets || [];
  const [dragItem, setDragItem] = useState<string | null>(null);
  const handleDrop = (target: string) => { if (!dragItem || sub) return; onAns({ ...ans, [dragItem]: target }); setDragItem(null); };
  const unassigned = items.filter(it => !Object.keys(ans).includes(it.source));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Items to match</h4>
        <div className="flex flex-col gap-2">
          {unassigned.map(item => (
            <div key={item.source} draggable={!sub} onDragStart={() => setDragItem(item.source)} onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-4 py-2 rounded-md border border-border bg-muted text-sm font-medium text-foreground ${dragItem === item.source ? 'dragging' : ''}`}>{item.source}</div>
          ))}
          {unassigned.length === 0 && !sub && <p className="text-xs text-muted-foreground italic">All items assigned ✓</p>}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Categories</h4>
        <div className="flex flex-col gap-3">
          {targets.map(target => {
            const assignedHere = items.filter(it => ans[it.source] === target);
            return (
              <div key={target}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(target); }}
                className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[60px]">
                <p className="text-xs font-mono text-primary mb-2">{target}</p>
                <div className="flex flex-wrap gap-1">
                  {assignedHere.map(it => {
                    const ok = sub && it.target === target;
                    const bad = sub && it.target !== target;
                    return (
                      <span key={it.source} className={`px-2 py-1 rounded text-xs font-medium ${ok ? 'bg-success/20 text-success' : bad ? 'bg-destructive/20 text-destructive' : 'bg-card text-foreground border border-border'}`}>
                        {it.source}
                        {sub && bad && <span className="ml-1 text-success font-mono text-[10px]">→ {it.target}</span>}
                        {!sub && <button onClick={() => { const n = { ...ans }; delete n[it.source]; onAns(n); }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ClassificationRenderer({ q, ans, onAns, sub }: { q: PBQQuestion; ans: Record<string, string>; onAns: (a: Record<string, string>) => void; sub: boolean }) {
  const items = q.classificationItems || [];
  const cats = q.classificationCategories || [];
  const [dragItem, setDragItem] = useState<string | null>(null);
  const handleDrop = (cat: string) => { if (!dragItem || sub) return; onAns({ ...ans, [dragItem]: cat }); setDragItem(null); };
  const unassigned = items.filter(it => !Object.keys(ans).includes(it.item));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Items to classify</h4>
        <div className="flex flex-wrap gap-2">
          {unassigned.map(it => (
            <div key={it.item} draggable={!sub} onDragStart={() => setDragItem(it.item)} onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium text-foreground ${dragItem === it.item ? 'dragging' : ''}`}>{it.item}</div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cats.map(cat => {
          const here = items.filter(it => ans[it.item] === cat);
          return (
            <div key={cat}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(cat); }}
              className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[80px]">
              <p className="text-xs font-mono text-primary mb-2 font-bold">{cat}</p>
              <div className="flex flex-col gap-1">
                {here.map(it => {
                  const ok = sub && it.category === cat;
                  const bad = sub && it.category !== cat;
                  return (
                    <span key={it.item} className={`px-2 py-1 rounded text-xs ${ok ? 'bg-success/20 text-success' : bad ? 'bg-destructive/20 text-destructive' : 'bg-card text-foreground border border-border'}`}>
                      {it.item}
                      {sub && bad && <span className="ml-1 text-success font-mono text-[10px]">→ {it.category}</span>}
                      {!sub && <button onClick={() => { const n = { ...ans }; delete n[it.item]; onAns(n); }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlacementRenderer({ q, ans, onAns, sub }: { q: PBQQuestion; ans: Record<string, string>; onAns: (a: Record<string, string>) => void; sub: boolean }) {
  const items = q.placementItems || [];
  const zones = q.placementZones || [];
  const [dragItem, setDragItem] = useState<string | null>(null);
  const handleDrop = (z: string) => { if (!dragItem || sub) return; onAns({ ...ans, [dragItem]: z }); setDragItem(null); };
  const unassigned = items.filter(it => !Object.keys(ans).includes(it.item));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Items to place</h4>
        <div className="flex flex-wrap gap-2">
          {unassigned.map(it => (
            <div key={it.item} draggable={!sub} onDragStart={() => setDragItem(it.item)} onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium text-foreground ${dragItem === it.item ? 'dragging' : ''}`}>{it.item}</div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {zones.map(z => {
          const here = items.filter(it => ans[it.item] === z);
          return (
            <div key={z}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(z); }}
              className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[100px]">
              <p className="text-xs font-mono text-accent mb-2 font-bold">{z}</p>
              <div className="flex flex-col gap-1">
                {here.map(it => {
                  const ok = sub && it.correctZone === z;
                  const bad = sub && it.correctZone !== z;
                  return (
                    <span key={it.item} className={`px-2 py-1 rounded text-xs ${ok ? 'bg-success/20 text-success' : bad ? 'bg-destructive/20 text-destructive' : 'bg-card text-foreground border border-border'}`}>
                      {it.item}
                      {sub && bad && <span className="ml-1 text-success font-mono text-[10px]">→ {it.correctZone}</span>}
                      {!sub && <button onClick={() => { const n = { ...ans }; delete n[it.item]; onAns(n); }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderingRenderer({ q, ans, onAns, sub }: { q: PBQQuestion; ans: string[]; onAns: (a: string[]) => void; sub: boolean }) {
  const items = q.orderItems || [];
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const currentOrder: string[] = ans.length > 0 ? ans : items.map(it => it.step).sort(() => Math.random() - 0.5);

  if (ans.length === 0 && items.length > 0) {
    setTimeout(() => onAns(currentOrder), 0);
  }

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || sub) return;
    const next = [...currentOrder];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    onAns(next);
    setDragIdx(null);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Drag to reorder</h4>
      {currentOrder.map((step, idx) => {
        const ci = items.find(it => it.step === step);
        const ok = sub && ci && ci.correctPosition === idx;
        const bad = sub && ci && ci.correctPosition !== idx;
        return (
          <div key={step} draggable={!sub} onDragStart={() => setDragIdx(idx)} onDragEnd={() => setDragIdx(null)}
            onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleDrop(idx); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm transition-all ${
              ok ? 'bg-success/10 border-success text-success' : bad ? 'bg-destructive/10 border-destructive text-destructive' : dragIdx === idx ? 'border-accent bg-accent/10 opacity-50' : 'border-border bg-muted text-foreground'
            } ${!sub ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">{idx + 1}</span>
            <span className="flex-1">{step}</span>
            {ok && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
            {bad && ci && <span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-destructive" /><span className="text-xs text-success font-mono">#{ci.correctPosition + 1}</span></span>}
          </div>
        );
      })}
    </div>
  );
}
