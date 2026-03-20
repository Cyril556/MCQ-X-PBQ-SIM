import { useState, useMemo } from 'react';
import { Shield, Filter, RotateCcw } from 'lucide-react';
import { ExamMode } from '@/lib/examState';
import { pbqSets, getAllPBQDomains } from '@/data/pbq';
import { mcqSets, getAllMCQDomains } from '@/data/mcq';

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

export function ExamHeader({ mode, onModeChange, onReset, submitted, currentSet, onSetChange, selectedDomains, onDomainsChange }: ExamHeaderProps) {
  const [showFilter, setShowFilter] = useState(false);

  const modes: { value: ExamMode; label: string }[] = [
    { value: 'pbq', label: 'PBQ' },
    { value: 'mcq', label: 'MCQ' },
    { value: 'both', label: 'Both' },
  ];

  const availableSets = useMemo(() => {
    const setIds = new Set<string>();
    pbqSets.forEach(s => setIds.add(s.id));
    mcqSets.forEach(s => setIds.add(s.id));
    return Array.from(setIds).sort();
  }, []);

  const allDomains = useMemo(() => {
    const combined = new Set([...getAllPBQDomains(), ...getAllMCQDomains()]);
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
    <header className="relative border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono tracking-tight text-foreground leading-none">
              SY0-701 <span className="text-primary">Trainer</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">CompTIA Security+</p>
          </div>
        </div>

        {/* Set selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:inline">Set</span>
          <nav className="flex rounded-lg border border-border overflow-hidden" role="tablist" aria-label="Question set">
            {availableSets.map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={currentSet === s}
                onClick={() => onSetChange(s)}
                className={`px-2.5 py-1.5 text-xs font-mono font-bold transition-colors ${
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

        {/* Mode selector */}
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

        {/* Actions */}
        <div className="flex items-center gap-2">
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
            {isFiltering && <span className="ml-1 text-xs font-mono">{selectedDomains.length}</span>}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            aria-label="Reset progress"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Domain filter panel */}
      {showFilter && (
        <div className="border-t border-border bg-card/90 px-4 py-3 animate-fade-in">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Filter by Domain</p>
              {isFiltering && (
                <button onClick={() => onDomainsChange([])} className="text-xs text-accent hover:text-accent/80 font-mono">Clear All</button>
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
