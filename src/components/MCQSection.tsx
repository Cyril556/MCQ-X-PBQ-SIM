import { useState } from 'react';
import { Flag, CheckCircle2, XCircle, Info } from 'lucide-react';
import { MCQItem } from '@/data/mcq';

interface MCQSectionProps {
  questions: MCQItem[];
  answers: Record<string, number | number[]>;
  flags: string[];
  onAnswer: (questionId: string, answer: number | number[]) => void;
  onToggleFlag: (questionId: string) => void;
  submitted: boolean;
  onSubmit: () => void;
}

export function MCQSection({ questions, answers, flags, onAnswer, onToggleFlag, submitted, onSubmit }: MCQSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const question = questions[currentIndex];

  if (!question) return <p className="text-muted-foreground">No MCQ questions loaded.</p>;

  const currentAnswer = answers[question.id];
  const hasAnswered = currentAnswer !== undefined;

  const isCorrectOption = (optIdx: number) => {
    if (question.type === 'single') return question.answer === optIdx;
    return (question.answer as number[]).includes(optIdx);
  };

  const isSelected = (optIdx: number) => {
    if (!hasAnswered) return false;
    if (question.type === 'single') return currentAnswer === optIdx;
    return (currentAnswer as number[]).includes(optIdx);
  };

  const handleSelect = (optIdx: number) => {
    if (submitted) return;
    if (question.type === 'single') {
      onAnswer(question.id, optIdx);
    } else {
      const prev = (currentAnswer as number[] | undefined) || [];
      const next = prev.includes(optIdx) ? prev.filter((i) => i !== optIdx) : [...prev, optIdx];
      onAnswer(question.id, next);
    }
  };

  // Only show feedback for answered questions after submission
  const showFeedback = submitted && hasAnswered;

  const isCurrentCorrect = () => {
    if (!hasAnswered) return false;
    if (question.type === 'single') return currentAnswer === question.answer;
    const sel = [...(currentAnswer as number[])].sort();
    const cor = [...(question.answer as number[])].sort();
    return JSON.stringify(sel) === JSON.stringify(cor);
  };

  const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {questions.map((q, i) => {
          const answered = answers[q.id] !== undefined;
          const flagged = flags.includes(q.id);
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              aria-label={`MCQ Question ${i + 1}${flagged ? ', flagged' : ''}${answered ? ', answered' : ''}`}
              className={`relative w-9 h-9 rounded-md text-xs font-mono font-bold transition-all ${
                i === currentIndex
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                  : answered
                  ? 'bg-muted text-foreground'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
              }`}
            >
              {i + 1}
              {flagged && <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-2">
          <span className="text-xs font-mono text-primary uppercase tracking-wider">{question.domain}</span>
          <button
            onClick={() => onToggleFlag(question.id)}
            aria-label={flags.includes(question.id) ? 'Unflag question' : 'Flag for review'}
            className={`p-2 rounded-md transition-colors ${
              flags.includes(question.id) ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent'
            }`}
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-1">{question.question}</h3>
        {question.type === 'multiple' && (
          <p className="text-xs text-muted-foreground mb-4 italic">Select all that apply</p>
        )}

        <div className="flex flex-col gap-2 mt-4">
          {question.options.map((opt, idx) => {
            const selected = isSelected(idx);
            const correct = isCorrectOption(idx);

            let optionClass = 'bg-muted/50 border-border text-foreground hover:border-primary/40';
            if (showFeedback && selected && correct) {
              optionClass = 'bg-success/10 border-success text-success animate-pulse-success';
            } else if (showFeedback && selected && !correct) {
              optionClass = 'bg-destructive/10 border-destructive text-destructive animate-shake';
            } else if (showFeedback && !selected && correct) {
              optionClass = 'bg-success/5 border-success/50 text-success';
            } else if (selected) {
              optionClass = 'bg-primary/10 border-primary text-foreground';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={submitted}
                className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm text-left transition-all ${optionClass}`}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {showFeedback && selected && correct && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
                {showFeedback && selected && !correct && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation - only for answered questions */}
        {showFeedback && (
          <div className={`mt-4 p-4 rounded-md border animate-fade-in ${
            isCurrentCorrect() ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-accent" />
              <p className="text-xs font-mono text-accent uppercase font-bold">
                {isCurrentCorrect() ? '✓ Correct' : '✗ Incorrect'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        {/* Unanswered notice when submitted */}
        {submitted && !hasAnswered && (
          <div className="mt-4 p-4 rounded-md border border-border bg-muted/30 animate-fade-in">
            <p className="text-xs font-mono text-muted-foreground">This question was not answered and was not scored.</p>
          </div>
        )}

        {/* Prev / Next */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-30 transition-all"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-30 transition-all"
          >
            Next
          </button>
        </div>
      </div>

      {/* Check Answers button */}
      {!submitted && (
        <div className="flex flex-col items-center gap-2 mt-2">
          <p className="text-xs text-muted-foreground font-mono">
            {answeredCount}/{questions.length} answered • Only answered questions will be checked
          </p>
          <button
            onClick={onSubmit}
            disabled={answeredCount === 0}
            className="px-6 py-3 rounded-lg bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-40"
          >
            Check Answers ({answeredCount})
          </button>
        </div>
      )}
    </div>
  );
}
