import { useState } from 'react';
import { PBQQuestion } from '@/data/pbq';
import { Flag, CheckCircle2, XCircle, Info, GripVertical } from 'lucide-react';

interface PBQSectionProps {
  questions: PBQQuestion[];
  answers: Record<string, any>;
  flags: string[];
  onAnswer: (questionId: string, answer: any) => void;
  onToggleFlag: (questionId: string) => void;
  submitted: boolean;
  onSubmit: () => void;
}

export function PBQSection({ questions, answers, flags, onAnswer, onToggleFlag, submitted, onSubmit }: PBQSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const question = questions[currentIndex];

  const answeredCount = questions.filter(q => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.some(a => a !== '');
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    return true;
  }).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Question navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {questions.map((q, i) => {
          const answered = !!answers[q.id];
          const flagged = flags.includes(q.id);
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              aria-label={`PBQ Question ${i + 1}${flagged ? ', flagged' : ''}${answered ? ', answered' : ''}`}
              className={`relative w-9 h-9 rounded-md text-xs font-mono font-bold transition-all ${
                i === currentIndex
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                  : answered
                  ? 'bg-muted text-foreground'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
              }`}
            >
              {i + 1}
              {flagged && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Question card */}
      {question && (
        <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-mono text-primary uppercase tracking-wider">{question.domain}</span>
              <h3 className="text-lg font-bold text-foreground mt-1">{question.title}</h3>
            </div>
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
          <p className="text-sm text-muted-foreground mb-6">{question.description}</p>

          {question.type === 'firewall' && (
            <FirewallPBQ question={question} answer={answers[question.id] || []} onAnswer={(a) => onAnswer(question.id, a)} submitted={submitted} />
          )}
          {question.type === 'matching' && (
            <MatchingPBQ question={question} answer={answers[question.id] || {}} onAnswer={(a) => onAnswer(question.id, a)} submitted={submitted} />
          )}
          {question.type === 'classification' && (
            <ClassificationPBQ question={question} answer={answers[question.id] || {}} onAnswer={(a) => onAnswer(question.id, a)} submitted={submitted} />
          )}
          {question.type === 'placement' && (
            <PlacementPBQ question={question} answer={answers[question.id] || {}} onAnswer={(a) => onAnswer(question.id, a)} submitted={submitted} />
          )}
          {question.type === 'ordering' && (
            <OrderingPBQ question={question} answer={answers[question.id] || []} onAnswer={(a) => onAnswer(question.id, a)} submitted={submitted} />
          )}

          {/* Explanation after submission */}
          {submitted && question.explanation && (
            <div className="mt-4 p-4 rounded-md border border-accent/30 bg-accent/5 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-accent" />
                <p className="text-xs font-mono text-accent uppercase font-bold">Explanation</p>
              </div>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
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
      )}

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

/* ---- Firewall sub-component ---- */
function FirewallPBQ({ question, answer, onAnswer, submitted }: { question: PBQQuestion; answer: string[]; onAnswer: (a: string[]) => void; submitted: boolean }) {
  if (!question.firewallRules) return null;
  const rules = question.firewallRules;
  const currentAnswers: string[] = answer.length ? answer : rules.map(() => '');

  const setAction = (idx: number, action: string) => {
    const next = [...currentAnswers];
    next[idx] = action;
    onAnswer(next);
  };

  // Only check rules that have been answered
  const hasAnswer = currentAnswers.some(a => a !== '');

  return (
    <div>
      {question.firewallScenario && (
        <div className="bg-muted/50 border border-border rounded-md p-4 mb-4 text-sm text-muted-foreground font-mono">
          {question.firewallScenario}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">Rule</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">Source</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">Dest</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">Port</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">Proto</th>
              <th className="text-left py-2 px-3 text-muted-foreground font-mono text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, idx) => {
              const ruleAnswered = currentAnswers[idx] !== '';
              const isCorrect = submitted && ruleAnswered && question.correctActions && currentAnswers[idx] === question.correctActions[idx];
              const isWrong = submitted && ruleAnswered && question.correctActions && currentAnswers[idx] !== question.correctActions[idx];
              return (
                <tr
                  key={rule.ruleId}
                  className={`border-b border-border/50 ${
                    isCorrect ? 'animate-pulse-success bg-success/5' : isWrong ? 'animate-shake bg-destructive/5' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-mono">{rule.ruleId}</td>
                  <td className="py-2 px-3 font-mono text-xs">{rule.sourceIP}</td>
                  <td className="py-2 px-3 font-mono text-xs">{rule.destIP}</td>
                  <td className="py-2 px-3 font-mono">{rule.port}</td>
                  <td className="py-2 px-3 font-mono">{rule.protocol}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      {['ALLOW', 'DENY'].map((action) => (
                        <button
                          key={action}
                          disabled={submitted}
                          onClick={() => setAction(idx, action)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            currentAnswers[idx] === action
                              ? action === 'ALLOW'
                                ? 'bg-success text-success-foreground'
                                : 'bg-destructive text-destructive-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                      {submitted && ruleAnswered && question.correctActions && (
                        isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-success ml-1" />
                        ) : isWrong ? (
                          <span className="flex items-center gap-1 ml-1">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-xs text-success font-mono">{question.correctActions[idx]}</span>
                          </span>
                        ) : null
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- Matching sub-component (drag-and-drop) ---- */
function MatchingPBQ({ question, answer, onAnswer, submitted }: { question: PBQQuestion; answer: Record<string, string>; onAnswer: (a: Record<string, string>) => void; submitted: boolean }) {
  const items = question.matchingItems || [];
  const targets = question.matchingTargets || [];
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleDrop = (target: string) => {
    if (!dragItem || submitted) return;
    onAnswer({ ...answer, [dragItem]: target });
    setDragItem(null);
  };

  const assignedSources = Object.keys(answer);
  const unassigned = items.filter((it) => !assignedSources.includes(it.source));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Items to match</h4>
        <div className="flex flex-col gap-2">
          {unassigned.map((item) => (
            <div
              key={item.source}
              draggable={!submitted}
              onDragStart={() => setDragItem(item.source)}
              onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-4 py-2 rounded-md border border-border bg-muted text-sm font-medium text-foreground ${dragItem === item.source ? 'dragging' : ''}`}
            >
              {item.source}
            </div>
          ))}
          {unassigned.length === 0 && !submitted && (
            <p className="text-xs text-muted-foreground italic">All items assigned ✓</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">Categories</h4>
        <div className="flex flex-col gap-3">
          {targets.map((target) => {
            const assignedHere = items.filter((it) => answer[it.source] === target);
            return (
              <div
                key={target}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(target); }}
                className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[60px]"
              >
                <p className="text-xs font-mono text-primary mb-2">{target}</p>
                <div className="flex flex-wrap gap-1">
                  {assignedHere.map((it) => {
                    const correct = submitted && it.target === target;
                    const wrong = submitted && it.target !== target;
                    return (
                      <span key={it.source} className={`px-2 py-1 rounded text-xs font-medium ${correct ? 'bg-success/20 text-success animate-pulse-success' : wrong ? 'bg-destructive/20 text-destructive animate-shake' : 'bg-card text-foreground border border-border'}`}>
                        {it.source}
                        {submitted && wrong && <span className="ml-1 text-success font-mono text-[10px]">→ {it.target}</span>}
                        {!submitted && (
                          <button onClick={() => { const next = { ...answer }; delete next[it.source]; onAnswer(next); }} className="ml-1 text-muted-foreground hover:text-foreground" aria-label={`Remove ${it.source}`}>×</button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---- Classification sub-component ---- */
function ClassificationPBQ({ question, answer, onAnswer, submitted }: { question: PBQQuestion; answer: Record<string, string>; onAnswer: (a: Record<string, string>) => void; submitted: boolean }) {
  const items = question.classificationItems || [];
  const categories = question.classificationCategories || [];
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleDrop = (category: string) => {
    if (!dragItem || submitted) return;
    onAnswer({ ...answer, [dragItem]: category });
    setDragItem(null);
  };

  const assignedItems = Object.keys(answer);
  const unassigned = items.filter((it) => !assignedItems.includes(it.item));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Items to classify</h4>
        <div className="flex flex-wrap gap-2">
          {unassigned.map((it) => (
            <div key={it.item} draggable={!submitted} onDragStart={() => setDragItem(it.item)} onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium text-foreground ${dragItem === it.item ? 'dragging' : ''}`}>
              {it.item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => {
          const assignedHere = items.filter((it) => answer[it.item] === cat);
          return (
            <div key={cat}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(cat); }}
              className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[80px]">
              <p className="text-xs font-mono text-primary mb-2 font-bold">{cat}</p>
              <div className="flex flex-col gap-1">
                {assignedHere.map((it) => {
                  const correct = submitted && it.category === cat;
                  const wrong = submitted && it.category !== cat;
                  return (
                    <span key={it.item} className={`px-2 py-1 rounded text-xs ${correct ? 'bg-success/20 text-success' : wrong ? 'bg-destructive/20 text-destructive' : 'bg-card text-foreground border border-border'}`}>
                      {it.item}
                      {submitted && wrong && <span className="ml-1 text-success font-mono text-[10px]">→ {it.category}</span>}
                      {!submitted && (
                        <button onClick={() => { const n = { ...answer }; delete n[it.item]; onAnswer(n); }} className="ml-1 text-muted-foreground hover:text-foreground" aria-label={`Remove ${it.item}`}>×</button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Placement sub-component ---- */
function PlacementPBQ({ question, answer, onAnswer, submitted }: { question: PBQQuestion; answer: Record<string, string>; onAnswer: (a: Record<string, string>) => void; submitted: boolean }) {
  const items = question.placementItems || [];
  const zones = question.placementZones || [];
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleDrop = (zone: string) => {
    if (!dragItem || submitted) return;
    onAnswer({ ...answer, [dragItem]: zone });
    setDragItem(null);
  };

  const assignedItems = Object.keys(answer);
  const unassigned = items.filter((it) => !assignedItems.includes(it.item));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Security controls</h4>
        <div className="flex flex-wrap gap-2">
          {unassigned.map((it) => (
            <div key={it.item} draggable={!submitted} onDragStart={() => setDragItem(it.item)} onDragEnd={() => setDragItem(null)}
              className={`draggable-item px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium text-foreground ${dragItem === it.item ? 'dragging' : ''}`}>
              {it.item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {zones.map((zone) => {
          const assignedHere = items.filter((it) => answer[it.item] === zone);
          return (
            <div key={zone}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleDrop(zone); }}
              className="drop-zone border-2 border-dashed border-border rounded-lg p-3 min-h-[100px]">
              <p className="text-xs font-mono text-accent mb-2 font-bold">{zone}</p>
              <div className="flex flex-col gap-1">
                {assignedHere.map((it) => {
                  const correct = submitted && it.correctZone === zone;
                  const wrong = submitted && it.correctZone !== zone;
                  return (
                    <span key={it.item} className={`px-2 py-1 rounded text-xs ${correct ? 'bg-success/20 text-success' : wrong ? 'bg-destructive/20 text-destructive' : 'bg-card text-foreground border border-border'}`}>
                      {it.item}
                      {submitted && wrong && <span className="ml-1 text-success font-mono text-[10px]">→ {it.correctZone}</span>}
                      {!submitted && (
                        <button onClick={() => { const n = { ...answer }; delete n[it.item]; onAnswer(n); }} className="ml-1 text-muted-foreground hover:text-foreground" aria-label={`Remove ${it.item}`}>×</button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Ordering sub-component (new!) ---- */
function OrderingPBQ({ question, answer, onAnswer, submitted }: { question: PBQQuestion; answer: string[]; onAnswer: (a: string[]) => void; submitted: boolean }) {
  const items = question.orderItems || [];
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Initialize with shuffled order if no answer yet
  const currentOrder: string[] = answer.length > 0 ? answer : items.map(it => it.step).sort(() => Math.random() - 0.5);

  if (answer.length === 0 && items.length > 0) {
    // Auto-initialize with shuffled order
    setTimeout(() => onAnswer(currentOrder), 0);
  }

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || submitted) return;
    const next = [...currentOrder];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    onAnswer(next);
    setDragIdx(null);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Drag to reorder</h4>
      {currentOrder.map((step, idx) => {
        const correctItem = items.find(it => it.step === step);
        const isCorrectPosition = submitted && correctItem && correctItem.correctPosition === idx;
        const isWrongPosition = submitted && correctItem && correctItem.correctPosition !== idx;

        return (
          <div
            key={step}
            draggable={!submitted}
            onDragStart={() => setDragIdx(idx)}
            onDragEnd={() => setDragIdx(null)}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); handleDrop(idx); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm transition-all ${
              isCorrectPosition
                ? 'bg-success/10 border-success text-success animate-pulse-success'
                : isWrongPosition
                ? 'bg-destructive/10 border-destructive text-destructive animate-shake'
                : dragIdx === idx
                ? 'border-accent bg-accent/10 text-foreground opacity-50'
                : 'border-border bg-muted text-foreground'
            } ${!submitted ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono font-bold">
              {idx + 1}
            </span>
            <span className="flex-1">{step}</span>
            {isCorrectPosition && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
            {isWrongPosition && correctItem && (
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-xs text-success font-mono">#{correctItem.correctPosition + 1}</span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
