import { useMemo, useState } from 'react';
import { Card, PageHeader, StatusChip } from '../components/ui';
import { regulations } from '../data';
import { Download } from 'lucide-react';
import { useApp } from '../AppContext';

const categories: ('All' | 'Banking' | 'Capital Markets' | 'Insurance' | 'Payments' | 'Privacy' | 'Cross')[] = [
  'All',
  'Banking',
  'Capital Markets',
  'Insurance',
  'Payments',
  'Privacy',
  'Cross',
];

export function Compliance() {
  const { toast } = useApp();
  const [filter, setFilter] = useState<(typeof categories)[number]>('All');

  const filtered = useMemo(() => {
    return regulations.filter((r) => filter === 'All' || r.category === filter);
  }, [filter]);

  return (
    <div>
      <PageHeader
        title="Compliance Center"
        subtitle="Regulator-by-regulator status · evidence packets · sponsor-bank-grade export"
        actions={
          <button
            className="btn-primary"
            onClick={() => toast('Sponsor-bank evidence packet generated · S3 Object Lock link emailed', 'success')}
          >
            <Download size={14} /> Export evidence packet
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`chip ${filter === c ? 'chip-accent' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r) => {
          const pct = Math.round((r.implemented / r.controls) * 100);
          return (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="font-medium text-sm">{r.name}</div>
                <StatusChip status={r.status} />
              </div>
              <div className="text-[11px] text-ink-dim mb-2">{r.scope}</div>
              <div className="flex items-center gap-2 mb-2 text-xs">
                <span>{r.implemented} / {r.controls} controls</span>
                <div className="flex-1 h-1.5 rounded-full bg-line-light dark:bg-white/10 overflow-hidden">
                  <div className={`h-full ${pct === 100 ? 'bg-ok' : pct >= 80 ? 'bg-warn' : 'bg-danger'}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="tabular">{pct}%</span>
              </div>
              <div className="text-[11px] text-ink-dim mb-2">Evidence</div>
              <ul className="text-xs space-y-1">
                {r.evidence.slice(0, 3).map((e) => (
                  <li key={e}>· {e}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Card title="How the Hub helps" className="mt-5">
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="font-medium mb-1">Evidence-on-demand</div>
            <div className="text-xs text-ink-dim">
              Every Gold mart, every report, every model has bi-temporal lineage to source rows under S3 Object Lock Compliance Mode.
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">Sponsor-bank packets</div>
            <div className="text-xs text-ink-dim">
              One-click bundle of CDD, OFAC, SAR/CTR controls; AML Act 2020 effectiveness review aligned.
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">DORA Register of Information</div>
            <div className="text-xs text-ink-dim">
              Auto-assembled from the source catalog and TPP register; exportable in ESA template format.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
