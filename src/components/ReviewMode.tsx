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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold">Review & History</h1>
        </div>
        <button onClick={handleClearHistory} className="flex items-center gap-2 px-3 py-1.5 text-xs border border-destructive/50 text-destructive rounded-md hover:bg-destructive/10 transition-all">
          <Trash2 className="h-3 w-3" />
          Clear All Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border bg-card px-6">
        {(['missed', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}>
            {t === 'missed' ? 'Missed Questions' : 'Exam History'}
          </button>
        ))}
      </div>

      {tab === 'missed' && (
        <>
          {/* Filters */}
          <div className="px-6 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground"
                    placeholder="Search questions..."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Domain</label>
                <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="w-full mt-1 px-2 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground">
                  <option value="">All Domains</option>
                  {allDomains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full mt-1 px-2 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground">
                  <option value="">All</option>
                  <option value="pbq">PBQ Only</option>
                  <option value="mcq">MCQ Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min Fails</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={minFails}
                  onChange={e => setMinFails(Number(e.target.value))}
                  className="w-full mt-1 px-2 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-6 space-y-3">
            {missedQuestions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No missed questions match your filters.</p>
                <p className="text-sm mt-1">Complete some practice sets to see review data here.</p>
              </div>
            )}
            {missedQuestions.map(q => (
              <QuestionStatsCard key={q.questionId} stats={q} />
            ))}
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="p-6 space-y-3">
          {history.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No exam attempts yet.</p>
              <p className="text-sm mt-1">Complete a practice set or full exam to see your history here.</p>
            </div>
          )}
          {history.map(attempt => (
            <HistoryCard key={attempt.id} attempt={attempt} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionStatsCard({ stats }: { stats: QuestionStats }) {
  const passRate = stats.timesAttempted > 0 ? Math.round((stats.timesCorrect / stats.timesAttempted) * 100) : 0;
  const lastDate = new Date(stats.lastAttempt).toLocaleDateString();
  
  // Parse user answer for display
  let userAnswerDisplay = stats.userAnswer;
  if (stats.type === 'pbq') {
    try {
      const parsed = JSON.parse(stats.userAnswer);
      userAnswerDisplay = JSON.stringify(parsed, null, 2);
    } catch {
      // Keep as-is if not valid JSON
    }
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
              {stats.type}
            </span>
            <span className="text-xs text-muted-foreground">{stats.domain}</span>
          </div>
          <p className="text-sm font-medium">{stats.questionText}</p>
          
          {/* Show user's answer vs correct answer */}
          <div className="mt-3 p-3 rounded-md bg-muted/50 border border-border">
            <div className="grid gap-2 text-xs">
              <div>
                <span className="font-semibold text-destructive">Your Answer: </span>
                <span className="text-foreground">{userAnswerDisplay}</span>
              </div>
              {stats.correctAnswer && (
                <div>
                  <span className="font-semibold text-success">Correct Answer: </span>
                  <span className="text-foreground">{stats.correctAnswer}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-bold mb-1 ${passRate >= 75 ? 'text-success' : passRate >= 50 ? 'text-warning' : 'text-destructive'}`}>
            {passRate}%
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.timesCorrect}✓ / {stats.timesFailed}✗
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2">
        {stats.streak > 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
        <span>Streak: {stats.streak > 0 ? `+${stats.streak}` : stats.streak}</span>
        <Clock className="h-3 w-3" />
        <span>Avg: {Math.round(stats.avgTimeSeconds)}s</span>
        <span>•</span>
        <span>Last: {lastDate}</span>
      </div>
    </div>
  );
}

function HistoryCard({ attempt }: { attempt: ExamAttempt }) {
  const date = new Date(attempt.startTime).toLocaleString();
  const duration = Math.round((attempt.endTime - attempt.startTime) / 60000);

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
              {attempt.mode}
            </span>
            {attempt.examId && (
              <span className="text-xs font-medium text-muted-foreground">
                {attempt.examId}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{attempt.percentage}%</div>
          <div className="text-xs text-muted-foreground">
            {attempt.correctAnswers}/{attempt.totalQuestions} correct
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <Clock className="inline h-3 w-3 mr-1" />
            {duration} min
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(attempt.domainScores).slice(0, 5).map(([domain, { correct, total }]) => {
          const pct = Math.round((correct / total) * 100);
          return (
            <div key={domain} className={`text-[10px] px-2 py-1 rounded-md font-medium ${
              pct >= 75 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}>
              {domain.substring(0, 12)}… {pct}%
            </div>
          );
        })}
      </div>
    </div>
  );
}
