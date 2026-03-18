import { Shield } from 'lucide-react';
import { ExamMode } from '@/lib/examState';

interface ExamHeaderProps {
  mode: ExamMode;
  onModeChange: (mode: ExamMode) => void;
  onReset: () => void;
  submitted: boolean;
  currentSet: string;
  onSetChange: (set: string) => void;
}

export function ExamHeader({
  mode,
  onModeChange,
  onReset,
  submitted,
  currentSet,
  onSetChange,
}: ExamHeaderProps) {
  const modes: { value: ExamMode; label: string }[] = [
    { value: 'pbq', label: 'PBQ' },
    { value: 'mcq', label: 'MCQ' },
    { value: 'both', label: 'Both' },
  ];

  const sets = ['A', 'B', 'C'];

  return (
    <header className="relative border-b border-border bg-card/80 backdrop-blur-sm scanline-overlay">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold font-mono tracking-tight text-foreground">
            SY0-701 <span className="text-primary">Trainer</span>
          </h1>
        </div>

        {/* Set selector */}
        {!submitted && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Set:</span>
            <nav className="flex rounded-lg border border-border overflow-hidden" role="tablist" aria-label="Question set">
              {sets.map((s) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={currentSet === s}
                  onClick={() => onSetChange(s)}
                  className={`px-3 py-1.5 text-sm font-mono font-bold transition-colors ${
                    currentSet === s
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Mode selector */}
        {!submitted && (
          <nav className="flex rounded-lg border border-border overflow-hidden" role="tablist" aria-label="Exam mode">
            {modes.map((m) => (
              <button
                key={m.value}
                role="tab"
                aria-selected={mode === m.value}
                onClick={() => onModeChange(m.value)}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  mode === m.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {m.label}
              </button>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {submitted && (
            <button
              onClick={onReset}
              className="px-4 py-1.5 rounded-md bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              New Attempt
            </button>
          )}
          {!submitted && (
            <button
              onClick={onReset}
              className="px-4 py-1.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
