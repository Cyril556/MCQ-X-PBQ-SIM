import { CheckCircle2, XCircle, Trophy, Clock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
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

        {/* Question Review */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Question Review</h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[...pbqs.map((q,i) => ({ id: q.id, num: i+1, correct: isPBQCorrect(q, pbqAnswers[q.id]), type: 'pbq' as const })),
              ...mcqs.map((q,i) => ({ id: q.id, num: pbqs.length+i+1, correct: isMCQCorrect(q, mcqAnswers[q.id]), type: 'mcq' as const }))
            ].map(item => (
              <button key={item.id} onClick={() => setExpandedQ(expandedQ === item.id ? null : item.id)}
                className={`w-8 h-8 rounded text-[10px] font-mono font-bold transition-all ${
                  item.correct ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'
                } ${expandedQ === item.id ? 'ring-2 ring-primary' : ''}`}>
                {item.num}
              </button>
            ))}
          </div>

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {/* PBQ explanations */}
              {pbqs.map((q, i) => {
                const correct = isPBQCorrect(q, pbqAnswers[q.id]);
                const expanded = expandedQ === q.id;
                return (
                  <div key={q.id} className={`border rounded-lg overflow-hidden ${correct ? 'border-success/20' : 'border-destructive/20'}`}>
                    <button onClick={() => setExpandedQ(expanded ? null : q.id)}
                      className={`w-full flex items-center gap-2 p-3 text-left text-sm ${correct ? 'bg-success/5' : 'bg-destructive/5'}`}>
                      {correct ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" /> : <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                      <span className="text-xs font-mono text-muted-foreground mr-2">Q{i+1}</span>
                      <span className="flex-1 truncate text-foreground">{q.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{DOMAIN_LABELS[q.domain]?.split(' ').slice(0,3).join(' ')}</span>
                      {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {expanded && (
                      <div className="p-3 border-t border-border bg-card text-xs text-muted-foreground">
                        <div className="flex items-start gap-1.5"><Info className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" /><span>{q.explanation}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* MCQ explanations */}
              {mcqs.map((q, i) => {
                const ans = mcqAnswers[q.id];
                const correct = isMCQCorrect(q, ans);
                const expanded = expandedQ === q.id;
                let userAns = 'Not answered';
                let correctAns = '';
                if (q.type === 'single') {
                  if (ans !== undefined) userAns = q.options[ans as number] || '—';
                  correctAns = q.options[q.answer as number] || '—';
                } else {
                  if (ans !== undefined) userAns = (ans as number[]).map(idx => q.options[idx]).join(', ');
                  correctAns = (q.answer as number[]).map(idx => q.options[idx]).join(', ');
                }
                return (
                  <div key={q.id} className={`border rounded-lg overflow-hidden ${correct ? 'border-success/20' : 'border-destructive/20'}`}>
                    <button onClick={() => setExpandedQ(expanded ? null : q.id)}
                      className={`w-full flex items-center gap-2 p-3 text-left text-sm ${correct ? 'bg-success/5' : 'bg-destructive/5'}`}>
                      {correct ? <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" /> : <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                      <span className="text-xs font-mono text-muted-foreground mr-2">Q{pbqs.length+i+1}</span>
                      <span className="flex-1 truncate text-foreground">{q.question.substring(0,80)}...</span>
                      {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {expanded && (
                      <div className="p-3 border-t border-border bg-card text-xs space-y-1.5">
                        {!correct && <p className="text-destructive">Your answer: {userAns}</p>}
                        {!correct && <p className="text-success">Correct answer: {correctAns}</p>}
                        <div className="flex items-start gap-1.5 text-muted-foreground"><Info className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" /><span>{q.explanation}</span></div>
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
