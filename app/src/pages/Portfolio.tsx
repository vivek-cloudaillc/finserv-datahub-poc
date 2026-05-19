import { useMemo, useState } from 'react';
import { Card, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { customers } from '../data';
import { Sparkles } from 'lucide-react';

const benchmark = Array.from({ length: 12 }, (_, i) => ({
  name: `M-${11 - i}`,
  value: 100 + i * 0.6 + Math.sin(i / 2) * 0.4,
}));
const portfolio = benchmark.map((b, i) => ({
  name: b.name,
  value: b.value + 0.9 + Math.sin((i + 2) / 2) * 0.5,
}));

export function Portfolio() {
  const wealthClients = useMemo(
    () => customers.filter((c) => c.positions.length > 0).slice(0, 16),
    [],
  );
  const [selectedId, setSelectedId] = useState(wealthClients[0]?.id ?? customers[0].id);
  const client = customers.find((c) => c.id === selectedId) ?? customers[0];
  const totalMv = client.positions.reduce((s, p) => s + p.marketValue, 0);
  const totalCost = client.positions.reduce((s, p) => s + p.costBasis, 0);
  const unrealized = totalMv - totalCost;

  const alloc = useMemo(() => {
    const map: Record<string, number> = {};
    client.positions.forEach((p) => {
      map[p.assetClass] = (map[p.assetClass] ?? 0) + p.marketValue;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [client]);

  return (
    <div>
      <PageHeader title="Portfolio & Positions" subtitle="Household → account → position drill-down · attribution vs. benchmark · Reg BI suitability" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <div className="section-title mb-2">Wealth clients</div>
            <div className="space-y-1 max-h-[480px] overflow-y-auto">
              {wealthClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    c.id === selectedId ? 'bg-accent/10 text-accent' : 'hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="text-sm font-medium">{c.firstName} {c.lastName}</div>
                  <div className="text-[11px] text-ink-dim">{c.segment} · {c.positions.length} positions</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Total market value</div>
              <div className="kpi-num tabular">${totalMv.toLocaleString()}</div>
            </div>
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Cost basis</div>
              <div className="kpi-num tabular">${totalCost.toLocaleString()}</div>
            </div>
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Unrealized P/L</div>
              <div className={`kpi-num tabular ${unrealized >= 0 ? 'text-ok' : 'text-danger'}`}>
                {unrealized >= 0 ? '+' : '-'}${Math.abs(unrealized).toLocaleString()}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-[11px] text-ink-dim">Custodian</div>
              <div className="text-sm font-medium mt-2">{client.positions[0]?.custodian ?? 'BNY Mellon'}</div>
              <div className="text-[11px] text-ink-dim mt-1">Recon · last pass 13:30 ET</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card title="Performance vs. blended benchmark (12mo, TWR)" className="lg:col-span-2">
              <div className="h-52">
                <SimpleChart
                  kind="line"
                  data={portfolio.map((p, i) => ({ name: p.name, value: Math.round(p.value * 100) / 100, extra: Math.round(benchmark[i].value * 100) / 100 }))}
                  height={200}
                />
              </div>
              <div className="text-[11px] text-ink-dim flex gap-3">
                <span><span className="inline-block w-3 h-1 bg-accent rounded-full mr-1" /> Portfolio</span>
                <span><span className="inline-block w-3 h-1 bg-line-dark dark:bg-line-light rounded-full mr-1" /> Blended benchmark</span>
              </div>
            </Card>
            <Card title="Allocation by asset class">
              <SimpleChart kind="donut" data={alloc} height={200} />
            </Card>
          </div>

          <Card title="Positions" padded={false}>
            <table className="table-grid">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>CUSIP</th>
                  <th>FIGI</th>
                  <th>Asset class</th>
                  <th className="num">Qty</th>
                  <th className="num">Cost</th>
                  <th className="num">MV</th>
                  <th>Custodian</th>
                  <th>FV Lvl</th>
                </tr>
              </thead>
              <tbody>
                {client.positions.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.symbol}</td>
                    <td className="id-mono text-xs">{p.cusip}</td>
                    <td className="id-mono text-xs">{p.figi}</td>
                    <td>{p.assetClass}</td>
                    <td className="num tabular">{p.qty.toLocaleString()}</td>
                    <td className="num tabular">${p.costBasis.toLocaleString()}</td>
                    <td className="num tabular">${p.marketValue.toLocaleString()}</td>
                    <td className="text-xs">{p.custodian}</td>
                    <td>L{p.fairValueLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Advisor copilot suggestion (Reg BI compliant)">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                Household tracking <span className="font-medium text-ok">+0.9% alpha YTD</span> vs. blended 60/40 benchmark. Concentration in
                US mega-cap exceeds policy by 4pts — recommend trim to model allocation at next rebalance. Suitability flags clear · advisor
                contact within last 14 days · Reg BI standard met. <StatusChip status="Compliant" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
