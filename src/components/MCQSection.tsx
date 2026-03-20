import { useState } from 'react';
import { Flag, CheckCircle2, XCircle } from 'lucide-react';
import { MCQItem } from '@/data/mcq';
import { FeedbackDialog, FeedbackItem } from '@/components/FeedbackDialog';

interface MCQSectionProps {
  questions: MCQItem[];
  answers: Record<string, number | number[]>;
  flags: string[];
  onAnswer: (questionId: string, answer: number | number[]) => void;
  onToggleFlag: (questionId: string) => void;
  submitted: boolean;
  onSubmit: () => void;
}

function isMCQCorrect(q: MCQItem, ans: number | number[] | undefined): boolean {
  if (ans === undefined) return false;
  if (q.type === 'single') return ans === q.answer;
  const sel = [...(ans as number[])].sort();
  const cor = [...(q.answer as number[])].sort();
  return JSON.stringify(sel) === JSON.stringify(cor);
}

export function MCQSection({ questions, answers, flags, onAnswer, onToggleFlag, submitted, onSubmit }: MCQSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const question = questions[currentIndex];

  if (!question) return <p className="text-muted-foreground">No MCQ questions loaded.</p>;

  const currentAnswer = answers[question.id];
  const hasAnswered = currentAnswer !== undefined;
  const showInline = submitted && hasAnswered;

  const isCorrectOption = (idx: number) => {
    if (question.type === 'single') return question.answer === idx;
    return (question.answer as number[]).includes(idx);
  };

  const isSelected = (idx: number) => {
    if (!hasAnswered) return false;
    if (question.type === 'single') return currentAnswer === idx;
    return (currentAnswer as number[]).includes(idx);
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    if (question.type === 'single') {
      onAnswer(question.id, idx);
    } else {
      const prev = (currentAnswer as number[] | undefined) || [];
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      onAnswer(question.id, next);
    }
  };

  const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;

  const handleCheckAnswers = () => {
    onSubmit();
    setShowFeedback(true);
  };

  const feedbackItems: FeedbackItem[] = questions
    .filter(q => answers[q.id] !== undefined)
    .map(q => {
      const ans = answers[q.id];
      const correct = isMCQCorrect(q, ans);
      let userAnswer = '';
      let correctAnswer = '';

      if (q.type === 'single') {
        userAnswer = q.options[ans as number] || '—';
        correctAnswer = q.options[q.answer as number] || '—';
      } else {
        userAnswer = (ans as number[]).map(i => q.options[i]).join(', ') || '—';
        correctAnswer = (q.answer as number[]).map(i => q.options[i]).join(', ') || '—';
      }

      return { question: q.question, isCorrect: correct, userAnswer, correctAnswer, explanation: q.explanation };
    });

  const score = feedbackItems.filter(f => f.isCorrect).length;

  return (
    <div className="flex flex-col gap-4">
      <FeedbackDialog
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        title="MCQ Results"
        items={feedbackItems}
        score={score}
        total={feedbackItems.length}
      />

      {/* Navigation */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {questions.map((q, i) => {
          const answered = answers[q.id] !== undefined;
          const flagged = flags.includes(q.id);
          const correct = submitted && answered && isMCQCorrect(q, answers[q.id]);
          const wrong = submitted && answered && !isMCQCorrect(q, answers[q.id]);
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              aria-label={`MCQ ${i + 1}${flagged ? ', flagged' : ''}${answered ? ', answered' : ''}`}
              className={`relative w-9 h-9 rounded-md text-xs font-mono font-bold transition-all ${
                i === currentIndex
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                  : correct
                  ? 'bg-success/20 text-success border border-success/30'
                  : wrong
                  ? 'bg-destructive/20 text-destructive border border-destructive/30'
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
            aria-label={flags.includes(question.id) ? 'Unflag' : 'Flag for review'}
            className={`p-2 rounded-md transition-colors ${
              flags.includes(question.id) ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-accent'
            }`}
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-1">{question.question}</h3>
        {question.type === 'multiple' && <p className="text-xs text-muted-foreground mb-4 italic">Select all that apply</p>}

        <div className="flex flex-col gap-2 mt-4">
          {question.options.map((opt, idx) => {
            const selected = isSelected(idx);
            const correct = isCorrectOption(idx);

            let optionClass = 'bg-muted/50 border-border text-foreground hover:border-primary/40';
            if (showInline && selected && correct) optionClass = 'bg-success/10 border-success text-success';
            else if (showInline && selected && !correct) optionClass = 'bg-destructive/10 border-destructive text-destructive';
            else if (showInline && !selected && correct) optionClass = 'bg-success/5 border-success/50 text-success';
            else if (selected) optionClass = 'bg-primary/10 border-primary text-foreground';

            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={submitted}
                className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm text-left transition-all ${optionClass}`}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">{String.fromCharCode(65 + idx)}</span>
                <span className="flex-1">{opt}</span>
                {showInline && selected && correct && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
                {showInline && selected && !correct && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-30 transition-all">Previous</button>
          <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-30 transition-all">Next</button>
        </div>
      </div>

      {/* Check Answers */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <p className="text-xs text-muted-foreground font-mono">
          {answeredCount}/{questions.length} answered{submitted ? ' • Checked ✓' : ''}
        </p>
        <button
          onClick={submitted ? () => setShowFeedback(true) : handleCheckAnswers}
          disabled={answeredCount === 0}
          className={`px-6 py-3 rounded-lg text-sm font-bold transition-opacity shadow-lg disabled:opacity-40 ${
            submitted ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-accent text-accent-foreground hover:opacity-90'
          }`}
        >
          {submitted ? 'View Results' : `Check Answers (${answeredCount})`}
        </button>
      </div>
    </div>
  );
}
