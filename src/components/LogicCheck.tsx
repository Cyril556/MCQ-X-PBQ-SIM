import { useState } from 'react';
import { Brain, CheckCircle2, XCircle, ChevronRight, Trophy } from 'lucide-react';

export interface LogicCheckQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  userIndex: number;
  explanation: string;
  domain: string;
}

interface LogicCheckProps {
  questions: LogicCheckQuestion[];
  onComplete: () => void;
  onSkip: () => void;
}

export function LogicCheck({ questions, onComplete, onSkip }: LogicCheckProps) {
  const [current, setCurrent] = useState(0);
  const [optionReasons, setOptionReasons] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);

  if (questions.length === 0) {
    onComplete();
    return null;
  }

  const q = questions[current];
  const wrongOptions = q.options
    .map((opt, i) => ({ opt, i }))
    .filter(({ i }) => i !== q.correctIndex && i !== q.userIndex);
  // Also include userIndex if wrong
  const allIncorrectOptions = q.options
    .map((opt, i) => ({ opt, i }))
    .filter(({ i }) => i !== q.correctIndex);

  const key = (qi: number, optIdx: number) => `${qi}-${optIdx}`;

  const handleSubmit = () => {
    const missing = allIncorrectOptions
      .map(({ i }) => i)
      .filter(i => !(optionReasons[key(current, i)] || '').trim());
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    setSubmitted(true);
  };

  const handleNext = () => {
    setCompleted(prev => [...prev, current]);
    if (current + 1 >= questions.length) {
      onComplete();
    } else {
      setCurrent(current + 1);
      setSubmitted(false);
      setErrors([]);
    }
  };

  const progress = Math.round((completed.length / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            <span className="text-sm font-bold text-accent uppercase tracking-wider">Logic Check</span>
            <span className="text-xs text-muted-foreground ml-1">{current + 1} / {questions.length}</span>
          </div>
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Skip Logic Check
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full mb-5">
          <div
            className="h-1 bg-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {/* Domain tag */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive/10 text-destructive uppercase tracking-wider">
            {q.domain}
          </span>

          {/* Question */}
          <p className="text-sm font-semibold mt-3 mb-1 text-foreground">{q.questionText}</p>

          {/* Prompt */}
          <p className="text-xs text-muted-foreground mb-5">
            You answered <span className="text-destructive font-semibold">&ldquo;{q.options[q.userIndex]}&rdquo;</span>.
            The correct answer is <span className="text-success font-semibold">&ldquo;{q.options[q.correctIndex]}&rdquo;</span>.<br />
            <span className="font-medium text-foreground">Now explain why each wrong option is incorrect:</span>
          </p>

          {/* Correct answer reminder */}
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-success/10 border border-success/30">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-success mb-0.5">Why the correct answer is right:</p>
              <p className="text-xs text-foreground">{q.explanation}</p>
            </div>
          </div>

          {/* Wrong options — user must explain each */}
          <div className="space-y-4">
            {allIncorrectOptions.map(({ opt, i }) => {
              const k = key(current, i);
              const isError = errors.includes(i);
              const isUserPick = i === q.userIndex;
              return (
                <div key={i} className={`rounded-lg border p-3 ${isUserPick ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-muted/30'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <XCircle className={`h-4 w-4 shrink-0 mt-0.5 ${isUserPick ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <p className="text-xs font-medium text-foreground">
                      {isUserPick && <span className="text-destructive font-bold">[Your answer] </span>}
                      &ldquo;{opt}&rdquo;
                    </p>
                  </div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-1">
                    Why is this wrong?
                  </label>
                  <textarea
                    disabled={submitted}
                    value={optionReasons[k] || ''}
                    onChange={e => setOptionReasons(prev => ({ ...prev, [k]: e.target.value }))}
                    placeholder="Type your reasoning here..."
                    rows={2}
                    className={`w-full text-xs bg-background border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 transition-all ${
                      isError && !(optionReasons[k] || '').trim()
                        ? 'border-destructive ring-1 ring-destructive'
                        : submitted
                        ? 'border-success/40 opacity-70'
                        : 'border-border focus:ring-primary/40'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {errors.length > 0 && !submitted && (
            <p className="text-xs text-destructive mt-2">Fill in reasoning for ALL wrong options before continuing.</p>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-5">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-all ml-auto"
              >
                Confirm Reasoning
              </button>
            ) : (
              <>
                <p className="text-xs text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Reasoning locked in.
                </p>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all"
                >
                  {current + 1 >= questions.length ? (
                    <><Trophy className="h-4 w-4" /> Finish</>
                  ) : (
                    <>Next <ChevronRight className="h-4 w-4" /></>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
