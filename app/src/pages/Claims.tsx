import { useState } from 'react';
import { useApp } from '../AppContext';
import { Card, GuardrailBadge, PageHeader, StatusChip } from '../components/ui';
import { claims, customers } from '../data';
import { ClipboardCheck, FileText, Sparkles } from 'lucide-react';

export function Claims() {
  const { toast } = useApp();
  const [selectedId, setSelectedId] = useState(claims[0].id);
  const item = claims.find((c) => c.id === selectedId) ?? claims[0];
  const cust = customers.find((c) => c.id === item.customerId);

  return (
    <div>
      <PageHeader title="Claims Operations" subtitle="FNOL → triage → adjudication · ACORD-mapped · SIU + subrogation + reinsurance" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="FNOL queue" subtitle={`${claims.filter((c) => c.status !== 'Closed').length} open`}>
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {claims.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    c.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{c.line} · {c.id}</span>
                    <StatusChip status={c.status} />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-0.5">
                    {c.cause} · {c.state} · reserve ${c.reserve.toLocaleString()}
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
                <div className="text-lg font-semibold">{item.line} claim · {item.id}</div>
                <div className="text-xs text-ink-dim mt-1">FNOL {item.fnolDate} · {item.cause} · adjuster {item.adjuster}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={item.status} />
                  <span className="chip">policy {item.policy}</span>
                  {cust && <span className="chip">{cust.firstName} {cust.lastName}</span>}
                  {item.siuReferred && <span className="chip-accent">SIU referred</span>}
                  {item.subrogation && <span className="chip">Subrogation candidate</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-ghost" onClick={() => toast('Reserve updated', 'info')}>Update reserve</button>
                <button className="btn-ghost" onClick={() => toast('SIU memo drafted', 'info')}>
                  <FileText size={14} /> SIU memo
                </button>
                <button className="btn-primary" onClick={() => toast('Claim approved for payment', 'success')}>
                  <ClipboardCheck size={14} /> Approve
                </button>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Reserve</div>
              <div className="kpi-num">${item.reserve.toLocaleString()}</div>
            </div>
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Paid to date</div>
              <div className="kpi-num">${item.paid.toLocaleString()}</div>
            </div>
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Fraud score (SIU)</div>
              <div className={`kpi-num ${item.fraudScore >= 70 ? 'text-danger' : item.fraudScore >= 40 ? 'text-warn' : 'text-ok'}`}>
                {item.fraudScore}
              </div>
            </div>
          </div>

          <Card title="Claims copilot (cited)">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                Claim filed {item.fnolDate} for {item.cause.toLowerCase()} ({item.line}, {item.state}). Reserve recommended
                ${item.reserve.toLocaleString()}. {item.fraudScore >= 70
                  ? <span className="text-danger font-medium"> Fraud score elevated — recommend SIU referral and police report request before adjudicating.</span>
                  : <span className="text-ink-dim"> Fraud score within tolerance — proceed to adjudication.</span>}
                {item.cededTo && <> Reinsurance ceded to <span className="font-medium">{item.cededTo}</span>; bordereau reconciliation enabled.</>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <GuardrailBadge label="RBAC OK" ok />
              <GuardrailBadge label="ACORD-mapped" ok />
              <GuardrailBadge label="HIPAA n/a (P&C)" ok />
              <span className="chip">Model · claim-fraud-v2.4 · SR 11-7 In Review</span>
            </div>
          </Card>

          <Card title="ACORD evidence trail">
            <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto">
{`<ClaimsSvcRq>
  <Claim>
    <ClaimSysId>${item.id}</ClaimSysId>
    <LineOfBusiness>${item.line}</LineOfBusiness>
    <LossDt>${item.fnolDate}</LossDt>
    <LossCauseCd>${item.cause}</LossCauseCd>
    <Reserve>${item.reserve}</Reserve>
  </Claim>
</ClaimsSvcRq>`}
            </pre>
            <div className="text-[11px] text-ink-dim mt-2">Source · silver.insurance.claims · raw ACORD preserved in Bronze</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
