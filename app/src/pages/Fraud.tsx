import { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { customers, fraudCases } from '../data';
import { Ban, Check, ShieldQuestion } from 'lucide-react';

export function Fraud() {
  const { consumeScreenParams, toast } = useApp();
  const [selectedId, setSelectedId] = useState(fraudCases[0].id);

  useEffect(() => {
    const p = consumeScreenParams();
    if (p.caseId) setSelectedId(p.caseId as string);
  }, [consumeScreenParams]);

  const item = fraudCases.find((c) => c.id === selectedId) ?? fraudCases[0];
  const cust = customers.find((c) => c.id === item.customerId);

  const signalChart = item.signals.map((s) => ({ name: s.name, value: s.value }));

  return (
    <div>
      <PageHeader title="Fraud Operations" subtitle="Real-time auth-time scoring · device + behavioral · case management" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="Live feed" subtitle="Last 24h">
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {fraudCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    c.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{c.channel}</span>
                    <StatusChip status={c.status} />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-0.5">
                    {c.id} · score {c.riskScore} · ${c.amount.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{item.channel} · {item.id}</div>
                <div className="text-xs text-ink-dim mt-1">
                  Opened {item.openedAt} · ${item.amount.toLocaleString()} · model {item.modelVersion}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={item.status} />
                  <span className="chip">score {item.riskScore}</span>
                  {cust && <span className="chip">{cust.firstName} {cust.lastName}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-ghost" onClick={() => toast('Auth released', 'success')}>
                  <Check size={14} /> Release
                </button>
                <button className="btn-ghost" onClick={() => toast('Auth held for review', 'warn')}>
                  <ShieldQuestion size={14} /> Hold
                </button>
                <button className="btn-primary" onClick={() => toast('Blocked + reason logged', 'danger')}>
                  <Ban size={14} /> Block
                </button>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Model score breakdown">
              <SimpleChart kind="bar" data={signalChart} height={220} tone="danger" />
            </Card>
            <Card title="Device + behavioral">
              <div className="text-sm space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-ink-dim">Fingerprint</div>
                  <div className="id-mono text-xs">{item.device.fingerprint}</div>
                  <div className="text-ink-dim">IP (tokenized)</div>
                  <div className="id-mono text-xs">{item.device.ip}</div>
                  <div className="text-ink-dim">Geo</div>
                  <div>{item.device.geo}</div>
                </div>
                <div className="section-title mt-3">Decision timeline</div>
                <ul className="text-xs space-y-1">
                  <li>· Auth received · score 92</li>
                  <li>· Velocity feature triggered · 1m / 1h above policy</li>
                  <li>· Step-up auth requested · skipped after 30s</li>
                  <li>· Held for case review</li>
                </ul>
              </div>
            </Card>
          </div>

          <Card title="Hub data flow (sub-100ms hot path)">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="chip">Marqeta ISO 8583</span>
              <span>→</span>
              <span className="chip">Bronze (Iceberg)</span>
              <span>→</span>
              <span className="chip-accent">Platinum features (DynamoDB)</span>
              <span>→</span>
              <span className="chip-accent">Card fraud v4.2.1</span>
              <span>→</span>
              <span className="chip">Decision (46ms p95)</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
