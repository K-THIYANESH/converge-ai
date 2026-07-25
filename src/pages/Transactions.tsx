import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../lib/store';
import { Card, RiskBadge, StatusBadge, PageHeader } from '../components/ui';
import { formatINR, formatTime } from '../lib/format';
import type { RiskLevel } from '../lib/types';

const RISKS: (RiskLevel | 'all')[] = ['all', 'low', 'medium', 'high'];

export default function Transactions() {
  const transactions = useStore((s) => s.transactions);
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<RiskLevel | 'all'>('all');

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesQuery =
        !query ||
        t.account.toLowerCase().includes(query.toLowerCase()) ||
        t.beneficiary.toLowerCase().includes(query.toLowerCase()) ||
        t.id.toLowerCase().includes(query.toLowerCase());
      const matchesRisk = risk === 'all' || t.risk === risk;
      return matchesQuery && matchesRisk;
    });
  }, [transactions, query, risk]);

  return (
    <div>
      <PageHeader title="Banking Transactions" subtitle={`${filtered.length} of ${transactions.length} transactions`} />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by account, beneficiary, or ID…"
              className="w-full rounded-lg border border-ink-700 bg-ink-800 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
          <div className="flex gap-1">
            {RISKS.map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  risk === r
                    ? 'bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/30'
                    : 'text-slate-500 hover:bg-ink-800 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-ink-850">
              <tr className="border-b border-ink-700 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Beneficiary</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-ink-800 transition-colors hover:bg-ink-800/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{t.account}</td>
                  <td className="px-4 py-3 font-semibold text-slate-100">{formatINR(t.amount)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {t.beneficiary}
                    {t.beneficiary_new && (
                      <span className="ml-1.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs uppercase text-slate-500">{t.channel}</td>
                  <td className="px-4 py-3"><RiskBadge risk={t.risk} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatTime(t.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
