import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Workflow, ShieldCheck, Target, FileWarning } from 'lucide-react';
import { useStore } from '../lib/store';
import { Card, RiskBadge, StatusBadge, PageHeader } from '../components/ui';
import { formatINR, formatTime, timeAgo, scoreColor } from '../lib/format';
import type { Alert } from '../lib/types';

export default function Alerts() {
  const alerts = useStore((s) => s.alerts);
  const selectAlert = useStore((s) => s.selectAlert);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleTimeline = (alert: Alert) => {
    selectAlert(alert.id);
    navigate('/timeline');
  };

  return (
    <div>
      <PageHeader title="Alerts" subtitle={`${alerts.length} correlated alerts ranked by risk score`} />

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isOpen = expanded === alert.id;
          return (
            <Card key={alert.id} className="p-0">
              {/* Header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : alert.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-ink-800/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-800 ring-1 ring-ink-700">
                  <FileWarning className={`h-5 w-5 ${scoreColor(alert.score)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{alert.id}</span>
                    <RiskBadge risk={alert.risk} />
                    <StatusBadge status={alert.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-300">{alert.reason}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <div className={`text-2xl font-bold ${scoreColor(alert.score)}`}>{alert.score}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-600">score</div>
                </div>
                <div className="text-xs text-slate-500">{timeAgo(alert.created_at)}</div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-ink-700 p-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Why flagged */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-400">
                        <Target className="h-3.5 w-3.5" /> Why was this flagged?
                      </h4>
                      <p className="text-sm text-slate-300">{alert.reason}</p>
                      <div className="mt-3">
                        <h5 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Matched Rules</h5>
                        <div className="flex flex-wrap gap-2">
                          {alert.matched_rules.map((r) => (
                            <span key={r} className="rounded-lg border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-xs text-accent-300">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-slate-400">
                          Confidence: <span className="font-bold text-emerald-400">{Math.round(alert.confidence * 100)}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Events + transaction involved */}
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Events Involved</h4>
                      <div className="space-y-1.5">
                        {alert.events.length === 0 && <p className="text-xs text-slate-600">No events correlated.</p>}
                        {alert.events.map((e) => (
                          <div key={e.id} className="flex items-center justify-between rounded-lg bg-ink-800/60 px-3 py-1.5 text-xs">
                            <span className="text-slate-300">{e.type}</span>
                            <span className="text-slate-600">{formatTime(e.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                      <h4 className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Transaction Involved</h4>
                      {alert.transactions.map((t) => (
                        <div key={t.id} className="rounded-lg bg-ink-800/60 px-3 py-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-slate-400">{t.id}</span>
                            <span className="font-semibold text-slate-100">{formatINR(t.amount)}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-slate-500">
                            <span>→ {t.beneficiary}</span>
                            <span className="capitalize">{t.channel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleTimeline(alert)}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent-600 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:from-accent-500 hover:to-accent-400 active:scale-[0.98]"
                    >
                      <Workflow className="h-4 w-4" />
                      View Attack Timeline
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
