import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight } from 'lucide-react';
import { NewExamEngine } from '@/components/NewExamEngine';
import { buildExam, type ExamNumber } from '@/data/questions';

const EXAM_DESCRIPTIONS: Record<ExamNumber, { subtitle: string; focus: string; badge: string }> = {
  1: { subtitle: 'Core Foundations', focus: 'Identity, Cryptography, Network & Cloud basics', badge: 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30' },
  2: { subtitle: 'Threats & Operations', focus: 'Attack types, IR, Vulnerability Mgmt & Governance', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  3: { subtitle: 'Architecture & Oversight', focus: 'Security architecture, Zero Trust, Risk & Compliance', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  4: { subtitle: 'Cloud & Hybrid Defense', focus: 'Cloud security, virtualization, secure baselines', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  5: { subtitle: 'Comprehensive Mastery', focus: 'Mixed difficulty across all five SY0-701 domains', badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
};

export default function ExamPage() {
  const navigate = useNavigate();
  const [examData, setExamData] = useState<ReturnType<typeof buildExam> | null>(null);

  if (examData) {
    return (
      <NewExamEngine
        pbqs={examData.pbqs}
        mcqs={examData.mcqs}
        examNumber={examData.examNumber}
        durationMinutes={90}
        onFinish={() => { setExamData(null); navigate('/'); }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold">Practice Exams</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Five distinct, domain-weighted exams. 90 questions in 90 minutes. Passing score 750/900 (scaled).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {([1, 2, 3, 4, 5] as const).map((num) => {
          const desc = EXAM_DESCRIPTIONS[num];
          return (
            <button
              key={num}
              onClick={() => setExamData(buildExam(num))}
              className="cursor-pointer group rounded-xl border border-border bg-card hover:border-primary/50 transition-all p-4 flex flex-col gap-2 text-left"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${desc.badge}`}>
                  Exam {num}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <p className="text-sm font-semibold">{desc.subtitle}</p>
              <p className="text-xs text-muted-foreground leading-snug">{desc.focus}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">90 questions</span>
                <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">90 min</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
