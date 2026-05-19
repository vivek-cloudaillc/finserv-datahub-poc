import { useMemo, useState } from 'react';
import { Card, Drawer, PageHeader, StatusChip } from '../components/ui';
import { datasets } from '../data';
import type { Dataset } from '../types';
import { Search } from 'lucide-react';

const glossary = [
  { term: 'Master Customer Record (MCR)', owner: 'Marcus Wright', def: 'Resolved customer identity across all sources; bi-temporal; deterministic + probabilistic.' },
  { term: 'Trade 360', owner: 'Henry Vasquez', def: 'Cross-asset trade lifecycle from OMS to confirmation to settlement.' },
  { term: 'IFRS-17 Cohort', owner: 'Carla Rodriguez', def: 'Group of contracts for IFRS-17 measurement; tied to contract boundary.' },
  { term: 'Loss Ratio', owner: 'Carla Rodriguez', def: 'Incurred loss / earned premium; key insurance profitability metric.' },
  { term: 'Best-Ex Score', owner: 'Henry Vasquez', def: 'Best-execution measurement combining venue, time-of-day, IS slippage.' },
  { term: 'OFAC Hit', owner: 'Janelle Cruz', def: 'Match against US Treasury OFAC sanctions lists at configured threshold.' },
  { term: 'Section 1033 Consent', owner: 'Aisha Patel', def: 'Consumer authorization to share data with third parties under FDX 6.x.' },
  { term: 'BCBS 239', owner: 'Marcus Wright', def: 'Risk data aggregation principles: accuracy, integrity, completeness, timeliness, adaptability.' },
];

export function Governance() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Dataset | null>(null);

  const filtered = useMemo(() => {
    if (!q) return datasets;
    return datasets.filter(
      (d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.owner.toLowerCase().includes(q.toLowerCase()),
    );
  }, [q]);

  return (
    <div>
      <PageHeader title="Governance / Catalog" subtitle="Business glossary · technical catalog · physical catalog · stewardship · MNPI markers" />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Business glossary" subtitle="Selected terms — full glossary 320 entries" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            {glossary.map((g) => (
              <div key={g.term} className="p-3 rounded-input border border-line-light dark:border-line-dark">
                <div className="text-sm font-medium">{g.term}</div>
                <div className="text-[11px] text-ink-dim">Owner · {g.owner}</div>
                <div className="text-xs mt-1">{g.def}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Catalog connectors">
          <ul className="text-sm space-y-2">
            <li>AWS Glue Data Catalog · live</li>
            <li>DataHub · live</li>
            <li>Collibra · two-way connector</li>
            <li>Alation · push connector</li>
            <li>Atlan · push connector</li>
            <li>Informatica IDMC · scheduled</li>
          </ul>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2 input max-w-md">
          <Search size={14} className="text-ink-dim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search catalog…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <Card padded={false}>
        <table className="table-grid">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Tier</th>
              <th>Owner</th>
              <th>Sensitivity</th>
              <th>Sub-sector</th>
              <th>Last refresh</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="cursor-pointer" onClick={() => setSelected(d)}>
                <td>
                  <div className="id-mono text-xs">{d.name}</div>
                  <div className="text-[11px] text-ink-dim">{d.format}</div>
                </td>
                <td><span className="chip-accent">{d.tier}</span></td>
                <td>{d.owner}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <StatusChip status={d.sensitivity} />
                    {d.sensitivity === 'MNPI' && <span className="chip">Info-Barrier</span>}
                  </div>
                </td>
                <td><span className="chip">{d.subSector}</span></td>
                <td className="text-xs text-ink-dim">{d.lastRefresh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-3 text-sm">
            <div><div className="text-[11px] text-ink-dim">Tier</div><div>{selected.tier}</div></div>
            <div><div className="text-[11px] text-ink-dim">Owner</div><div>{selected.owner}</div></div>
            <div><div className="text-[11px] text-ink-dim">Sensitivity</div><StatusChip status={selected.sensitivity} /></div>
            <div><div className="text-[11px] text-ink-dim">Policies applied</div>
              <ul className="list-disc pl-4 text-xs">
                <li>RBAC · {selected.sensitivity === 'MNPI' ? 'Trading desk only' : 'Default + ABAC'}</li>
                <li>Row-level security by legal entity</li>
                <li>Column masking · tokenization for downstream marketing</li>
                <li>{selected.sensitivity === 'MNPI' ? 'Information barrier · sell-side desks only' : 'Standard'}</li>
              </ul>
            </div>
            <div>
              <button className="btn-primary">Request access</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
