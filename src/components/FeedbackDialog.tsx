import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Info, Trophy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface FeedbackItem {
  question: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  items: FeedbackItem[];
  score: number;
  total: number;
}

export function FeedbackDialog({ open, onClose, title, items, score, total }: FeedbackDialogProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= 75;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Score Banner */}
        <div className={`px-6 py-5 border-b ${passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
          <DialogHeader className="gap-1">
            <DialogTitle className="font-mono text-base flex items-center gap-2">
              <Trophy className={`h-5 w-5 ${passed ? 'text-success' : 'text-destructive'}`} />
              {title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-3xl font-bold font-mono ${passed ? 'text-success' : 'text-destructive'}`}>
                  {pct}%
                </span>
                <div className="text-sm text-muted-foreground">
                  <p>{score} of {total} correct</p>
                  <p className="text-xs">{passed ? 'Passing score achieved ✓' : 'Review the explanations below'}</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Question Results */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-6 space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-colors ${
                  item.isCorrect
                    ? 'border-success/20 bg-success/5'
                    : 'border-destructive/20 bg-destructive/5'
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  {item.isCorrect ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{item.question}</p>
                    {!item.isCorrect && item.userAnswer && item.correctAnswer && (
                      <div className="mt-1.5 text-xs space-y-0.5">
                        <p className="text-destructive/80">Your answer: {item.userAnswer}</p>
                        <p className="text-success/80">Correct: {item.correctAnswer}</p>
                      </div>
                    )}
                    <div className="mt-2 flex items-start gap-1.5">
                      <Info className="h-3 w-3 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Close & Review
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
