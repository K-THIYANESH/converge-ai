import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  ArrowLeftRight,
  Bell,
  Workflow,
  Info,
  Zap,
  Activity,
} from 'lucide-react';
import { useStore } from '../lib/store';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Events', icon: ShieldAlert },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/timeline', label: 'Attack Timeline', icon: Workflow },
  { to: '/about', label: 'About', icon: Info },
];

export default function Sidebar() {
  const location = useLocation();
  const alerts = useStore((s) => s.alerts);
  const openAlerts = alerts.filter((a) => a.status === 'open').length;
  const simulateAttack = useStore((s) => s.simulateAttack);
  const lastSimulated = useStore((s) => s.lastSimulated);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-ink-700 bg-ink-900/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-ink-700 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 ring-1 ring-accent-500/30">
          <Activity className="h-5 w-5 text-accent-400" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wide text-white">CONVERGE-AI</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Correlation Engine
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          const badge = to === '/alerts' && openAlerts > 0 ? openAlerts : null;
          return (
            <NavLink
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-accent-500/10 text-accent-300 ring-1 ring-accent-500/30'
                  : 'text-slate-400 hover:bg-ink-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${active ? 'text-accent-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 text-[10px] font-bold text-red-400">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Simulator */}
      <div className="border-t border-ink-700 p-3">
        <button
          onClick={simulateAttack}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-600 to-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:from-accent-500 hover:to-accent-400 active:scale-[0.98]"
        >
          <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
          Generate Attack
        </button>
        {lastSimulated && (
          <p className="mt-2 text-center text-[10px] text-slate-600">
            Last simulated {new Date(lastSimulated).toLocaleTimeString('en-IN')}
          </p>
        )}
      </div>
    </aside>
  );
}
