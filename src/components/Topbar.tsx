import { Search, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';

interface TopbarProps {
  title: string;
  subtitle: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const riskScore = useStore((s) => s.riskScore);
  const resetData = useStore((s) => s.resetData);

  const dot =
    riskScore.risk === 'high'
      ? 'bg-red-400'
      : riskScore.risk === 'medium'
        ? 'bg-amber-400'
        : 'bg-emerald-400';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-700 bg-ink-900/70 px-6 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-ink-700 bg-ink-800 px-3 py-1.5 sm:flex">
          <span className={`h-2 w-2 rounded-full ${dot} animate-pulse-soft`} />
          <span className="text-xs font-medium text-slate-300">
            Risk: <span className="font-bold text-white">{riskScore.score}</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            {riskScore.risk}
          </span>
        </div>
        <button
          onClick={resetData}
          title="Regenerate baseline data"
          className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-ink-700 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input
            placeholder="Search…"
            className="w-48 rounded-lg border border-ink-700 bg-ink-800 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
      </div>
    </header>
  );
}
