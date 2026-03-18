import { Clock, Shield } from 'lucide-react';
import { ExamMode } from '@/lib/examState';

interface ExamHeaderProps {
  timerDisplay: string;
  isWarning: boolean;
  isCritical: boolean;
  mode: ExamMode;
  onModeChange: (mode: ExamMode) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitted: boolean;
}

export function ExamHeader({
  timerDisplay,
  isWarning,
  isCritical,
  mode,
  onModeChange,
  onSubmit,
  onReset,
  submitted,
}: ExamHeaderProps) {
  const modes: { value: ExamMode; label: string }[] = [
    { value: 'pbq', label: 'PBQ' },
    { value: 'mcq', label: 'MCQ' },
    { value: 'both', label: 'Both' },
  ];

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

        {/* Timer & actions */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 font-mono text-lg font-bold ${
              isCritical ? 'timer-critical' : isWarning ? 'timer-warning' : 'text-foreground'
            }`}
            aria-label={`Time remaining: ${timerDisplay}`}
            role="timer"
          >
            <Clock className="h-4 w-4" />
            {timerDisplay}
          </div>

          {!submitted ? (
            <button
              onClick={onSubmit}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={onReset}
              className="px-4 py-1.5 rounded-md bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              New Attempt
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
