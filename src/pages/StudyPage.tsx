import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Zap, RotateCcw, Flame, Shuffle, Target } from 'lucide-react';
import { NewExamEngine } from '@/components/NewExamEngine';
import {
  buildStudyQuestions, mcqSingle, mcqSelectTwo, shuffleOptions,
  DOMAIN_LABELS, type Domain, type MCQuestion,
} from '@/data/questions';
import { loadQuestionStats } from '@/lib/examHistory';

type Mode = 'tutor' | 'sprint' | 'failed' | 'weakest' | 'random';

export default function StudyPage() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState<Domain | ''>('');
  const [questions, setQuestions] = useState<MCQuestion[] | null>(null);

  const stats = useMemo(() => loadQuestionStats(), []);
  const failedIds = useMemo(
    () => new Set(Object.values(stats).filter((s) => s.type === 'mcq' && s.timesFailed > 0).map((s) => s.questionId)),
    [stats]
  );
  const allMcqs = useMemo(() => [...mcqSingle, ...mcqSelectTwo], []);

  const start = (mode: Mode) => {
    let qs: MCQuestion[] = [];
    switch (mode) {
      case 'tutor':
        qs = buildStudyQuestions(selectedDomain || undefined);
        break;
      case 'sprint':
        qs = buildStudyQuestions(selectedDomain || undefined).slice(0, 30);
        break;
      case 'random':
        qs = [...allMcqs].sort(() => Math.random() - 0.5).slice(0, 50).map(shuffleOptions);
        break;
      case 'failed':
        qs = allMcqs.filter((q) => failedIds.has(q.id)).map(shuffleOptions).sort(() => Math.random() - 0.5);
        break;
      case 'weakest': {
        const weakDomain = Object.values(stats)
          .reduce<Record<string, { c: number; t: number }>>((m, s) => {
            if (!m[s.domain]) m[s.domain] = { c: 0, t: 0 };
            m[s.domain].c += s.timesCorrect; m[s.domain].t += s.timesAttempted;
            return m;
          }, {});
        const sorted = Object.entries(weakDomain)
          .filter(([, v]) => v.t > 0)
          .map(([k, v]) => ({ k, pct: v.c / v.t }))
          .sort((a, b) => a.pct - b.pct);
        const target = sorted[0]?.k;
        qs = allMcqs.filter((q) => DOMAIN_LABELS[q.domain] === target).map(shuffleOptions).slice(0, 25);
        break;
      }
    }
    if (qs.length === 0) return;
    setQuestions(qs);
  };

  if (questions) {
    return (
      <NewExamEngine
        pbqs={[]}
        mcqs={questions}
        durationMinutes={0}
        isStudyMode
        onFinish={() => { setQuestions(null); navigate('/'); }}
      />
    );
  }

  const failedCount = failedIds.size;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-bold">Study Mode</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Domain filter (applies to Tutor & Sprint)</label>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value as Domain | '')}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-md text-foreground"
        >
          <option value="">All Domains</option>
          {(Object.entries(DOMAIN_LABELS) as [Domain, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ModeCard
          icon={<BookOpen className="w-5 h-5" />}
          title="Tutor Mode"
          desc="Untimed. Instant explanation after every answer."
          accent="accent"
          onStart={() => start('tutor')}
        />
        <ModeCard
          icon={<Zap className="w-5 h-5" />}
          title="Sprint (30 Q)"
          desc="Quick 30-question warm-up, instant feedback."
          accent="primary"
          onStart={() => start('sprint')}
        />
        <ModeCard
          icon={<Shuffle className="w-5 h-5" />}
          title="Random Shuffle"
          desc="50 fully randomized questions across all domains."
          accent="primary"
          onStart={() => start('random')}
        />
        <ModeCard
          icon={<Target className="w-5 h-5" />}
          title="Weakest Domain"
          desc="25 questions from your lowest-accuracy domain."
          accent="accent"
          onStart={() => start('weakest')}
          disabled={Object.keys(stats).length === 0}
          disabledReason="Answer some questions first."
        />
        <ModeCard
          icon={<RotateCcw className="w-5 h-5" />}
          title={`Retry Failed (${failedCount})`}
          desc="Drill questions you've previously gotten wrong."
          accent="destructive"
          onStart={() => start('failed')}
          disabled={failedCount === 0}
          disabledReason="No failed questions yet."
        />
        <ModeCard
          icon={<Flame className="w-5 h-5" />}
          title="PBQ Lab"
          desc="Drill every Performance-Based Question type."
          accent="accent"
          onStart={() => navigate('/pbq')}
        />
      </div>
    </div>
  );
}

function ModeCard({
  icon, title, desc, accent, onStart, disabled, disabledReason,
}: {
  icon: React.ReactNode; title: string; desc: string;
  accent: 'primary' | 'accent' | 'destructive';
  onStart: () => void; disabled?: boolean; disabledReason?: string;
}) {
  const ring = accent === 'primary' ? 'hover:border-primary/60' : accent === 'destructive' ? 'hover:border-destructive/60' : 'hover:border-accent/60';
  const iconBg = accent === 'primary' ? 'bg-primary/15 text-primary' : accent === 'destructive' ? 'bg-destructive/15 text-destructive' : 'bg-accent/15 text-accent';
  return (
    <button
      onClick={onStart}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={`text-left rounded-xl border border-border bg-card p-4 transition-colors flex items-start gap-3 ${ring} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold mb-0.5">{title}</div>
        <div className="text-xs text-muted-foreground leading-snug">{disabled && disabledReason ? disabledReason : desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
    </button>
  );
}
