import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { NewExamEngine } from '@/components/NewExamEngine';
import { buildStudyQuestions, mcqSingle, mcqSelectTwo, shuffleOptions, DOMAIN_LABELS, type Domain, type MCQuestion } from '@/data/questions';
import { loadQuestionStats } from '@/lib/examHistory';

export default function StudyPage() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState<Domain | ''>('');
  const [questions, setQuestions] = useState<MCQuestion[] | null>(null);

  const start = (domain?: Domain) => setQuestions(buildStudyQuestions(domain));

  const startFailed = () => {
    const stats = loadQuestionStats();
    const failedIds = new Set(
      Object.values(stats).filter((s) => s.type === 'mcq' && s.timesFailed > 0).map((s) => s.questionId)
    );
    const all = [...mcqSingle, ...mcqSelectTwo];
    const failedQs = all.filter((q) => failedIds.has(q.id)).map(shuffleOptions);
    if (failedQs.length === 0) return;
    setQuestions(failedQs.sort(() => Math.random() - 0.5));
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

  const failedCount = Object.values(loadQuestionStats()).filter(
    (s) => s.type === 'mcq' && s.timesFailed > 0
  ).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-accent" />
        <h1 className="text-2xl font-bold">Study Mode</h1>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <p className="text-sm text-muted-foreground mb-4">
          Untimed practice with instant feedback after each answer. Filter by SY0-701 domain or run through everything.
        </p>
        <label className="text-xs font-mono uppercase text-muted-foreground mb-1 block">Domain</label>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value as Domain | '')}
          className="w-full mb-3 px-3 py-2 text-sm bg-muted border border-border rounded-md text-foreground"
        >
          <option value="">All Domains</option>
          {(Object.entries(DOMAIN_LABELS) as [Domain, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => start(selectedDomain || undefined)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-bold hover:opacity-90"
        >
          Start studying <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className={`rounded-xl border p-5 ${failedCount > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-border bg-card opacity-70'}`}>
        <h2 className="text-sm font-semibold mb-2">Retry failed questions</h2>
        <p className="text-xs text-muted-foreground mb-3">
          {failedCount > 0
            ? `${failedCount} unique question${failedCount === 1 ? '' : 's'} you've missed.`
            : 'No missed questions yet — anything you get wrong on an exam will appear here.'}
        </p>
        <button
          onClick={startFailed}
          disabled={failedCount === 0}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        >
          Practice {failedCount} failed <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
