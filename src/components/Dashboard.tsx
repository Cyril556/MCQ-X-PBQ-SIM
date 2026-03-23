import { useMemo } from 'react';
import { Shield, BookOpen, Clock, Brain, History, ChevronRight, Zap, Target, Award, BarChart3 } from 'lucide-react';
import { buildFullExams } from '@/lib/fullExams';
import { loadHistory, loadQuestionStats } from '@/lib/examHistory';
import { calculateReadiness } from '@/lib/readiness';
import { pbqSets } from '@/data/pbq';
import { mcqSets } from '@/data/mcq';

interface DashboardProps {
  onStartPractice: () => void;
  onStartExam: (examIndex: number) => void;
  onOpenReview: () => void;
  onOpenReadiness: () => void;
}

export function Dashboard({ onStartPractice, onStartExam, onOpenReview, onOpenReadiness }: DashboardProps) {
  const readiness = useMemo(() => calculateReadiness(), []);
  const history = useMemo(() => loadHistory(), []);
  const stats = useMemo(() => loadQuestionStats(), []);

  const totalQuestions = Object.keys(stats).length;
  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0
    ? Math.round(history.reduce((s, a) => s + a.percentage, 0) / totalAttempts)
    : 0;
  const passRate = totalAttempts > 0
    ? Math.round((history.filter(a => a.passed).length / totalAttempts) * 100)
    : 0;

  const totalPBQ = pbqSets.reduce((s, set) => s + set.questions.length, 0);
  const totalMCQ = mcqSets.reduce((s, set) => s + set.questions.length, 0);

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <header className="relative border-b border-border bg-card/80 backdrop-blur-sm scanline-overlay overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                SY0-701 <span className="text-primary">Trainer</span>
              </h1>
              <p className="text-xs text-muted-foreground">CompTIA Security+ Exam Preparation Platform</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl">
            Master the Security+ exam with {totalPBQ} performance-based questions, {totalMCQ} multiple-choice questions,
            full-length timed exams, and AI-powered readiness tracking.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Quick stats */}
        {totalAttempts > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Target className="h-4 w-4 text-primary" />} label="Readiness" value={`${readiness.overall}%`} sub={readiness.readyForExam ? 'Exam Ready' : 'Keep Practicing'} />
            <StatCard icon={<BarChart3 className="h-4 w-4 text-accent" />} label="Avg Score" value={`${avgScore}%`} sub={`${totalAttempts} attempts`} />
            <StatCard icon={<Award className="h-4 w-4 text-success" />} label="Pass Rate" value={`${passRate}%`} sub={`${history.filter(a => a.passed).length} passed`} />
            <StatCard icon={<Zap className="h-4 w-4 text-warning" />} label="Questions" value={`${totalQuestions}`} sub="unique attempted" />
          </div>
        )}

        {/* Main actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Practice Mode */}
          <button onClick={onStartPractice}
            className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-accent" />
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Practice Mode</h2>
            <p className="text-sm text-muted-foreground">
              Study at your own pace. Choose PBQ, MCQ, or both. Filter by domain and set.
              No timer pressure — focus on learning.
            </p>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">{pbqSets.length} PBQ sets</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{mcqSets.length} MCQ sets</span>
            </div>
          </button>

          {/* Full Exams */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Full Practice Exams</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Timed 90-minute exams with integrated PBQ + MCQ. Per-question stopwatch for time management.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => onStartExam(0)}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-muted/50 hover:border-primary/50 hover:bg-muted transition-all">
                <div>
                  <span className="text-sm font-bold text-foreground">Practice Exam 1</span>
                  <p className="text-xs text-muted-foreground">5 PBQ + 80 MCQ • Sets A–C • 90 min</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button onClick={() => onStartExam(1)}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-muted/50 hover:border-primary/50 hover:bg-muted transition-all">
                <div>
                  <span className="text-sm font-bold text-foreground">Practice Exam 2</span>
                  <p className="text-xs text-muted-foreground">5 PBQ + MCQ • Sets D–F • 90 min</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={onOpenReadiness}
            className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Exam Readiness</h3>
                  <p className="text-xs text-muted-foreground">AI-powered readiness score & recommendations</p>
                </div>
              </div>
              {totalAttempts > 0 && (
                <span className={`text-lg font-bold font-mono ${readiness.overall >= 75 ? 'text-success' : 'text-warning'}`}>
                  {readiness.overall}%
                </span>
              )}
            </div>
          </button>

          <button onClick={onOpenReview}
            className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-accent" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Review & History</h3>
                  <p className="text-xs text-muted-foreground">Missed questions log, filters, and past attempts</p>
                </div>
              </div>
              {totalAttempts > 0 && (
                <span className="text-xs text-muted-foreground font-mono">{totalAttempts} attempts</span>
              )}
            </div>
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Platform Features</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: '90-min Timed Exams', desc: 'Real exam conditions' },
              { label: 'Per-Question Timer', desc: '60s target pace' },
              { label: 'Drag & Drop PBQs', desc: 'Interactive scenarios' },
              { label: 'Readiness Algorithm', desc: '6 weighted factors' },
              { label: 'Missed Q Review', desc: 'Filter & track progress' },
              { label: 'Domain Filtering', desc: 'Focus weak areas' },
              { label: 'Keyboard Shortcuts', desc: 'J/K, F, 1-4 keys' },
              { label: 'Confidence Rating', desc: 'Rate your certainty' },
              { label: 'Score Trending', desc: 'Track improvement' },
              { label: 'Detailed Feedback', desc: 'Explanations per Q' },
            ].map(f => (
              <div key={f.label} className="bg-muted/30 rounded-lg px-3 py-2.5 border border-border/50">
                <p className="text-xs font-medium text-foreground">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center mt-8">
        <p className="text-xs text-muted-foreground font-mono">
          Security+ SY0-701 Trainer • {totalPBQ} PBQs • {totalMCQ} MCQs • Built for exam success
        </p>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground font-mono uppercase">{label}</span>
      </div>
      <p className="text-xl font-bold font-mono text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
