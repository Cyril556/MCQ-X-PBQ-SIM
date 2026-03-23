import { useState, useMemo } from 'react';
import { loadQuestionStats, getMissedQuestions, loadHistory, type QuestionStats, type ExamAttempt } from '@/lib/examHistory';
import { getAllPBQDomains } from '@/data/pbq';
import { getAllMCQDomains } from '@/data/mcq';
import { Search, Filter, TrendingDown, TrendingUp, Clock, BarChart3, ArrowLeft, Trash2 } from 'lucide-react';
import { clearHistory } from '@/lib/examHistory';

interface ReviewModeProps {
  onBack: () => void;
}

export function ReviewMode({ onBack }: ReviewModeProps) {
  const [tab, setTab] = useState<'missed' | 'history'>('missed');
  const [domainFilter, setDomainFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'pbq' | 'mcq'>('');
  const [minFails, setMinFails] = useState(1);
  const [maxPasses, setMaxPasses] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');

  const allDomains = useMemo(() => {
    const combined = new Set([...getAllPBQDomains(), ...getAllMCQDomains()]);
    return Array.from(combined).sort();
  }, []);

  const missedQuestions = useMemo(() => {
    return getMissedQuestions({
      minFails: minFails || undefined,
      maxPasses,
      domain: domainFilter || undefined,
      type: typeFilter || undefined,
    }).filter(q => !search || q.questionText.toLowerCase().includes(search.toLowerCase()));
  }, [domainFilter, typeFilter, minFails, maxPasses, search]);

  const history = useMemo(() => loadHistory(), []);

  const handleClearHistory = () => {
    if (confirm('Clear all exam history and stats? This cannot be undone.')) {
      clearHistory();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-bold font-mono text-foreground">Review & History</h1>
          </div>
          <button onClick={handleClearHistory} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-destructive/30 text-destructive text-xs hover:bg-destructive/10 transition-all">
            <Trash2 className="h-3 w-3" /> Clear All Data
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border border-border rounded-lg overflow-hidden w-fit">
          {(['missed', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {t === 'missed' ? 'Missed Questions' : 'Exam History'}
            </button>
          ))}
        </div>

        {tab === 'missed' && (
          <>
            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Filters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-mono uppercase">Search</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground"
                      placeholder="Search questions..." />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-mono uppercase">Domain</label>
                  <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground">
                    <option value="">All Domains</option>
                    {allDomains.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-mono uppercase">Type</label>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
                    className="w-full mt-1 px-2 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground">
                    <option value="">All</option>
                    <option value="pbq">PBQ Only</option>
                    <option value="mcq">MCQ Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-mono uppercase">Min Fails</label>
                  <input type="number" min={1} max={50} value={minFails} onChange={e => setMinFails(Number(e.target.value))}
                    className="w-full mt-1 px-2 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground" />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2">
              {missedQuestions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-mono text-sm">No missed questions match your filters.</p>
                  <p className="text-xs mt-1">Complete some practice sets to see review data here.</p>
                </div>
              )}
              {missedQuestions.map(q => (
                <QuestionStatsCard key={q.questionId} stats={q} />
              ))}
            </div>
          </>
        )}

        {tab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-mono text-sm">No exam attempts yet.</p>
                <p className="text-xs mt-1">Complete a practice set or full exam to see your history here.</p>
              </div>
            )}
            {history.map(attempt => (
              <HistoryCard key={attempt.id} attempt={attempt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionStatsCard({ stats }: { stats: QuestionStats }) {
  const passRate = stats.timesAttempted > 0 ? Math.round((stats.timesCorrect / stats.timesAttempted) * 100) : 0;
  const lastDate = new Date(stats.lastAttempt).toLocaleDateString();

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
              stats.type === 'pbq' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
            }`}>{stats.type}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{stats.domain}</span>
          </div>
          <p className="text-sm text-foreground truncate">{stats.questionText}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {stats.streak > 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
              Streak: {stats.streak > 0 ? `+${stats.streak}` : stats.streak}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Avg: {Math.round(stats.avgTimeSeconds)}s
            </span>
            <span>Last: {lastDate}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-bold font-mono ${passRate >= 75 ? 'text-success' : passRate >= 50 ? 'text-warning' : 'text-destructive'}`}>
            {passRate}%
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {stats.timesCorrect}✓ / {stats.timesFailed}✗
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ attempt }: { attempt: ExamAttempt }) {
  const date = new Date(attempt.startTime).toLocaleString();
  const duration = Math.round((attempt.endTime - attempt.startTime) / 60000);

  return (
    <div className={`bg-card border rounded-lg p-4 ${attempt.passed ? 'border-success/30' : 'border-destructive/30'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
            attempt.mode === 'exam' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          }`}>{attempt.mode}</span>
          {attempt.examId && <span className="text-xs text-muted-foreground font-mono">{attempt.examId}</span>}
        </div>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className={`text-2xl font-bold font-mono ${attempt.passed ? 'text-success' : 'text-destructive'}`}>
          {attempt.percentage}%
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>{attempt.correctAnswers}/{attempt.totalQuestions} correct</p>
          <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> {duration} min</p>
        </div>
        <div className="flex-1 flex flex-wrap gap-1 justify-end">
          {Object.entries(attempt.domainScores).slice(0, 5).map(([domain, { correct, total }]) => {
            const pct = Math.round((correct / total) * 100);
            return (
              <span key={domain} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${pct >= 75 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {domain.substring(0, 12)}… {pct}%
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
