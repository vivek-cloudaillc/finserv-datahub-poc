import { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, GuardrailBadge, PageHeader, StatusChip } from '../components/ui';
import { amlAlerts, customers } from '../data';
import { FileText, Sparkles } from 'lucide-react';

export function Aml() {
  const { consumeScreenParams, toast } = useApp();
  const [selectedId, setSelectedId] = useState<string>(amlAlerts[0].id);

  useEffect(() => {
    const p = consumeScreenParams();
    if (p.alertId) setSelectedId(p.alertId as string);
  }, [consumeScreenParams]);

  const alert = amlAlerts.find((a) => a.id === selectedId) ?? amlAlerts[0];
  const customer = customers.find((c) => c.id === alert.customerId);

  return (
    <div>
      <PageHeader title="AML Investigations" subtitle="Alert worklist · AI-assisted SAR drafting · evidence-grade citations" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="Worklist" subtitle={`${amlAlerts.filter((a) => a.status !== 'cleared' && a.status !== 'filed').length} open`}>
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {amlAlerts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    a.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{a.typology}</span>
                    <StatusChip status={a.status} />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-0.5">
                    {a.id} · score {a.score} · ${a.amount.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-lg font-semibold">{alert.typology} · {alert.id}</div>
                <div className="text-xs text-ink-dim mt-1">
                  Opened {alert.openedAt} · assignee {alert.assignee} · ${alert.amount.toLocaleString()}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={alert.status} />
                  <span className="chip">score {alert.score}</span>
                  {customer && <span className="chip">{customer.firstName} {customer.lastName}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-ghost" onClick={() => toast('Case escalated to BSA Officer', 'info')}>Escalate</button>
                <button className="btn-ghost" onClick={() => toast('Case cleared with rationale logged', 'success')}>Clear</button>
                <button className="btn-primary" onClick={() => toast('SAR drafted; pending review', 'success')}>
                  <FileText size={14} /> Draft SAR
                </button>
              </div>
            </div>
          </Card>

          <Card title="AI SAR draft" subtitle="Grounded, cited, never auto-filed">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <p>{alert.narrative}</p>
                <p className="mt-2">
                  Suggested narrative (paste-ready): &quot;Subject {customer ? `${customer.firstName} ${customer.lastName} (MCR ${customer.id})` : alert.customerId}
                  ‚ a {customer?.segment ?? '—'} customer at {customer?.city}, {customer?.state}, engaged in a pattern of activity consistent with
                  {' '}<span className="font-medium">{alert.typology}</span>. Specific activity: ${alert.amount.toLocaleString()} across the citations
                  below, with triggered rules {alert.triggeredRules.join(', ')}.&quot;
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <GuardrailBadge label="RBAC OK" ok />
              <GuardrailBadge label="Information barrier OK" ok />
              <GuardrailBadge label="Tokenization applied" ok />
              <span className="chip">Model · aml-tm-v4.2 · SR 11-7 Compliant</span>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Triggered rules">
              <ul className="text-sm space-y-1">
                {alert.triggeredRules.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </Card>
            <Card title="Related parties (graph)">
              <ul className="text-sm space-y-1">
                {alert.relatedParties.map((id) => {
                  const c = customers.find((x) => x.id === id);
                  return (
                    <li key={id} className="flex items-center justify-between">
                      <span>{c ? `${c.firstName} ${c.lastName}` : id}</span>
                      <span className="text-[11px] text-ink-dim">{c?.segment ?? ''}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>

          <Card title="Citations (lineage to source rows)">
            <ul className="space-y-1">
              {alert.citations.map((c) => (
                <li key={c} className="id-mono text-xs">{c}</li>
              ))}
            </ul>
          </Card>

          <Card title="E-file readiness">
            <ul className="text-sm space-y-1">
              <li>· Subject identity validated · MCR resolved</li>
              <li>· Transactions verifiable in silver.payments.unified</li>
              <li>· Tools used logged for audit (SR 11-7)</li>
              <li>· Narrative passes BSA SAR critical-field check (✓ all)</li>
              <li>· FinCEN BSA E-File connector ready</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
