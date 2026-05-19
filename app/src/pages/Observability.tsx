import { Card, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { pipelines } from '../data';

const incidents = [
  { id: 'inc_001', title: 'Plaid item-disconnect surge', severity: 'P2', mttd: '4m', mttr: '2h 14m', status: 'investigating', dataset: 'bronze.aggregation.plaid', blast: ['silver.payments.unified', 'gold.customer_360'] },
  { id: 'inc_002', title: 'Duck Creek nightly extract failure', severity: 'P1', mttd: '8m', mttr: 'open', status: 'open', dataset: 'bronze.insurance.duck_creek', blast: ['silver.insurance.policies', 'gold.policy_360'] },
  { id: 'inc_003', title: 'OFAC FP rate above band', severity: 'P2', mttd: '12m', mttr: '38m', status: 'resolved', dataset: 'silver.aml.ofac_screen', blast: ['gold.aml.workspace'] },
  { id: 'inc_004', title: 'IFRS-17 cohort mismatch', severity: 'P3', mttd: '22m', mttr: 'open', status: 'investigating', dataset: 'gold.insurance.ifrs17_cohorts', blast: ['apps.regulatory'] },
];

const freshness = Array.from({ length: 14 }, (_, i) => ({
  name: `D-${13 - i}`,
  value: 96 + Math.round(Math.sin(i / 2) * 1.6),
}));

const bcbs239 = [
  { name: 'Accuracy', value: 92 },
  { name: 'Integrity', value: 95 },
  { name: 'Completeness', value: 91 },
  { name: 'Timeliness', value: 94 },
  { name: 'Adaptability', value: 88 },
];

export function Observability() {
  return (
    <div>
      <PageHeader
        title="Observability"
        subtitle="Pipeline SLOs · BCBS 239 panel · DORA ICT incident workflow · OpenLineage end-to-end"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">Pipelines on SLO</div>
          <div className="kpi-num">{pipelines.filter((p) => p.status === 'healthy').length}/{pipelines.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">Data downtime (30d)</div>
          <div className="kpi-num">4h 18m</div>
          <div className="text-[11px] text-ok">-32% vs. last month</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">MTTD avg</div>
          <div className="kpi-num">6m</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">MTTR avg</div>
          <div className="kpi-num">42m</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Freshness P95 (Silver)" className="lg:col-span-2">
          <SimpleChart kind="area" data={freshness} height={200} tone="accent" />
        </Card>
        <Card title="BCBS 239 conformance">
          <div className="space-y-2">
            {bcbs239.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-xs">
                  <span>{m.name}</span>
                  <span className="tabular">{m.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-line-light dark:bg-white/10 overflow-hidden">
                  <div className={`h-full ${m.value >= 92 ? 'bg-ok' : m.value >= 85 ? 'bg-warn' : 'bg-danger'}`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Open incidents" padded={false}>
        <table className="table-grid">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Dataset</th>
              <th>MTTD</th>
              <th>MTTR</th>
              <th>Blast radius</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id}>
                <td>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-[11px] text-ink-dim">{i.id}</div>
                </td>
                <td><StatusChip status={i.severity} /></td>
                <td><StatusChip status={i.status} /></td>
                <td className="id-mono text-xs">{i.dataset}</td>
                <td className="text-xs tabular">{i.mttd}</td>
                <td className="text-xs tabular">{i.mttr}</td>
                <td className="text-xs">
                  {i.blast.map((d) => (
                    <div key={d} className="id-mono text-[11px]">{d}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
