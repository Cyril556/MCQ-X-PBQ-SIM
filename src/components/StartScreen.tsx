import { useState } from 'react';
import { Shield, Clock, BookOpen, AlertTriangle, ChevronRight, Zap, Target, Brain, History } from 'lucide-react';
import { DOMAIN_LABELS, type Domain } from '@/data/questions';
import { loadHistory } from '@/lib/examHistory';
import { calculateReadiness } from '@/lib/readiness';

interface StartScreenProps {
  onStartExam: (examNumber: 1 | 2 | 3) => void;
  onStartStudy: (domain?: Domain) => void;
  onOpenReview: () => void;
  onOpenReadiness: () => void;
}

const EXAM_DESCRIPTIONS: Record<1|2|3, { subtitle: string; focus: string; badge: string }> = {
  1: { subtitle: 'Core Foundations', focus: 'Identity, Cryptography, Network & Cloud basics', badge: 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30' },
  2: { subtitle: 'Threats & Operations', focus: 'Attack types, IR, Vulnerability Mgmt & Governance', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  3: { subtitle: 'Architecture & Oversight', focus: 'Security architecture, Zero Trust, Risk & Compliance', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

export function StartScreen({ onStartExam, onStartStudy, onOpenReview, onOpenReadiness }: StartScreenProps) {
  const [selectedDomain, setSelectedDomain] = useState<Domain | ''>('');
  const history = loadHistory();
  const readiness = history.length > 0 ? calculateReadiness() : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 pt-8">

      {/* Header */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-8 h-8 text-cyber-blue" />
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">SY0-701</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">CompTIA Security+ Practice Exam</h1>
        <p className="text-sm text-muted-foreground">
          Questions based on SY0-701 exam objectives as covered in Professor Messer's Security+ course and the Chapple/Seidl CompTIA Security+ Study Guide.
        </p>
      </div>

      {/* Three Exam Cards */}
      <div className="w-full max-w-3xl mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" /> Exam Mode — choose a practice exam
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([1, 2, 3] as const).map(num => {
            const desc = EXAM_DESCRIPTIONS[num];
            return (
              <div
                key={num}
                onClick={() => onStartExam(num)}
                className="cursor-pointer group rounded-xl border border-border bg-card hover:border-cyber-blue/50 hover:bg-card/80 transition-all p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${desc.badge}`}>
                    Exam {num}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyber-blue transition-colors" />
                </div>
                <p className="text-sm font-semibold text-foreground">{desc.subtitle}</p>
                <p className="text-xs text-muted-foreground leading-snug">{desc.focus}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">90 questions</span>
                  <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">90 min</span>
                  <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">Randomized</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Mode */}
      <div className="w-full max-w-3xl mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold">Study Mode</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Untimed. Instant feedback after each question. MCQ only, filterable by domain.</p>
          <select
            value={selectedDomain}
            onChange={e => setSelectedDomain(e.target.value as Domain | '')}
            className="w-full mb-2 px-3 py-2 text-xs bg-muted border border-border rounded-md text-foreground"
          >
            <option value="">All Domains</option>
            {(Object.entries(DOMAIN_LABELS) as [Domain, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            onClick={() => onStartStudy(selectedDomain || undefined)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Start Studying <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exam Instructions */}
      <div className="w-full max-w-3xl mb-6">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exam Instructions</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 90 questions, 90 minutes. PBQs first (Q1–6), then MCQs.</li>
            <li>• Each exam uses a distinct question pool drawn from the 300+ question bank.</li>
            <li>• Answer options are randomized on every attempt.</li>
            <li>• You <strong>cannot return</strong> to PBQs once you move past them.</li>
            <li>• Flag questions for review. Navigate freely within MCQ section.</li>
            <li>• Passing score: 750 out of 900 (scaled scoring).</li>
          </ul>
        </div>
      </div>

      {/* Quick Stats */}
      {history.length > 0 && (
        <div className="w-full max-w-3xl mb-6 flex gap-3">
          <button
            onClick={onOpenReadiness}
            className="flex-1 rounded-xl border border-border bg-card p-4 text-left hover:border-success/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Readiness</span>
            </div>
            <span className={`text-2xl font-bold ${(readiness?.overall || 0) >= 75 ? 'text-success' : 'text-warning'}`}>
              {readiness?.overall || 0}%
            </span>
          </button>
          <button
            onClick={onOpenReview}
            className="flex-1 rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">History</span>
            </div>
            <span className="text-2xl font-bold">{history.length}</span>
            <span className="text-xs text-muted-foreground ml-1">attempts</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">
        300+ questions &bull; 5 PBQ types &bull; Scaled scoring &bull; Domain-weighted distribution
      </p>
    </div>
  );
}
