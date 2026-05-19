import { useState } from 'react';
import { useApp } from '../AppContext';
import { Card, GuardrailBadge, PageHeader, StatusChip } from '../components/ui';
import { underwritingSubs } from '../data';
import { Sparkles } from 'lucide-react';

export function Underwriting() {
  const { toast } = useApp();
  const [selectedId, setSelectedId] = useState(underwritingSubs[0].id);
  const item = underwritingSubs.find((s) => s.id === selectedId) ?? underwritingSubs[0];

  return (
    <div>
      <PageHeader title="Underwriting Workbench" subtitle="Commercial · Specialty · Life — Verisk LightSpeed · RMS · Earnix-driven pricing" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="Submissions">
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {underwritingSubs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    s.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{s.insured}</span>
                    <StatusChip status={s.status} />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-0.5">
                    {s.line} · ${s.premium.toLocaleString()}
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
                <div className="text-lg font-semibold">{item.insured}</div>
                <div className="text-xs text-ink-dim mt-1">
                  {item.line} · effective {item.effectiveDate} · broker {item.broker}{item.mga !== '—' ? ` · MGA ${item.mga}` : ''}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={item.status} />
                  <span className="chip">premium ${item.premium.toLocaleString()}</span>
                  <span className="chip">exposure ${(item.exposure / 1e6).toFixed(1)}M</span>
                  <span className="chip">PML ${(item.catModelLoss / 1e6).toFixed(1)}M</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-ghost" onClick={() => toast('Declined with rationale logged', 'warn')}>Decline</button>
                <button className="btn-ghost" onClick={() => toast('Quote letter drafted', 'info')}>Quote</button>
                <button className="btn-primary" onClick={() => toast('Bound · binding confirmation sent', 'success')}>Bind</button>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Risk score</div>
              <div className="kpi-num">{item.riskScore}</div>
              <div className="text-[11px] text-ink-dim">Verisk LightSpeed weighted</div>
            </div>
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Cat-modeled PML</div>
              <div className="kpi-num">${(item.catModelLoss / 1e6).toFixed(1)}M</div>
              <div className="text-[11px] text-ink-dim">RMS Intelligent Risk v4.2</div>
            </div>
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Ceded share</div>
              <div className="kpi-num">{item.line === 'Commercial Property' ? '30%' : item.line === 'Cyber' ? '40%' : '0%'}</div>
              <div className="text-[11px] text-ink-dim">Specialty market / treaty</div>
            </div>
          </div>

          <Card title="AI underwriting copilot (cited)">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                {item.insured} ({item.line}) — risk score {item.riskScore}. Submission notes: {item.notes}. Modeled PML {((item.catModelLoss/1e6)).toFixed(1)}M
                versus exposure {((item.exposure/1e6)).toFixed(1)}M (ratio {(item.catModelLoss/item.exposure*100).toFixed(2)}%). Recommend cession 30% to specialty market and
                attachment $5M. Pricing aligns with Earnix-driven rate; reinsurer concurrence pending.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <GuardrailBadge label="ACORD-mapped" ok />
              <GuardrailBadge label="Cat-model lineage" ok />
              <GuardrailBadge label="MGA notes captured" ok />
              <span className="chip">Model · uw-priority-v3.2</span>
            </div>
          </Card>

          <Card title="Loss history (cited)">
            <table className="table-grid">
              <thead><tr><th>Year</th><th>Line</th><th>Cause</th><th className="num">Incurred</th></tr></thead>
              <tbody>
                <tr><td>2024</td><td>Property</td><td>Fire — sprinkler malfunction</td><td className="num">$1,420,000</td></tr>
                <tr><td>2022</td><td>Property</td><td>Storm wind damage</td><td className="num">$420,000</td></tr>
                <tr><td>2021</td><td>—</td><td>No claims</td><td className="num">$0</td></tr>
              </tbody>
            </table>
            <div className="text-[11px] text-ink-dim mt-2">Source · gold.underwriting.risk_packet · silver.insurance.claims</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
