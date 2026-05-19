import { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, Drawer, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { qualityRules } from '../data';
import type { QualityRule } from '../types';

const dimensions: QualityRule['dimension'][] = [
  'Accuracy',
  'Completeness',
  'Consistency',
  'Timeliness',
  'Uniqueness',
  'Validity',
];

export function QualityConsole() {
  const { subSector, toast } = useApp();
  const [filterDim, setFilterDim] = useState<QualityRule['dimension'] | 'All'>('All');
  const [selected, setSelected] = useState<QualityRule | null>(null);

  const filtered = useMemo(() => {
    return qualityRules.filter((r) => {
      const sectorOk = subSector === 'All' || r.subSector === subSector || r.subSector === 'Cross';
      const dimOk = filterDim === 'All' || r.dimension === filterDim;
      return sectorOk && dimOk;
    });
  }, [subSector, filterDim]);

  const dimChart = dimensions.map((d) => ({
    name: d,
    value: Math.round(
      (filtered
        .filter((r) => r.dimension === d)
        .reduce((s, r) => s + r.passing / Math.max(1, r.passing + r.failing), 0) /
        Math.max(1, filtered.filter((r) => r.dimension === d).length)) *
        100,
    ),
  }));

  const trustScore = Math.round(
    (filtered.reduce((s, r) => s + r.passing / Math.max(1, r.passing + r.failing), 0) /
      Math.max(1, filtered.length)) *
      100,
  );

  return (
    <div>
      <PageHeader
        title="Data Quality Console"
        subtitle="Six-dimensions framework — Accuracy · Completeness · Consistency · Timeliness · Uniqueness · Validity"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-4">
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">Aggregate trust score</div>
          <div className="kpi-num">{trustScore}</div>
          <div className="text-[11px] text-ink-dim">100 = perfect</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">Rules tracked</div>
          <div className="kpi-num">{filtered.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">P1/P2 failing now</div>
          <div className="kpi-num text-danger">
            {filtered.filter((r) => r.status !== 'pass' && (r.severity === 'P1' || r.severity === 'P2')).length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] text-ink-dim">Quarantined rows (24h)</div>
          <div className="kpi-num">{filtered.reduce((s, r) => s + r.failing, 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Trust by dimension" className="lg:col-span-2">
          <SimpleChart kind="bar" data={dimChart} height={200} tone="accent" />
        </Card>
        <Card title="Filter">
          <div className="flex flex-wrap gap-2">
            <button
              className={`chip ${filterDim === 'All' ? 'chip-accent' : ''}`}
              onClick={() => setFilterDim('All')}
            >
              All
            </button>
            {dimensions.map((d) => (
              <button
                key={d}
                className={`chip ${filterDim === d ? 'chip-accent' : ''}`}
                onClick={() => setFilterDim(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <table className="table-grid">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Field</th>
              <th>Rule</th>
              <th>Dimension</th>
              <th>Severity</th>
              <th>Status</th>
              <th className="num">Passing</th>
              <th className="num">Failing</th>
              <th>Steward</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                <td className="id-mono text-xs">{r.dataset}</td>
                <td className="id-mono text-xs">{r.field}</td>
                <td className="text-sm">{r.rule}</td>
                <td><span className="chip">{r.dimension}</span></td>
                <td><StatusChip status={r.severity} /></td>
                <td><StatusChip status={r.status} /></td>
                <td className="num">{r.passing.toLocaleString()}</td>
                <td className="num text-danger">{r.failing.toLocaleString()}</td>
                <td>{r.steward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? selected.rule : ''}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[11px] text-ink-dim">Dataset</div><div className="id-mono">{selected.dataset}</div></div>
              <div><div className="text-[11px] text-ink-dim">Field</div><div className="id-mono">{selected.field}</div></div>
              <div><div className="text-[11px] text-ink-dim">Dimension</div><div>{selected.dimension}</div></div>
              <div><div className="text-[11px] text-ink-dim">Severity</div><StatusChip status={selected.severity} /></div>
            </div>
            <div>
              <div className="section-title mb-1">Sample failing rows (tokenized)</div>
              <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto">
{`row 18421  ${selected.field}=null    posted_at=2026-05-17 09:12 ET
row 18509  ${selected.field}=invalid posted_at=2026-05-17 09:18 ET
row 18620  ${selected.field}=bad-cd  posted_at=2026-05-17 09:24 ET`}
              </pre>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => toast('Assigned to steward + 24h SLA timer', 'info')}>
                Assign to steward
              </button>
              <button className="btn-ghost" onClick={() => toast('Rows moved to quarantine', 'warn')}>
                Quarantine rows
              </button>
              <button className="btn-primary" onClick={() => toast('Rule marked remediated · audit log appended', 'success')}>
                Mark remediated
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
