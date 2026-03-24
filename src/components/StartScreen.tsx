import { useState } from 'react';
import { Shield, Clock, BookOpen, AlertTriangle, ChevronRight, Zap, Target, Brain, History } from 'lucide-react';
import { DOMAIN_LABELS, type Domain } from '@/data/questions';
import { loadHistory } from '@/lib/examHistory';
import { calculateReadiness } from '@/lib/readiness';

interface StartScreenProps {
  onStartExam: () => void;
  onStartStudy: (domain?: Domain) => void;
  onOpenReview: () => void;
  onOpenReadiness: () => void;
}

export function StartScreen({ onStartExam, onStartStudy, onOpenReview, onOpenReadiness }: StartScreenProps) {
  const [selectedDomain, setSelectedDomain] = useState<Domain | ''>('');
  const history = loadHistory();
  const readiness = history.length > 0 ? calculateReadiness() : null;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
              <Shield className="h-3.5 w-3.5" /> SY0-701
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
              CompTIA Security+
              <span className="block text-primary">Practice Exam</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Questions based on SY0-701 exam objectives as covered in Professor Messer's Security+ course
              and the Chapple/Seidl CompTIA Security+ Study Guide.
            </p>
          </div>

          {/* Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exam Mode */}
            <button onClick={onStartExam}
              className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Exam Mode</h2>
              <p className="text-xs text-muted-foreground mb-3">
                Timed 90-minute exam. No feedback until submission. Mirrors real exam conditions.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">90 questions</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">90 minutes</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">750/900 to pass</span>
              </div>
            </button>

            {/* Study Mode */}
            <div className="bg-card border border-border rounded-xl p-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Study Mode</h2>
              <p className="text-xs text-muted-foreground mb-3">
                Untimed. Instant feedback after each question. MCQ only, filterable by domain.
              </p>
              <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value as Domain | '')}
                className="w-full mb-2 px-3 py-2 text-xs bg-muted border border-border rounded-md text-foreground">
                <option value="">All Domains</option>
                {(Object.entries(DOMAIN_LABELS) as [Domain, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button onClick={() => onStartStudy(selectedDomain || undefined)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                Start Studying <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Exam Instructions */}
          <div className="bg-card/50 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Exam Instructions</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> 90 questions, 90 minutes. PBQs first (Q1–6), then MCQs.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> You <strong>cannot return</strong> to PBQs once you move past them.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> Flag questions for review. Navigate freely within MCQ section.</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> Passing score: 750 out of 900 (scaled scoring).</li>
              <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span> Per-question stopwatch tracks your time management.</li>
            </ul>
          </div>

          {/* Quick Stats / Secondary Actions */}
          {history.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onOpenReadiness}
                className="bg-card border border-border rounded-lg p-3 text-left hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">Readiness</span>
                </div>
                <span className={`text-xl font-bold font-mono ${readiness && readiness.overall >= 75 ? 'text-success' : 'text-warning'}`}>
                  {readiness?.overall || 0}%
                </span>
              </button>
              <button onClick={onOpenReview}
                className="bg-card border border-border rounded-lg p-3 text-left hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <History className="h-4 w-4 text-accent" />
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">History</span>
                </div>
                <span className="text-xl font-bold font-mono text-foreground">{history.length}</span>
                <span className="text-[10px] text-muted-foreground ml-1">attempts</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-muted-foreground font-mono">
            300+ questions • 5 PBQ types • Scaled scoring • Domain-weighted distribution
          </p>
        </div>
      </div>
    </div>
  );
}
