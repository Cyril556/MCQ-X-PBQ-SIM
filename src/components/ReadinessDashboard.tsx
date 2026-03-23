import { useMemo } from 'react';
import { calculateReadiness, type ReadinessBreakdown } from '@/lib/readiness';
import { loadHistory } from '@/lib/examHistory';
import { TrendingUp, TrendingDown, Minus, Target, Brain, Clock, Layers, Shield, BarChart3, Zap, ArrowLeft } from 'lucide-react';

interface ReadinessDashboardProps {
  onBack: () => void;
}

export function ReadinessDashboard({ onBack }: ReadinessDashboardProps) {
  const readiness = useMemo(() => calculateReadiness(), []);
  const history = useMemo(() => loadHistory(), []);

  const trendIcon = readiness.trend === 'improving'
    ? <TrendingUp className="h-4 w-4 text-success" />
    : readiness.trend === 'declining'
    ? <TrendingDown className="h-4 w-4 text-destructive" />
    : <Minus className="h-4 w-4 text-muted-foreground" />;

  const meterColor = readiness.overall >= 75 ? 'text-success' :
    readiness.overall >= 50 ? 'text-warning' : 'text-destructive';

  const meterBg = readiness.overall >= 75 ? 'stroke-success' :
    readiness.overall >= 50 ? 'stroke-warning' : 'stroke-destructive';

  // SVG circle meter
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (readiness.overall / 100) * circumference;

  const metrics = [
    { label: 'Recent Accuracy', value: readiness.recentAccuracy, icon: <Target className="h-4 w-4" />, weight: '30%' },
    { label: 'Consistency', value: readiness.consistency, icon: <BarChart3 className="h-4 w-4" />, weight: '15%' },
    { label: 'Domain Coverage', value: readiness.domainCoverage, icon: <Layers className="h-4 w-4" />, weight: '15%' },
    { label: 'Weak Areas', value: readiness.weakDomainStrength, icon: <Shield className="h-4 w-4" />, weight: '15%' },
    { label: 'Time Management', value: readiness.timeManagement, icon: <Clock className="h-4 w-4" />, weight: '10%' },
    { label: 'Practice Volume', value: readiness.volumePracticed, icon: <Zap className="h-4 w-4" />, weight: '15%' },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-mono text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> Exam Readiness
            </h1>
            <p className="text-xs text-muted-foreground">Algorithmic assessment based on your practice data</p>
          </div>
        </div>

        {/* Main meter */}
        <div className="bg-card border border-border rounded-xl p-8 mb-6 flex flex-col items-center">
          <div className="relative w-44 h-44 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="80" cy="80" r={radius} fill="none" className={meterBg} strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold font-mono ${meterColor}`}>{readiness.overall}</span>
              <span className="text-xs text-muted-foreground font-mono">/100</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {trendIcon}
            <span className="text-sm font-medium text-foreground capitalize">{readiness.trend}</span>
          </div>

          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            readiness.readyForExam ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
          }`}>
            {readiness.readyForExam ? '✓ Exam Ready' : '⚠ Keep Practicing'}
          </div>
        </div>

        {/* Metric breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {metrics.map(m => (
            <div key={m.label} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {m.icon}
                  <span className="text-xs font-mono">{m.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{m.weight}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold font-mono ${
                  m.value >= 75 ? 'text-success' : m.value >= 50 ? 'text-warning' : 'text-destructive'
                }`}>{m.value}</span>
                <span className="text-xs text-muted-foreground mb-1">/100</span>
              </div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${
                  m.value >= 75 ? 'bg-success' : m.value >= 50 ? 'bg-warning' : 'bg-destructive'
                }`} style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">Recommendations</h3>
          <div className="space-y-2">
            {readiness.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary font-mono text-xs mt-0.5">→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent scores chart (simple text-based) */}
        {history.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">
              Score Trend (Last {Math.min(10, history.length)} Attempts)
            </h3>
            <div className="flex items-end gap-2 h-32">
              {history.slice(0, 10).reverse().map((a, i) => (
                <div key={a.id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-muted-foreground">{a.percentage}%</span>
                  <div className="w-full rounded-t-sm transition-all duration-500" style={{
                    height: `${Math.max(4, a.percentage)}%`,
                    backgroundColor: a.passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
                  }} />
                  <span className="text-[8px] text-muted-foreground font-mono">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
