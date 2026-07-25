import { useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useStore } from '../lib/store';
import { Card, SeverityBadge, PageHeader } from '../components/ui';
import { formatTime } from '../lib/format';
import type { Severity } from '../lib/types';

const SEVERITIES: (Severity | 'all')[] = ['all', 'low', 'medium', 'high', 'critical'];

export default function Events() {
  const events = useStore((s) => s.events);
  const [query, setQuery] = useState('');
  const [sev, setSev] = useState<Severity | 'all'>('all');

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesQuery =
        !query ||
        e.type.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase()) ||
        e.source_ip.includes(query) ||
        e.user_id.toLowerCase().includes(query.toLowerCase());
      const matchesSev = sev === 'all' || e.severity === sev;
      return matchesQuery && matchesSev;
    });
  }, [events, query, sev]);

  return (
    <div>
      <PageHeader title="Cyber Events" subtitle={`${filtered.length} of ${events.length} security events`} />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by type, description, IP, or user…"
              className="w-full rounded-lg border border-ink-700 bg-ink-800 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-600" />
            <div className="flex gap-1">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSev(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    sev === s
                      ? 'bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/30'
                      : 'text-slate-500 hover:bg-ink-800 hover:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-ink-850">
              <tr className="border-b border-ink-700 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Source IP</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-ink-800 transition-colors hover:bg-ink-800/40">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-200">{e.type}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-xs text-slate-500">{e.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.source_ip}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{e.location}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={e.severity} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatTime(e.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
