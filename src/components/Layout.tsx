import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Topbar } from './Topbar';

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Unified overview of cyber events and banking transactions' },
  '/events': { title: 'Cyber Events', subtitle: 'Security telemetry from endpoints, identity, and network' },
  '/transactions': { title: 'Banking Transactions', subtitle: 'Payment flows with risk and status' },
  '/alerts': { title: 'Alerts', subtitle: 'Correlated findings with rule-based explanations' },
  '/timeline': { title: 'Attack Timeline', subtitle: 'Visual correlation of an attack chain' },
  '/about': { title: 'About', subtitle: 'How CONVERGE-AI works' },
};

export default function Layout() {
  const location = useLocation();
  const meta = titles[location.pathname] ?? { title: 'CONVERGE-AI', subtitle: '' };

  return (
    <div className="min-h-screen bg-ink-950">
      <Sidebar />
      <div className="ml-64 flex min-h-screen flex-col">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 animate-fade-in p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
