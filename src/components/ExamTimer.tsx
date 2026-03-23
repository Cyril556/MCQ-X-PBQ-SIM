import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, AlertTriangle, Timer } from 'lucide-react';

interface ExamTimerProps {
  durationMinutes: number;
  startTime: number;
  onExpire: () => void;
  paused?: boolean;
}

export function ExamTimer({ durationMinutes, startTime, onExpire, paused }: ExamTimerProps) {
  const totalSeconds = durationMinutes * 60;

  const getRemaining = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  }, [startTime, totalSeconds]);

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getRemaining, onExpire, paused]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = remaining <= 300 && remaining > 60;
  const isCritical = remaining <= 60;
  const pct = (remaining / totalSeconds) * 100;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-sm transition-all ${
      isCritical ? 'border-destructive bg-destructive/10 text-destructive animate-pulse' :
      isWarning ? 'border-warning bg-warning/10 text-warning' :
      'border-border bg-card text-foreground'
    }`}>
      {isCritical ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      <span className="font-bold">{display}</span>
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isCritical ? 'bg-destructive' : isWarning ? 'bg-warning' : 'bg-primary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface QuestionStopwatchProps {
  questionId: string;
  onTimeUpdate: (questionId: string, seconds: number) => void;
  running: boolean;
}

export function QuestionStopwatch({ questionId, onTimeUpdate, running }: QuestionStopwatchProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const questionRef = useRef(questionId);

  useEffect(() => {
    // Reset on question change
    if (questionRef.current !== questionId) {
      onTimeUpdate(questionRef.current, elapsed);
      questionRef.current = questionId;
      setElapsed(0);
      startRef.current = Date.now();
    }
  }, [questionId, elapsed, onTimeUpdate]);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed * 1000;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [running, questionId]);

  const secs = elapsed % 60;
  const mins = Math.floor(elapsed / 60);
  const isOver = elapsed > 60;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-all ${
      isOver ? 'text-warning bg-warning/10 border border-warning/30' : 'text-muted-foreground bg-muted/50'
    }`}>
      <Timer className="h-3 w-3" />
      <span>{String(mins).padStart(1, '0')}:{String(secs).padStart(2, '0')}</span>
      {isOver && <span className="text-[10px]">⚠</span>}
    </div>
  );
}
