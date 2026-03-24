import { useState, useCallback, useMemo, useEffect } from 'react';
import { Flag, ChevronLeft, ChevronRight, ListChecks, CheckCircle2, XCircle, GripVertical, AlertTriangle, Clock, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { MCQuestion, PBQuestion } from '@/data/questions';
import { isMCQCorrect, isPBQCorrect, calculateScore, type ScoreResult } from '@/lib/examEngine';
import { ExamResults } from '@/components/ExamResults';
import { saveAttempt, type QuestionAttempt, type ExamAttempt } from '@/lib/examHistory';
import { DOMAIN_LABELS } from '@/data/questions';

type UnifiedQ = { kind: 'pbq'; data: PBQuestion } | { kind: 'mcq'; data: MCQuestion };

interface NewExamEngineProps {
  pbqs: PBQuestion[];
  mcqs: MCQuestion[];
  durationMinutes: number;
    examNumber?: 1 | 2 | 3;
  isStudyMode?: boolean;
  onFinish: () => void;
}

export function NewExamEngine({ pbqs, mcqs, durationMinutes, isStudyMode = false, examNumber = 1, onFinish }: NewExamEngineProps) {
  const questions = useMemo<UnifiedQ[]>(() => [
    ...pbqs.map(q => ({ kind: 'pbq' as const, data: q })),
    ...mcqs.map(q => ({ kind: 'mcq' as const, data: q })),
  ], [pbqs, mcqs]);

  const [idx, setIdx] = useState(0);
  const [pbqAnswers, setPbqAnswers] = useState<Record<string, any>>({});
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number | number[]>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showPBQLockWarning, setShowPBQLockWarning] = useState(false);
  const [pbqLocked, setPbqLocked] = useState(false);
  const [startTime] = useState(Date.now());
  const [remaining, setRemaining] = useState(durationMinutes * 60);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [studyRevealed, setStudyRevealed] = useState<Set<string>>(new Set());
  const [qStartTime, setQStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});

  const cur = questions[idx];
  const qId = cur.kind === 'pbq' ? cur.data.id : cur.data.id;
  const isPBQSection = idx < pbqs.length;

  // Timer
  useEffect(() => {
    if (isStudyMode || submitted) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const r = Math.max(0, durationMinutes * 60 - elapsed);
      setRemaining(r);
      if (r <= 0) { clearInterval(interval); handleSubmit(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes, submitted, isStudyMode]);

  // Track time per question
  useEffect(() => {
    setQStartTime(Date.now());
    return () => {
      const elapsed = Math.floor((Date.now() - qStartTime) / 1000);
      setQuestionTimes(prev => ({ ...prev, [qId]: (prev[qId] || 0) + elapsed }));
    };
  }, [idx]);

  const answeredCount = useMemo(() => {
    let c = 0;
    questions.forEach(q => {
      const id = q.kind === 'pbq' ? q.data.id : q.data.id;
      if (q.kind === 'pbq') {
        const a = pbqAnswers[id];
        if (a && (Array.isArray(a) ? a.some(v => v !== '') : typeof a === 'object' && Object.keys(a).length > 0)) c++;
      } else {
        if (mcqAnswers[id] !== undefined) c++;
      }
    });
    return c;
  }, [questions, pbqAnswers, mcqAnswers]);

  const unansweredCount = questions.length - answeredCount;

  const handleSubmit = useCallback(() => {
    const result = calculateScore(pbqs, mcqs, pbqAnswers, mcqAnswers, startTime);
    setScoreResult(result);
    setSubmitted(true);
    setShowConfirmSubmit(false);

    // Save to history
    const attemptQs: QuestionAttempt[] = [
      ...pbqs.map(q => ({
        questionId: q.id, questionText: q.title, domain: DOMAIN_LABELS[q.domain],
        type: 'pbq' as const, isCorrect: isPBQCorrect(q, pbqAnswers[q.id]),
        userAnswer: JSON.stringify(pbqAnswers[q.id] || {}), correctAnswer: '',
        explanation: q.explanation, timeSpentSeconds: questionTimes[q.id] || 0, timestamp: Date.now(),
      })),
      ...mcqs.map(q => ({
        questionId: q.id, questionText: q.question, domain: DOMAIN_LABELS[q.domain],
        type: 'mcq' as const, isCorrect: isMCQCorrect(q, mcqAnswers[q.id]),
        userAnswer: mcqAnswers[q.id] !== undefined ? String(mcqAnswers[q.id]) : 'Not answered',
        correctAnswer: String(q.answer), explanation: q.explanation,
        timeSpentSeconds: questionTimes[q.id] || 0, timestamp: Date.now(),
      })),
    ];
    const domainScores: Record<string, { correct: number; total: number }> = {};
    Object.entries(result.domainScores).forEach(([k, v]) => { domainScores[k] = { correct: v.correct, total: v.total }; });
    saveAttempt({
      id: `exam-${Date.now()}`, mode: isStudyMode ? 'practice' : 'exam',
      startTime, endTime: Date.now(), totalQuestions: questions.length,
      correctAnswers: result.rawCorrect, percentage: Math.round((result.rawCorrect / result.rawTotal) * 100),
      passed: result.passed, questions: attemptQs, domainScores,
    });
  }, [pbqs, mcqs, pbqAnswers, mcqAnswers, startTime, questionTimes, isStudyMode]);

  const goTo = (newIdx: number) => {
    // PBQ lock check
    if (!pbqLocked && isPBQSection && newIdx >= pbqs.length) {
      setShowPBQLockWarning(true);
      return;
    }
    if (pbqLocked && newIdx < pbqs.length) return; // Can't go back to PBQs
    setIdx(newIdx);
  };

  const confirmLeavePBQ = () => {
    setPbqLocked(true);
    setShowPBQLockWarning(false);
    setIdx(pbqs.length);
  };

  const toggleFlag = () => {
    setFlags(prev => { const n = new Set(prev); if (n.has(qId)) n.delete(qId); else n.add(qId); return n; });
  };

  // Show results screen
  if (submitted && scoreResult && !isStudyMode) {
    return <ExamResults score={scoreResult} pbqs={pbqs} mcqs={mcqs} pbqAnswers={pbqAnswers} mcqAnswers={mcqAnswers} onRestart={onFinish} onBackToMenu={onFinish} />;
  }

  const timerMins = Math.floor(remaining / 60);
  const timerSecs = remaining % 60;
  const timerDisplay = `${String(timerMins).padStart(2,'0')}:${String(timerSecs).padStart(2,'0')}`;
  const isWarning30 = remaining <= 1800 && remaining > 600;
  const isWarning10 = remaining <= 600;
  const pct = (remaining / (durationMinutes * 60)) * 100;

  // Per-question stopwatch
  const qElapsed = Math.floor((Date.now() - qStartTime) / 1000);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              {unansweredCount > 0
                ? `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Submit anyway?`
                : 'Are you sure you want to submit your exam?'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <button onClick={() => setShowConfirmSubmit(false)} className="px-4 py-2 rounded-md border border-border text-sm">Continue Exam</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-bold">Submit</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PBQ Lock Warning */}
      <Dialog open={showPBQLockWarning} onOpenChange={setShowPBQLockWarning}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> Leaving PBQ Section</DialogTitle>
            <DialogDescription>
              You are leaving the Performance-Based Questions section. You <strong>cannot return</strong> to these questions. Continue?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <button onClick={() => setShowPBQLockWarning(false)} className="px-4 py-2 rounded-md border border-border text-sm">Stay in PBQs</button>
            <button onClick={confirmLeavePBQ} className="px-4 py-2 rounded-md bg-warning text-warning-foreground text-sm font-bold">Continue to MCQs</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Banners */}
      {!isStudyMode && isWarning10 && !submitted && (
        <div className="bg-destructive/20 border-b border-destructive text-destructive text-center py-2 text-xs font-bold font-mono animate-pulse">
          ⚠ LESS THAN 10 MINUTES REMAINING
        </div>
      )}
      {!isStudyMode && isWarning30 && !isWarning10 && !submitted && (
        <div className="bg-warning/20 border-b border-warning text-warning text-center py-1.5 text-xs font-mono">
          ⚠ 30 minutes or less remaining
        </div>
      )}

      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold font-mono text-foreground">
              Question {idx + 1} of {questions.length}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
              cur.kind === 'pbq' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
            }`}>{cur.kind === 'pbq' ? 'PBQ' : cur.data.type === 'select-two' ? 'SELECT TWO' : 'MCQ'}</span>
            {pbqLocked && isPBQSection && <span className="text-[10px] text-destructive font-mono">LOCKED</span>}
            <span className="text-[10px] text-muted-foreground font-mono">{flags.size} flagged</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Per-question stopwatch */}
            {!submitted && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono ${qElapsed > 60 ? 'text-warning bg-warning/10' : 'text-muted-foreground bg-muted/50'}`}>
                <Timer className="h-3 w-3" />
                <QuestionTimer startTime={qStartTime} />
              </div>
            )}

            {/* Exam timer */}
            {!isStudyMode && !submitted && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm ${
                isWarning10 ? 'border-destructive bg-destructive/10 text-destructive animate-pulse' :
                isWarning30 ? 'border-warning bg-warning/10 text-warning' :
                'border-border bg-card text-foreground'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-bold">{timerDisplay}</span>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                  <div className={`h-full rounded-full transition-all ${isWarning10 ? 'bg-destructive' : isWarning30 ? 'bg-warning' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            <button onClick={() => setShowNav(!showNav)}
              className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <ListChecks className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Navigation Grid */}
        {showNav && (
          <div className="border-t border-border bg-card/90 px-4 py-3 animate-fade-in">
            <div className="container mx-auto flex flex-wrap gap-1.5">
              {questions.map((q, i) => {
                const id = q.kind === 'pbq' ? q.data.id : q.data.id;
                const answered = q.kind === 'pbq'
                  ? (pbqAnswers[id] && (Array.isArray(pbqAnswers[id]) ? pbqAnswers[id].some((a: any) => a !== '') : typeof pbqAnswers[id] === 'object' && Object.keys(pbqAnswers[id]).length > 0))
                  : mcqAnswers[id] !== undefined;
                const flagged = flags.has(id);
                const locked = pbqLocked && i < pbqs.length;
                return (
                  <button key={id} onClick={() => !locked && goTo(i)} disabled={locked}
                    className={`relative w-8 h-8 rounded text-[10px] font-mono font-bold transition-all ${
                      i === idx ? 'bg-primary text-primary-foreground ring-2 ring-primary/50' :
                      locked ? 'bg-muted/50 text-muted-foreground/30 cursor-not-allowed' :
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

      {/* Question Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
          {/* Domain & Flag */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">
              {DOMAIN_LABELS[cur.kind === 'pbq' ? cur.data.domain : cur.data.domain]}
            </span>
            <button onClick={toggleFlag} className={`p-2 rounded-md transition-colors ${flags.has(qId) ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent'}`}>
              <Flag className="h-4 w-4" />
            </button>
          </div>

          {/* Render question */}
          {cur.kind === 'pbq' ? (
            <PBQRenderer q={cur.data} ans={pbqAnswers[cur.data.id]} onAns={a => setPbqAnswers(p => ({...p,[cur.data.id]:a}))} submitted={submitted} studyRevealed={isStudyMode && studyRevealed.has(cur.data.id)} />
          ) : (
            <MCQRenderer q={cur.data} ans={mcqAnswers[cur.data.id]} onAns={a => setMcqAnswers(p => ({...p,[cur.data.id]:a}))} submitted={submitted} studyRevealed={isStudyMode && studyRevealed.has(cur.data.id)} />
          )}

          {/* Study mode reveal */}
          {isStudyMode && !studyRevealed.has(qId) && (
            <button onClick={() => setStudyRevealed(prev => new Set(prev).add(qId))}
              className="mt-4 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-bold hover:opacity-90">
              Show Answer & Explanation
            </button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <button onClick={() => goTo(Math.max(0, idx - 1))} disabled={idx === 0 || (pbqLocked && idx - 1 < pbqs.length)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm text-foreground hover:bg-muted disabled:opacity-30 transition-all">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
              {answeredCount}/{questions.length} answered
            </span>

            {idx < questions.length - 1 ? (
              <button onClick={() => goTo(idx + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : !isStudyMode ? (
              <button onClick={() => setShowConfirmSubmit(true)}
                className="px-5 py-2 rounded-md bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 shadow-lg">
                Submit Exam
              </button>
            ) : (
              <button onClick={onFinish}
                className="px-5 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted">
                Finish Study Session
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Submit Bar (exam mode only) */}
      {!isStudyMode && !submitted && idx >= questions.length - 1 && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm py-3 text-center">
          <button onClick={() => setShowConfirmSubmit(true)}
            className="px-8 py-3 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 shadow-lg">
            Submit Exam ({answeredCount}/{questions.length})
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== Question Timer ===== */
function QuestionTimer({ startTime }: { startTime: number }) {
  const [, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(i); }, [startTime]);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  return <span>{Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')}</span>;
}

/* ===== MCQ Renderer ===== */
function MCQRenderer({ q, ans, onAns, submitted, studyRevealed }: { q: MCQuestion; ans?: number | number[]; onAns: (a: number | number[]) => void; submitted: boolean; studyRevealed: boolean }) {
  const showFeedback = submitted || studyRevealed;
  const isSelected = (i: number) => {
    if (ans === undefined) return false;
    return q.type === 'single' ? ans === i : (ans as number[]).includes(i);
  };
  const isCorrectOpt = (i: number) => q.type === 'single' ? q.answer === i : (q.answer as number[]).includes(i);

  const handleSelect = (i: number) => {
    if (showFeedback) return;
    if (q.type === 'single') { onAns(i); }
    else {
      const prev = (ans as number[] | undefined) || [];
      onAns(prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-1">{q.question}</h3>
      {q.type === 'select-two' && <p className="text-xs text-accent mb-4 italic font-bold">Select exactly TWO answers</p>}
      <div className="flex flex-col gap-2 mt-4">
        {q.options.map((opt, i) => {
          const sel = isSelected(i);
          const correct = isCorrectOpt(i);
          let cls = 'bg-muted/50 border-border text-foreground hover:border-primary/40';
          if (showFeedback && sel && correct) cls = 'bg-success/10 border-success text-success';
          else if (showFeedback && sel && !correct) cls = 'bg-destructive/10 border-destructive text-destructive';
          else if (showFeedback && !sel && correct) cls = 'bg-success/5 border-success/50 text-success';
          else if (sel) cls = 'bg-primary/10 border-primary text-foreground';
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={showFeedback}
              className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm text-left transition-all ${cls}`}>
              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">
                {String.fromCharCode(65+i)}
              </span>
              <span className="flex-1">{opt}</span>
              {showFeedback && sel && correct && <CheckCircle2 className="h-4 w-4 text-success" />}
              {showFeedback && sel && !correct && <XCircle className="h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>
      {showFeedback && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
          <span className="font-bold text-primary text-xs">EXPLANATION:</span> {q.explanation}
        </div>
      )}
    </div>
  );
}

/* ===== PBQ Renderer ===== */
function PBQRenderer({ q, ans, onAns, submitted, studyRevealed }: { q: PBQuestion; ans: any; onAns: (a: any) => void; submitted: boolean; studyRevealed: boolean }) {
  const showFeedback = submitted || studyRevealed;

  return (
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">{q.title}</h3>
      <div className="bg-muted/50 border border-border rounded-md p-4 mb-5 text-sm text-muted-foreground font-mono leading-relaxed whitespace-pre-line">{q.scenario}</div>

      {q.type === 'firewall' && <FirewallPBQ q={q} ans={ans || []} onAns={onAns} show={showFeedback} />}
      {q.type === 'ordering' && <OrderingPBQ q={q} ans={ans || []} onAns={onAns} show={showFeedback} />}
      {q.type === 'log-analysis' && <LogAnalysisPBQ q={q} ans={ans || {}} onAns={onAns} show={showFeedback} />}
      {q.type === 'matching' && <MatchingPBQ q={q} ans={ans || {}} onAns={onAns} show={showFeedback} />}
      {q.type === 'placement' && <PlacementPBQ q={q} ans={ans || {}} onAns={onAns} show={showFeedback} />}

      {showFeedback && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
          <span className="font-bold text-primary text-xs">EXPLANATION:</span> {q.explanation}
        </div>
      )}
    </div>
  );
}

/* ===== Firewall PBQ ===== */
function FirewallPBQ({ q, ans, onAns, show }: { q: PBQFirewall; ans: string[]; onAns: (a: string[]) => void; show: boolean }) {
  const curr = ans.length ? ans : q.rules.map(() => '');
  const set = (i: number, v: string) => { const n = [...curr]; n[i] = v; onAns(n); };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border">
          {['Rule','Source','Dest','Port','Proto','Action'].map(h => <th key={h} className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">{h}</th>)}
        </tr></thead>
        <tbody>
          {q.rules.map((r, i) => {
            const ok = show && curr[i] === q.correctActions[i];
            const bad = show && curr[i] && curr[i] !== q.correctActions[i];
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
                      <button key={a} disabled={show} onClick={() => set(i, a)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${curr[i] === a ? (a === 'ALLOW' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground') : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{a}</button>
                    ))}
                    {ok && <CheckCircle2 className="h-4 w-4 text-success ml-1" />}
                    {bad && <><XCircle className="h-4 w-4 text-destructive ml-1" /><span className="text-xs text-success font-mono">{q.correctActions[i]}</span></>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import type { PBQFirewall, PBQOrdering, PBQLogAnalysis, PBQMatching, PBQPlacement } from '@/data/questions';

/* ===== Ordering PBQ ===== */
function OrderingPBQ({ q, ans, onAns, show }: { q: PBQOrdering; ans: string[]; onAns: (a: string[]) => void; show: boolean }) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const currentOrder = ans.length > 0 ? ans : q.steps.map(s => s.label).sort(() => Math.random() - 0.5);
  if (ans.length === 0 && q.steps.length > 0) setTimeout(() => onAns(currentOrder), 0);

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || show) return;
    const next = [...currentOrder];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    onAns(next);
    setDragIdx(null);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Drag to reorder</h4>
      {currentOrder.map((step, i) => {
        const ci = q.steps.find(s => s.label === step);
        const ok = show && ci && ci.correctPosition === i;
        const bad = show && ci && ci.correctPosition !== i;
        return (
          <div key={step} draggable={!show} onDragStart={() => setDragIdx(i)} onDragEnd={() => setDragIdx(null)}
            onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleDrop(i); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm transition-all ${
              ok ? 'bg-success/10 border-success text-success' : bad ? 'bg-destructive/10 border-destructive text-destructive' : dragIdx === i ? 'border-accent bg-accent/10 opacity-50' : 'border-border bg-muted text-foreground'
            } ${!show ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">{i+1}</span>
            <span className="flex-1">{step}</span>
            {ok && <CheckCircle2 className="h-4 w-4 text-success" />}
            {bad && ci && <><XCircle className="h-4 w-4 text-destructive" /><span className="text-xs text-success font-mono">#{ci.correctPosition+1}</span></>}
          </div>
        );
      })}
    </div>
  );
}

/* ===== Log Analysis PBQ ===== */
function LogAnalysisPBQ({ q, ans, onAns, show }: { q: PBQLogAnalysis; ans: any; onAns: (a: any) => void; show: boolean }) {
  const current = ans || {};
  const update = (key: string, value: any) => onAns({ ...current, [key]: value });

  return (
    <div className="space-y-4">
      {/* Log entries */}
      <div className="bg-background border border-border rounded-md p-3 font-mono text-xs text-foreground overflow-x-auto">
        {q.logEntries.map((entry, i) => (
          <div key={i} className="py-0.5 whitespace-nowrap">{entry.line}</div>
        ))}
      </div>

      {/* Attack type */}
      <div>
        <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">1. Identify the attack type</label>
        <select value={current.attackType || ''} onChange={e => update('attackType', e.target.value)} disabled={show}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-md text-foreground">
          <option value="">Select attack type...</option>
          {q.attackTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {show && (
          <div className={`text-xs mt-1 ${current.attackType === q.correctAttackType ? 'text-success' : 'text-destructive'}`}>
            {current.attackType === q.correctAttackType ? '✓ Correct' : `✗ Correct: ${q.correctAttackType}`}
          </div>
        )}
      </div>

      {/* Source IP */}
      <div>
        <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">2. Identify the source IP</label>
        <select value={current.sourceIP || ''} onChange={e => update('sourceIP', e.target.value)} disabled={show}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-md text-foreground">
          <option value="">Select source IP...</option>
          {q.sourceIPOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {show && (
          <div className={`text-xs mt-1 ${current.sourceIP === q.correctSourceIP ? 'text-success' : 'text-destructive'}`}>
            {current.sourceIP === q.correctSourceIP ? '✓ Correct' : `✗ Correct: ${q.correctSourceIP}`}
          </div>
        )}
      </div>

      {/* Response */}
      <div>
        <label className="text-xs font-mono text-muted-foreground uppercase mb-1 block">3. Select the FIRST response action</label>
        <div className="flex flex-col gap-2">
          {q.responseOptions.map((opt, i) => {
            const sel = current.response === i;
            const correct = i === q.correctResponse;
            let cls = 'bg-muted/50 border-border text-foreground hover:border-primary/40';
            if (show && sel && correct) cls = 'bg-success/10 border-success text-success';
            else if (show && sel && !correct) cls = 'bg-destructive/10 border-destructive text-destructive';
            else if (show && !sel && correct) cls = 'bg-success/5 border-success/50 text-success';
            else if (sel) cls = 'bg-primary/10 border-primary text-foreground';
            return (
              <button key={i} onClick={() => !show && update('response', i)} disabled={show}
                className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm text-left transition-all ${cls}`}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">{String.fromCharCode(65+i)}</span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===== Matching PBQ ===== */
function MatchingPBQ({ q, ans, onAns, show }: { q: PBQMatching; ans: Record<string,string>; onAns: (a: Record<string,string>) => void; show: boolean }) {
  const [dragItem, setDragItem] = useState<string | null>(null);
  const handleDrop = (right: string) => { if (!dragItem || show) return; onAns({...ans, [dragItem]: right}); setDragItem(null); };
  const unassigned = q.items.filter(it => !Object.keys(ans).includes(it.left));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Items to match</h4>
        <div className="flex flex-col gap-2">
          {unassigned.map(it => (
            <div key={it.left} draggable={!show} onDragStart={() => setDragItem(it.left)} onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-4 py-2 rounded-md border border-border bg-muted text-sm font-medium text-foreground ${dragItem === it.left ? 'dragging' : ''}`}>{it.left}</div>
          ))}
          {unassigned.length === 0 && !show && <p className="text-xs text-muted-foreground italic">All items assigned ✓</p>}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Categories</h4>
        <div className="flex flex-col gap-3">
          {q.rightOptions.map(right => {
            const assigned = q.items.filter(it => ans[it.left] === right);
            return (
              <div key={right}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(right); }}
                className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[50px]">
                <p className="text-xs font-mono text-primary mb-2">{right}</p>
                <div className="flex flex-wrap gap-1">
                  {assigned.map(it => {
                    const ok = show && it.correctRight === right;
                    const bad = show && it.correctRight !== right;
                    return (
                      <span key={it.left} className={`px-2 py-1 rounded text-xs font-medium ${ok ? 'bg-success/20 text-success' : bad ? 'bg-destructive/20 text-destructive' : 'bg-card text-foreground border border-border'}`}>
                        {it.left}
                        {bad && <span className="ml-1 text-success font-mono text-[10px]">→ {it.correctRight}</span>}
                        {!show && <button onClick={() => { const n = {...ans}; delete n[it.left]; onAns(n); }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>}
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

/* ===== Placement PBQ ===== */
function PlacementPBQ({ q, ans, onAns, show }: { q: PBQPlacement; ans: Record<string,string>; onAns: (a: Record<string,string>) => void; show: boolean }) {
  const [dragItem, setDragItem] = useState<string | null>(null);
  const handleDrop = (zone: string) => { if (!dragItem || show) return; onAns({...ans, [dragItem]: zone}); setDragItem(null); };
  const unassigned = q.items.filter(it => !Object.keys(ans).includes(it.label));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Items to place</h4>
        <div className="flex flex-wrap gap-2">
          {unassigned.map(it => (
            <div key={it.label} draggable={!show} onDragStart={() => setDragItem(it.label)} onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium text-foreground ${dragItem === it.label ? 'dragging' : ''}`}>{it.label}</div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.zones.map(zone => {
          const here = q.items.filter(it => ans[it.label] === zone);
          return (
            <div key={zone}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(zone); }}
              className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[80px]">
              <p className="text-xs font-mono text-accent mb-2 font-bold">{zone}</p>
              <div className="flex flex-col gap-1">
                {here.map(it => {
                  const ok = show && it.correctZone === zone;
                  const bad = show && it.correctZone !== zone;
                  return (
                    <span key={it.label} className={`px-2 py-1 rounded text-xs ${ok ? 'bg-success/20 text-success' : bad ? 'bg-destructive/20 text-destructive' : 'bg-card text-foreground border border-border'}`}>
                      {it.label}
                      {bad && <span className="ml-1 text-success font-mono text-[10px]">→ {it.correctZone}</span>}
                      {!show && <button onClick={() => { const n = {...ans}; delete n[it.label]; onAns(n); }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>}
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
