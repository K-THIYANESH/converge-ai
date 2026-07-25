import { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  Position,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../lib/store';
import { Card, PageHeader, RiskBadge } from '../components/ui';
import { formatTime, formatINR } from '../lib/format';
import type { TimelineStep } from '../lib/types';
import {
  Mail,
  LogIn,
  Plane,
  Smartphone,
  UserPlus,
  ArrowLeftRight,
  Gauge,
  ShieldX,
  type LucideIcon,
} from 'lucide-react';

const stepMeta: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  'Phishing Email': { icon: Mail, color: 'text-amber-400', bg: 'bg-amber-500/10 ring-amber-500/30' },
  'Credential Login': { icon: LogIn, color: 'text-accent-400', bg: 'bg-accent-500/10 ring-accent-500/30' },
  'Impossible Travel': { icon: Plane, color: 'text-orange-400', bg: 'bg-orange-500/10 ring-orange-500/30' },
  'New Device': { icon: Smartphone, color: 'text-cyan-400', bg: 'bg-cyan-500/10 ring-cyan-500/30' },
  'New Beneficiary': { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10 ring-purple-500/30' },
  'Risk Generated': { icon: Gauge, color: 'text-red-400', bg: 'bg-red-500/10 ring-red-500/30' },
  'Transaction Blocked': { icon: ShieldX, color: 'text-red-500', bg: 'bg-red-500/15 ring-red-500/40' },
  'Transaction Flagged': { icon: ShieldX, color: 'text-amber-500', bg: 'bg-amber-500/15 ring-amber-500/40' },
};

function StepNode({ data }: { data: { step: TimelineStep; index: number } }) {
  const meta = stepMeta[data.step.label] ?? {
    icon: ArrowLeftRight,
    color: 'text-slate-300',
    bg: 'bg-ink-800 ring-ink-700',
  };
  const Icon = meta.icon;
  return (
    <div className="flex w-56 items-center gap-3 rounded-xl border border-ink-700 bg-ink-850/90 p-3 shadow-card backdrop-blur-md transition-all hover:border-accent-500/50 hover:shadow-glow">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${meta.bg}`}>
        <Icon className={`h-5 w-5 ${meta.color}`} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-600">#{data.index + 1}</span>
          <span className="truncate text-sm font-semibold text-slate-100">{data.step.label}</span>
        </div>
        <p className="truncate text-[11px] text-slate-500">{formatTime(data.step.timestamp)}</p>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = { step: StepNode };

export default function AttackTimeline() {
  const timeline = useStore((s) => s.timeline);
  const alerts = useStore((s) => s.alerts);
  const selectedAlertId = useStore((s) => s.selectedAlertId);
  const selectAlert = useStore((s) => s.selectAlert);
  const [selectedStep, setSelectedStep] = useState<TimelineStep | null>(null);

  const { nodes, edges } = useMemo(() => {
    const ns: Node[] = timeline.map((step, i) => ({
      id: step.id,
      type: 'step',
      position: { x: 320, y: i * 110 },
      data: { step, index: i },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    }));

    const es: Edge[] = timeline.slice(1).map((step, i) => ({
      id: `e-${timeline[i].id}-${step.id}`,
      source: timeline[i].id,
      target: step.id,
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));

    return { nodes: ns, edges: es };
  }, [timeline]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedStep(node.data.step);
  }, []);

  const currentAlert = alerts.find((a) => a.id === selectedAlertId) ?? alerts[0];

  return (
    <div>
      <PageHeader
        title="Attack Timeline"
        subtitle="Visual correlation of an attack chain — click any node for details"
      />

      {/* Alert selector */}
      {alerts.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Alert:</span>
          {alerts.slice(0, 6).map((a) => (
            <button
              key={a.id}
              onClick={() => selectAlert(a.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                a.id === selectedAlertId
                  ? 'border-accent-500/40 bg-accent-500/10 text-accent-300'
                  : 'border-ink-700 bg-ink-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="font-mono">{a.id}</span>
              <RiskBadge risk={a.risk} />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Flow canvas */}
        <Card className="lg:col-span-2 p-0">
          <div className="h-[calc(100vh-300px)] min-h-[400px] w-full">
            {timeline.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No timeline data. Generate an attack to see the flow.
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                defaultEdgeOptions={{ animated: true }}
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a2236" />
                <Controls showInteractive={false} />
                <MiniMap
                  nodeColor={() => '#1a2236'}
                  maskColor="rgba(7,11,20,0.7)"
                  className="!rounded-lg"
                />
              </ReactFlow>
            )}
          </div>
        </Card>

        {/* Detail panel */}
        <Card className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Node Details</h3>
          {selectedStep ? (
            <div className="space-y-3 animate-fade-in">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Step</p>
                <p className="text-base font-bold text-white">{selectedStep.label}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Description</p>
                <p className="text-sm text-slate-300">{selectedStep.description}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Timestamp</p>
                <p className="text-sm text-slate-300">{formatTime(selectedStep.timestamp)}</p>
              </div>
              {selectedStep.amount && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Amount</p>
                  <p className="text-lg font-bold text-accent-400">{formatINR(selectedStep.amount)}</p>
                </div>
              )}
              {selectedStep.meta && Object.keys(selectedStep.meta).length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">Metadata</p>
                  <div className="space-y-1">
                    {Object.entries(selectedStep.meta).map(([k, v]) => (
                      <div key={k} className="flex justify-between rounded-lg bg-ink-800/60 px-3 py-1.5 text-xs">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-slate-300">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentAlert ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Click a node in the flow to inspect it. Current alert summary:
              </p>
              <div className="rounded-lg bg-ink-800/60 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{currentAlert.id}</span>
                  <RiskBadge risk={currentAlert.risk} />
                </div>
                <p className="text-sm text-slate-300">{currentAlert.reason}</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">Matched Rules</p>
                <div className="flex flex-wrap gap-2">
                  {currentAlert.matched_rules.map((r) => (
                    <span key={r} className="rounded-lg border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-xs text-accent-300">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-slate-500">Timeline Steps</p>
                <div className="space-y-1.5">
                  {timeline.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-600">{i + 1}.</span>
                      <span className="text-slate-300">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No alert selected.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
