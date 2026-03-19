import { useState, useMemo } from 'react';
import { Shield, Filter } from 'lucide-react';
import { ExamMode } from '@/lib/examState';
import { getAllPBQDomains } from '@/data/pbq';
import { getAllMCQDomains } from '@/data/mcq';

interface ExamHeaderProps {
  mode: ExamMode;
  onModeChange: (mode: ExamMode) => void;
  onReset: () => void;
  submitted: boolean;
  currentSet: string;
  onSetChange: (set: string) => void;
  selectedDomains: string[];
  onDomainsChange: (domains: string[]) => void;
}

export function ExamHeader({
  mode,
  onModeChange,
  onReset,
  submitted,
  currentSet,
  onSetChange,
  selectedDomains,
  onDomainsChange,
}: ExamHeaderProps) {
  const [showFilter, setShowFilter] = useState(false);

  const modes: { value: ExamMode; label: string }[] = [
    { value: 'pbq', label: 'PBQ' },
    { value: 'mcq', label: 'MCQ' },
    { value: 'both', label: 'Both' },
  ];

  const sets = ['A', 'B', 'C'];

  const allDomains = useMemo(() => {
    const pbqDomains = getAllPBQDomains();
    const mcqDomains = getAllMCQDomains();
    const combined = new Set([...pbqDomains, ...mcqDomains]);
    return Array.from(combined).sort();
  }, []);

  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      onDomainsChange(selectedDomains.filter(d => d !== domain));
    } else {
      onDomainsChange([...selectedDomains, domain]);
    }
  };

  const isFiltering = selectedDomains.length > 0;

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
          {!submitted && (
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`p-2 rounded-md border transition-all ${
                isFiltering
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              aria-label="Filter by domain"
            >
              <Filter className="h-4 w-4" />
              {isFiltering && (
                <span className="ml-1 text-xs font-mono">{selectedDomains.length}</span>
              )}
            </button>
          )}
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

      {/* Domain filter panel */}
      {showFilter && !submitted && (
        <div className="border-t border-border bg-card/90 px-4 py-3 animate-fade-in">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Filter by Domain</p>
              {isFiltering && (
                <button
                  onClick={() => onDomainsChange([])}
                  className="text-xs text-accent hover:text-accent/80 font-mono"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedDomains.includes(domain)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
