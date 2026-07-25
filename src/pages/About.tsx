import { Activity, ArrowLeftRight, Bell, Workflow, Gauge, Zap, ShieldCheck, Database, Cpu } from 'lucide-react';
import { Card, PageHeader } from '../components/ui';

const features = [
  { icon: ArrowLeftRight, title: 'Correlation Engine', desc: 'Rule-based engine that correlates cyber events with banking transactions within a 10-minute window.' },
  { icon: Gauge, title: 'Risk Scoring', desc: 'Each alert carries a risk score, confidence level, and human-readable reason explaining why it was flagged.' },
  { icon: Workflow, title: 'Attack Timeline', desc: 'Interactive React Flow visualization showing the full attack chain from phishing email to blocked transaction.' },
  { icon: Bell, title: 'Alert Explanations', desc: 'Every alert explains matched rules, events involved, the transaction, and confidence — no black box.' },
  { icon: Zap, title: 'Attack Simulator', desc: 'One click generates a realistic attack scenario and updates the entire dashboard in real time.' },
  { icon: ShieldCheck, title: 'No Auth, No Cloud', desc: 'Lightweight MVP with mock data — runs entirely locally with no authentication or external services.' },
];

const rules = [
  { pattern: 'Impossible Travel + New Device + Large Transaction', risk: 'High', score: 92 },
  { pattern: 'Multiple Failed Logins + New Beneficiary', risk: 'Medium', score: 64 },
  { pattern: 'Phishing Email + Large Transaction', risk: 'High', score: 78 },
  { pattern: 'New Device + New Beneficiary', risk: 'Medium', score: 55 },
  { pattern: 'Impossible Travel + Large Transaction', risk: 'High', score: 80 },
  { pattern: 'No high-risk pattern matched', risk: 'Low', score: 22 },
];

const stack = [
  { label: 'Frontend', value: 'React + Vite + TypeScript + TailwindCSS + Recharts + React Flow' },
  { label: 'Backend', value: 'FastAPI + Python 3.11 + SQLite' },
  { label: 'State', value: 'Zustand' },
  { label: 'Deployment', value: 'Vercel (frontend) + Render (backend)' },
];

export default function About() {
  return (
    <div>
      <PageHeader title="About CONVERGE-AI" subtitle="Unified Cyber-Fraud Correlation Engine" />

      {/* Hero */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-500/10 ring-1 ring-accent-500/30">
            <Activity className="h-7 w-7 text-accent-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">CONVERGE-AI</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              A hackathon MVP that demonstrates how cybersecurity events and banking transactions
              can be correlated into a single unified attack timeline. The engine uses a simple
              rule-based approach — no machine learning — to flag suspicious activity and explain
              exactly why each alert was generated.
            </p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 ring-1 ring-ink-700">
              <f.icon className="h-5 w-5 text-accent-400" />
            </div>
            <h4 className="mb-1 text-sm font-semibold text-slate-200">{f.title}</h4>
            <p className="text-xs text-slate-500">{f.desc}</p>
          </Card>
        ))}
      </div>

      {/* Rules */}
      <Card className="mb-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Cpu className="h-4 w-4 text-accent-400" /> Correlation Rules
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="pb-2 font-medium">Pattern</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.pattern} className="border-b border-ink-800">
                  <td className="py-3 text-slate-300">{r.pattern}</td>
                  <td className="py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                      r.risk === 'High' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                      r.risk === 'Medium' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                      'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    }`}>{r.risk}</span>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-200">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tech stack */}
      <Card>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Database className="h-4 w-4 text-accent-400" /> Tech Stack
        </h3>
        <div className="space-y-2">
          {stack.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 rounded-lg bg-ink-800/60 px-3 py-2 sm:flex-row sm:gap-4">
              <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</span>
              <span className="text-sm text-slate-300">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
