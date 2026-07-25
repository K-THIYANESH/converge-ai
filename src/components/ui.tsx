import type { ReactNode } from 'react';
import { severityStyles, riskStyles } from '../lib/format';
import type { RiskLevel, Severity } from '../lib/types';

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityStyles[severity]}`}
    >
      {severity}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${riskStyles[risk]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${riskStyles[risk].split(' ')[1].replace('text-', 'bg-')}`} />
      {risk}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-red-500/10 text-red-400 border-red-500/30',
    investigating: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/30',
    flagged: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? map.completed}`}
    >
      {status}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink-700 bg-ink-850/60 p-5 shadow-card backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
