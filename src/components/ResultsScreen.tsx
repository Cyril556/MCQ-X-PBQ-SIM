import { Trophy, Target, BarChart3 } from 'lucide-react';
import { PBQQuestion } from '@/data/pbq';
import { MCQItem } from '@/data/mcq';

interface ResultsScreenProps {
  pbqQuestions: PBQQuestion[];
  mcqQuestions: MCQItem[];
  pbqAnswers: Record<string, any>;
  mcqAnswers: Record<string, number | number[]>;
}

export function ResultsScreen({ pbqQuestions, mcqQuestions, pbqAnswers, mcqAnswers }: ResultsScreenProps) {
  // Score PBQ (only answered questions)
  let pbqCorrect = 0;
  let pbqAnswered = 0;
  pbqQuestions.forEach((q) => {
    const ans = pbqAnswers[q.id];
    if (!ans) return;
    let hasAnswer = false;
    let isCorrect = false;
    if (q.type === 'firewall' && q.correctActions) {
      hasAnswer = (ans as string[]).some((a: string) => a !== '');
      isCorrect = (ans as string[]).every((a: string, i: number) => a === q.correctActions![i]);
    } else if (q.type === 'matching' && q.matchingItems) {
      hasAnswer = Object.keys(ans).length > 0;
      isCorrect = q.matchingItems.every((it) => ans[it.source] === it.target);
    } else if (q.type === 'classification' && q.classificationItems) {
      hasAnswer = Object.keys(ans).length > 0;
      isCorrect = q.classificationItems.every((it) => ans[it.item] === it.category);
    } else if (q.type === 'placement' && q.placementItems) {
      hasAnswer = Object.keys(ans).length > 0;
      isCorrect = q.placementItems.every((it) => ans[it.item] === it.correctZone);
    } else if (q.type === 'ordering' && q.orderItems) {
      hasAnswer = (ans as string[]).length > 0;
      isCorrect = q.orderItems.every((it) => (ans as string[])[it.correctPosition] === it.step);
    }
    if (hasAnswer) {
      pbqAnswered++;
      if (isCorrect) pbqCorrect++;
    }
  });

  // Score MCQ (only answered questions)
  let mcqCorrect = 0;
  let mcqAnswered = 0;
  mcqQuestions.forEach((q) => {
    const ans = mcqAnswers[q.id];
    if (ans === undefined) return;
    mcqAnswered++;
    if (q.type === 'single') {
      if (ans === q.answer) mcqCorrect++;
    } else {
      const selected = [...(ans as number[])].sort();
      const correct = [...(q.answer as number[])].sort();
      if (JSON.stringify(selected) === JSON.stringify(correct)) mcqCorrect++;
    }
  });

  const totalAnswered = pbqAnswered + mcqAnswered;
  const totalCorrect = pbqCorrect + mcqCorrect;
  const overallPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Domain breakdown
  const domainMap: Record<string, { correct: number; total: number }> = {};
  pbqQuestions.forEach((q) => {
    if (!domainMap[q.domain]) domainMap[q.domain] = { correct: 0, total: 0 };
    domainMap[q.domain].total++;
    const ans = pbqAnswers[q.id];
    if (!ans) return;
    let isCorrect = false;
    if (q.type === 'firewall' && q.correctActions) isCorrect = (ans as string[]).every((a: string, i: number) => a === q.correctActions![i]);
    else if (q.type === 'matching' && q.matchingItems) isCorrect = q.matchingItems.every((it) => ans[it.source] === it.target);
    else if (q.type === 'classification' && q.classificationItems) isCorrect = q.classificationItems.every((it) => ans[it.item] === it.category);
    else if (q.type === 'placement' && q.placementItems) isCorrect = q.placementItems.every((it) => ans[it.item] === it.correctZone);
    else if (q.type === 'ordering' && q.orderItems) isCorrect = q.orderItems.every((it) => (ans as string[])[it.correctPosition] === it.step);
    if (isCorrect) domainMap[q.domain].correct++;
  });
  mcqQuestions.forEach((q) => {
    if (!domainMap[q.domain]) domainMap[q.domain] = { correct: 0, total: 0 };
    domainMap[q.domain].total++;
    const ans = mcqAnswers[q.id];
    if (ans === undefined) return;
    let isCorrect = false;
    if (q.type === 'single') isCorrect = ans === q.answer;
    else {
      const sel = (ans as number[]).sort();
      const cor = (q.answer as number[]).sort();
      isCorrect = JSON.stringify(sel) === JSON.stringify(cor);
    }
    if (isCorrect) domainMap[q.domain].correct++;
  });

  const passed = overallPct >= 75;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Hero result */}
      <div className={`text-center py-8 rounded-xl border ${passed ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
        <Trophy className={`h-12 w-12 mx-auto mb-3 ${passed ? 'text-success' : 'text-destructive'}`} />
        <h2 className="text-3xl font-bold font-mono text-foreground">{overallPct}%</h2>
        <p className={`text-lg font-semibold mt-1 ${passed ? 'text-success' : 'text-destructive'}`}>
          {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">Passing score: 75%</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ScoreCard icon={<Target className="h-5 w-5 text-primary" />} label="PBQ Score" value={`${pbqCorrect}/${pbqAnswered} answered`} />
        <ScoreCard icon={<BarChart3 className="h-5 w-5 text-accent" />} label="MCQ Score" value={`${mcqCorrect}/${mcqAnswered} answered`} />
      </div>

      {/* Domain breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">Domain Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(domainMap).map(([domain, { correct, total }]) => {
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
            return (
              <div key={domain}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{domain}</span>
                  <span className="font-mono text-muted-foreground">{correct}/{total} ({pct}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct >= 75 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold font-mono text-foreground">{value}</p>
      </div>
    </div>
  );
}
