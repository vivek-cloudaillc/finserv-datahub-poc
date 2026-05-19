import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../AppContext';
import { customers, sources, datasets, pipelines, amlAlerts, fraudCases } from '../data';
import type { ScreenKey } from '../types';

interface CommandItem {
  id: string;
  label: string;
  group: string;
  hint?: string;
  go: () => void;
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setScreen } = useApp();
  const [q, setQ] = useState('');

  const items = useMemo<CommandItem[]>(() => {
    const screens: { key: ScreenKey; label: string; group: string }[] = [
      { key: 'home', label: 'Executive Home', group: 'Screen' },
      { key: 'architecture', label: 'Ingestion Architecture', group: 'Screen' },
      { key: 'sources', label: 'Source Catalog', group: 'Screen' },
      { key: 'add-source', label: 'Add Source', group: 'Screen' },
      { key: 'trade-ingestion', label: 'Trade Ingestion · FNSV-184', group: 'Screen' },
      { key: 'pipelines', label: 'Pipelines', group: 'Screen' },
      { key: 'medallion', label: 'Medallion Explorer', group: 'Screen' },
      { key: 'quality', label: 'Data Quality', group: 'Screen' },
      { key: 'observability', label: 'Observability', group: 'Screen' },
      { key: 'governance', label: 'Governance', group: 'Screen' },
      { key: 'access', label: 'Access & Policies', group: 'Screen' },
      { key: 'customer-360', label: 'Customer 360', group: 'Screen' },
      { key: 'transaction-360', label: 'Transaction & Trade 360', group: 'Screen' },
      { key: 'portfolio', label: 'Portfolio & Positions', group: 'Screen' },
      { key: 'aml', label: 'AML Investigations', group: 'Screen' },
      { key: 'fraud', label: 'Fraud Operations', group: 'Screen' },
      { key: 'surveillance', label: 'Trade Surveillance', group: 'Screen' },
      { key: 'claims', label: 'Claims Operations', group: 'Screen' },
      { key: 'underwriting', label: 'Underwriting', group: 'Screen' },
      { key: 'nl', label: 'NL Insights', group: 'Screen' },
      { key: 'reporting', label: 'Regulatory Reporting', group: 'Screen' },
      { key: 'compliance', label: 'Compliance Center', group: 'Screen' },
      { key: 'model-governance', label: 'Model Governance (SR 11-7)', group: 'Screen' },
      { key: 'dora', label: 'DORA Center', group: 'Screen' },
      { key: 'admin', label: 'Admin Console', group: 'Screen' },
    ];
    const out: CommandItem[] = screens.map((s) => ({
      id: `scr-${s.key}`,
      label: s.label,
      group: s.group,
      go: () => {
        setScreen(s.key);
        setPaletteOpen(false);
      },
    }));
    sources.slice(0, 20).forEach((s) =>
      out.push({
        id: `src-${s.id}`,
        label: s.name,
        hint: s.vendor,
        group: 'Source',
        go: () => {
          setScreen('sources');
          setPaletteOpen(false);
        },
      }),
    );
    datasets.forEach((d) =>
      out.push({
        id: `ds-${d.id}`,
        label: d.name,
        hint: d.tier,
        group: 'Dataset',
        go: () => {
          setScreen('medallion');
          setPaletteOpen(false);
        },
      }),
    );
    pipelines.slice(0, 16).forEach((p) =>
      out.push({
        id: `pl-${p.id}`,
        label: p.name,
        hint: p.pattern,
        group: 'Pipeline',
        go: () => {
          setScreen('pipelines');
          setPaletteOpen(false);
        },
      }),
    );
    customers.slice(0, 30).forEach((c) =>
      out.push({
        id: `cu-${c.id}`,
        label: `${c.firstName} ${c.lastName}`,
        hint: `${c.segment} · ${c.city}, ${c.state}`,
        group: 'Customer',
        go: () => {
          setScreen('customer-360', { customerId: c.id });
          setPaletteOpen(false);
        },
      }),
    );
    amlAlerts.forEach((a) =>
      out.push({
        id: `aml-${a.id}`,
        label: `AML · ${a.typology} · ${a.id}`,
        hint: `score ${a.score}`,
        group: 'Alert',
        go: () => {
          setScreen('aml', { alertId: a.id });
          setPaletteOpen(false);
        },
      }),
    );
    fraudCases.forEach((f) =>
      out.push({
        id: `fr-${f.id}`,
        label: `Fraud · ${f.channel} · ${f.id}`,
        hint: `score ${f.riskScore}`,
        group: 'Case',
        go: () => {
          setScreen('fraud', { caseId: f.id });
          setPaletteOpen(false);
        },
      }),
    );
    return out;
  }, [setScreen, setPaletteOpen]);

  if (!paletteOpen) return null;

  const filtered = q
    ? items.filter((i) => `${i.label} ${i.hint ?? ''}`.toLowerCase().includes(q.toLowerCase())).slice(0, 50)
    : items.slice(0, 30);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 animate-fadein" onClick={() => setPaletteOpen(false)}>
      <div
        className="absolute left-1/2 top-[12vh] -translate-x-1/2 w-[680px] max-w-[92vw] card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-3 border-b border-line-light dark:border-line-dark">
          <Search size={16} className="text-ink-dim" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search screens, sources, datasets, pipelines, customers, alerts…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <kbd className="id-mono text-[10px] px-1.5 py-0.5 rounded bg-canvas-light dark:bg-canvas-dark border border-line-light dark:border-line-dark">
            esc
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-ink-dim text-center">No matches</div>
          ) : (
            filtered.map((it) => (
              <button
                key={it.id}
                onClick={it.go}
                className="w-full px-3 py-2 flex items-center justify-between gap-3 text-left hover:bg-canvas-light dark:hover:bg-white/5"
              >
                <div className="min-w-0">
                  <div className="text-sm truncate">{it.label}</div>
                  {it.hint && <div className="text-[11px] text-ink-dim truncate">{it.hint}</div>}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-ink-dim">{it.group}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
