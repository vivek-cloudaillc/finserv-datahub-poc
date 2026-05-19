import { useState } from 'react';
import { useApp } from '../AppContext';
import { Card, GuardrailBadge, PageHeader, StatusChip } from '../components/ui';
import { surveillanceAlerts } from '../data';
import { Sparkles } from 'lucide-react';

export function Surveillance() {
  const { toast } = useApp();
  const [selectedId, setSelectedId] = useState(surveillanceAlerts[0].id);
  const item = surveillanceAlerts.find((a) => a.id === selectedId) ?? surveillanceAlerts[0];

  return (
    <div>
      <PageHeader title="Trade Surveillance" subtitle="MAR-aligned · insider · spoofing · layering · wash · marking-the-close" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="Alert worklist">
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {surveillanceAlerts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    a.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{a.pattern}</span>
                    <StatusChip status={a.status} />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-0.5">
                    {a.symbol} · {a.trader} · score {a.score}
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
                <div className="text-lg font-semibold">{item.pattern} · {item.symbol}</div>
                <div className="text-xs text-ink-dim mt-1">
                  Opened {item.openedAt} · {item.desk} · {item.trader}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={item.status} />
                  <span className="chip">score {item.score}</span>
                  <span className="chip">{item.ordersInvolved} orders · ${item.notional.toLocaleString()} notional</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-ghost" onClick={() => toast('Alert cleared with rationale', 'success')}>Clear</button>
                <button className="btn-ghost" onClick={() => toast('Escalated to MAR Officer', 'info')}>Escalate</button>
                <button className="btn-primary" onClick={() => toast('Reported to FINRA · audit log appended', 'warn')}>Report</button>
              </div>
            </div>
          </Card>

          <Card title="AI explanation (cited)">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                Pattern <span className="font-medium">{item.pattern}</span> identified on {item.symbol} order book. Evidence:
                <ul className="list-disc pl-5 mt-2">
                  {item.evidence.map((e) => <li key={e}>{e}</li>)}
                </ul>
                <p className="mt-2 text-xs text-ink-dim">Citations · silver.trades.equities · silver.orders.charles_river · silver.ecomms.smarsh</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <GuardrailBadge label="MAR safe-harbor" ok />
              <GuardrailBadge label="Reg-FD compliant" ok />
              <GuardrailBadge label="Information barrier OK" ok />
              <span className="chip">Model · nl-guardrail-v1.8</span>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Order timeline">
              <ol className="text-xs space-y-1">
                <li>· 09:42:18.142 — Place limit Buy 2,500 @ 184.20</li>
                <li>· 09:42:18.214 — Place limit Buy 1,800 @ 184.18</li>
                <li>· 09:42:18.302 — Cancel 09:42:18.142</li>
                <li>· 09:42:18.318 — Place limit Buy 2,200 @ 184.16</li>
                <li>· 09:42:18.402 — Cancel 09:42:18.214</li>
                <li>· (12 add/cancel cycles within 120 ms)</li>
                <li>· 09:42:18.892 — Net executed 184 lots</li>
              </ol>
            </Card>
            <Card title="eComms snippets (Smarsh capture)">
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-input border border-line-light dark:border-line-dark">
                  <div className="font-medium">Bloomberg IB · 09:18 ET</div>
                  <div className="text-ink-dim">"watch the open, we’ll go after retail prints"</div>
                </div>
                <div className="p-2 rounded-input border border-line-light dark:border-line-dark">
                  <div className="font-medium">Symphony · 09:33 ET</div>
                  <div className="text-ink-dim">"setup looks clean for the algo"</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
