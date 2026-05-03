import { CheckCircle2, XCircle, Trophy, Clock, Info, ChevronDown, ChevronUp, ListFilter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ScoreResult } from '@/lib/examEngine';
import type { MCQuestion, PBQuestion } from '@/data/questions';
import { DOMAIN_LABELS } from '@/data/questions';
import { isMCQCorrect, isPBQCorrect } from '@/lib/examEngine';

interface ExamResultsProps {
  score: ScoreResult;
  pbqs: PBQuestion[];
  mcqs: MCQuestion[];
  pbqAnswers: Record<string, any>;
  mcqAnswers: Record<string, number | number[]>;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function ExamResults({ score, pbqs, mcqs, pbqAnswers, mcqAnswers, onRestart, onBackToMenu }: ExamResultsProps) {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('failed');

  const reviewItems = useMemo(() => {
    const items = [
      ...pbqs.map((q, i) => ({
        id: q.id,
        num: i + 1,
        type: 'pbq' as const,
        correct: isPBQCorrect(q, pbqAnswers[q.id]),
        title: q.title,
        domain: DOMAIN_LABELS[q.domain],
        explanation: q.explanation,
        userAns: '',
        correctAns: '',
      })),
      ...mcqs.map((q, i) => {
        const a = mcqAnswers[q.id];
        const correct = isMCQCorrect(q, a);
        let userAns = 'Not answered';
        let correctAns = '';
        if (q.type === 'single') {
          if (a !== undefined) userAns = q.options[a as number] || '—';
          correctAns = q.options[q.answer as number] || '—';
        } else {
          if (a !== undefined) userAns = (a as number[]).map(idx => q.options[idx]).join(', ');
          correctAns = (q.answer as number[]).map(idx => q.options[idx]).join(', ');
        }
        return {
          id: q.id,
          num: pbqs.length + i + 1,
          type: 'mcq' as const,
          correct,
          title: q.question,
          domain: DOMAIN_LABELS[q.domain],
          explanation: q.explanation,
          userAns,
          correctAns,
        };
      }),
    ];
    return items;
  }, [pbqs, mcqs, pbqAnswers, mcqAnswers]);

  const passedCount = reviewItems.filter(i => i.correct).length;
  const failedCount = reviewItems.length - passedCount;
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Score Banner */}
        <div className={`rounded-xl p-8 mb-6 text-center border ${score.passed ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
          <Trophy className={`h-12 w-12 mx-auto mb-3 ${score.passed ? 'text-success' : 'text-destructive'}`} />
          <div className={`text-6xl font-bold font-mono mb-2 ${score.passed ? 'text-success' : 'text-destructive'}`}>
            {score.scaledScore}
          </div>
          <p className="text-sm text-muted-foreground font-mono">out of 900</p>
          <div className={`inline-block mt-3 px-6 py-2 rounded-full text-sm font-bold ${score.passed ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
            {score.passed ? '✓ PASS' : '✗ FAIL'} — {score.passed ? 'Congratulations!' : 'Review and try again'}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>{score.rawCorrect}/{score.rawTotal} correct ({Math.round((score.rawCorrect/score.rawTotal)*100)}%)</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {score.timeUsedMinutes} min</span>
          </div>
        </div>

        {/* Pass / Fail at-a-glance */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-4 border border-success/30 bg-success/5 text-center">
            <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-1" />
            <div className="text-3xl font-black font-mono text-success">{passedCount}</div>
            <div className="text-[10px] uppercase tracking-widest text-success/80 font-bold">Passed</div>
          </div>
          <div className="rounded-xl p-4 border border-destructive/30 bg-destructive/5 text-center">
            <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <div className="text-3xl font-black font-mono text-destructive">{failedCount}</div>
            <div className="text-[10px] uppercase tracking-widest text-destructive/80 font-bold">Failed</div>
          </div>
        </div>

        {/* Domain Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Domain Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(score.domainScores).filter(([,v]) => v.total > 0).map(([domain, data]) => (
              <div key={domain}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground truncate mr-2">{domain}</span>
                  <span className={`text-xs font-mono font-bold ${data.percentage >= 75 ? 'text-success' : data.percentage >= 50 ? 'text-warning' : 'text-destructive'}`}>
                    {data.correct}/{data.total} ({data.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${data.percentage >= 75 ? 'bg-success' : data.percentage >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                    style={{ width: `${data.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Review with filter tabs */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ListFilter className="h-4 w-4" /> Question Review
            </h3>
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              {([
                { k: 'failed', label: `✗ Failed (${failedCount})`, cls: 'bg-destructive text-destructive-foreground' },
                { k: 'passed', label: `✓ Passed (${passedCount})`, cls: 'bg-success text-success-foreground' },
                { k: 'all',    label: `All (${reviewItems.length})`, cls: 'bg-primary text-primary-foreground' },
              ] as const).map(tab => (
                <button key={tab.k} onClick={() => setFilter(tab.k)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                    filter === tab.k ? tab.cls : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Number grid (always shows all, color-coded) */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {reviewItems.map(item => {
              const dim = filter !== 'all' && ((filter === 'passed') !== item.correct);
              return (
                <button key={item.id} onClick={() => { setFilter('all'); setExpandedQ(expandedQ === item.id ? null : item.id); }}
                  className={`w-8 h-8 rounded text-[10px] font-mono font-bold transition-all ${
                    item.correct ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'
                  } ${expandedQ === item.id ? 'ring-2 ring-primary' : ''} ${dim ? 'opacity-30' : ''}`}>
                  {item.num}
                </button>
              );
            })}
          </div>

          <ScrollArea className="max-h-[420px]">
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  {filter === 'failed' ? '🎉 No failed questions — clean sweep!' : 'Nothing to show here.'}
                </div>
              )}
              {filtered.map(item => {
                const expanded = expandedQ === item.id;
                return (
                  <div key={item.id} className={`border rounded-lg overflow-hidden ${item.correct ? 'border-success/20' : 'border-destructive/20'}`}>
                    <button onClick={() => setExpandedQ(expanded ? null : item.id)}
                      className={`w-full flex items-center gap-2 p-3 text-left text-sm ${item.correct ? 'bg-success/5' : 'bg-destructive/5'}`}>
                      {item.correct ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" /> : <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                      <span className="text-xs font-mono text-muted-foreground mr-2">Q{item.num}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${item.type === 'pbq' ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary'}`}>
                        {item.type === 'pbq' ? 'PBQ' : 'MCQ'}
                      </span>
                      <span className="flex-1 truncate text-foreground">{item.title.length > 80 ? item.title.substring(0,80) + '…' : item.title}</span>
                      <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono">{item.domain.split(' ').slice(0,3).join(' ')}</span>
                      {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {expanded && (
                      <div className="p-3 border-t border-border bg-card text-xs space-y-1.5">
                        {item.type === 'mcq' && !item.correct && <p className="text-destructive"><strong>Your answer:</strong> {item.userAns}</p>}
                        {item.type === 'mcq' && !item.correct && <p className="text-success"><strong>Correct answer:</strong> {item.correctAns}</p>}
                        <div className="flex items-start gap-1.5 text-muted-foreground"><Info className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" /><span>{item.explanation}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button onClick={onRestart} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
            Take Another Exam
          </button>
          <button onClick={onBackToMenu} className="px-6 py-3 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-all">
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
