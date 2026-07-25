import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ShieldAlert, ArrowLeftRight, Bell, Gauge, AlertTriangle } from 'lucide-react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui';
import { RiskBadge, StatusBadge } from '../components/ui';
import { formatTimeShort, scoreColor, timeAgo } from '../lib/format';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const { events, transactions, alerts, riskScore } = useStore();
  const navigate = useNavigate();

  // Event type distribution
  const eventTypeCounts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const eventTypeData = Object.entries(eventTypeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Alert severity distribution
  const severityCounts = alerts.reduce<Record<string, number>>((acc, a) => {
    acc[a.risk] = (acc[a.risk] ?? 0) + 1;
    return acc;
  }, {});
  const severityData = [
    { name: 'Low', value: severityCounts.low ?? 0 },
    { name: 'Medium', value: severityCounts.medium ?? 0 },
    { name: 'High', value: severityCounts.high ?? 0 },
  ];

  // Transactions per hour (last 12h)
  const now = Date.now();
  const buckets: { hour: string; count: number }[] = [];
  for (let h = 11; h >= 0; h--) {
    const start = now - (h + 1) * 60 * 60_000;
    const end = now - h * 60 * 60_000;
    const count = transactions.filter((t) => {
      const ts = +new Date(t.timestamp);
      return ts >= start && ts < end;
    }).length;
    buckets.push({ hour: formatTimeShort(new Date(end).toISOString()), count });
  }

  const recentAlerts = [...alerts].slice(0, 6);

  const stats = [
    { label: 'Total Events', value: events.length, icon: ShieldAlert, tint: 'text-accent-400', ring: 'ring-accent-500/20' },
    { label: 'Transactions', value: transactions.length, icon: ArrowLeftRight, tint: 'text-cyan-400', ring: 'ring-cyan-500/20' },
    { label: 'Alerts', value: alerts.length, icon: Bell, tint: 'text-amber-400', ring: 'ring-amber-500/20' },
    { label: 'Risk Score', value: riskScore.score, icon: Gauge, tint: scoreColor(riskScore.score), ring: 'ring-red-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className={`mt-1 text-3xl font-bold ${s.tint}`}>{s.value}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-ink-800 ring-1 ${s.ring}`}>
              <s.icon className={`h-6 w-6 ${s.tint}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-slate-200">Event Types</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={eventTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={2}
              >
                {eventTypeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#0a0f1c" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1a2236', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2">
            {eventTypeData.slice(0, 6).map((e, i) => (
              <div key={e.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {e.name}
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-slate-200">Alert Severity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2236" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1a2236', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#1a223640' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-slate-200">Transactions per Hour</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={buckets}>
              <defs>
                <linearGradient id="txnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2236" vertical={false} />
              <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} interval={1} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1a2236', borderRadius: 8, fontSize: 12 }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#txnGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Recent Alerts
          </h3>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-medium text-accent-400 hover:text-accent-300"
          >
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 font-medium">Alert</th>
                <th className="pb-2 font-medium">Severity</th>
                <th className="pb-2 font-medium">Reason</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => navigate('/alerts')}
                  className="cursor-pointer border-b border-ink-800 transition-colors hover:bg-ink-800/50"
                >
                  <td className="py-3 font-mono text-xs text-slate-300">{a.id}</td>
                  <td className="py-3"><RiskBadge risk={a.risk} /></td>
                  <td className="py-3 max-w-xs truncate text-xs text-slate-400">{a.reason}</td>
                  <td className="py-3 text-xs text-slate-500">{timeAgo(a.created_at)}</td>
                  <td className="py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
