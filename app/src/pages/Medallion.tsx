import { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, PageHeader, StatusChip } from '../components/ui';
import { datasets, medallionFlows, sources, stageKindColor, tierMeta } from '../data';
import type { MedallionFlow, MedallionStage, MedallionTier } from '../data';
import type { Dataset } from '../types';
import { ArrowRight, ChevronRight, Clock, Database, Layers, Lock, Workflow } from 'lucide-react';

const TIERS: MedallionTier[] = ['Source', 'Bronze', 'Silver', 'Gold', 'Platinum'];

type View = 'flow' | 'datasets';

export function Medallion() {
  const { subSector } = useApp();
  const [view, setView] = useState<View>('flow');
  const [selectedFlowId, setSelectedFlowId] = useState(medallionFlows[0].id);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(medallionFlows[0].stages[0].id);
  const [datasetSelected, setDatasetSelected] = useState<Dataset | null>(null);

  const flowsFiltered = useMemo(
    () =>
      medallionFlows.filter(
        (f) => subSector === 'All' || f.subSector === subSector || f.subSector === 'Cross',
      ),
    [subSector],
  );

  const flow = flowsFiltered.find((f) => f.id === selectedFlowId) ?? flowsFiltered[0] ?? medallionFlows[0];
  const stage =
    flow.stages.find((s) => s.id === selectedStageId) ?? flow.stages[0];
  const sourceMeta = sources.find((s) => s.id === flow.source);

  return (
    <div>
      <PageHeader
        title="Medallion Explorer"
        subtitle="Apache Iceberg lakehouse — Source → Bronze → Silver → Gold → Platinum. Every stage is contract-backed, lineage-traced, and time-travelable."
        actions={
          <div className="flex rounded-input border border-line-light dark:border-line-dark overflow-hidden">
            <button
              className={`px-3 py-1.5 text-xs ${view === 'flow' ? 'bg-accent text-white' : 'text-ink-dim'}`}
              onClick={() => setView('flow')}
            >
              <Workflow size={12} className="inline mr-1" /> Flow detail
            </button>
            <button
              className={`px-3 py-1.5 text-xs ${view === 'datasets' ? 'bg-accent text-white' : 'text-ink-dim'}`}
              onClick={() => setView('datasets')}
            >
              <Database size={12} className="inline mr-1" /> Dataset browser
            </button>
          </div>
        }
      />

      {/* Tier legend — always visible · clean ring-style cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-5">
        {TIERS.map((t) => (
          <div key={t} className={`p-3 rounded-card bg-card-light dark:bg-card-dark border border-line-light dark:border-line-dark`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${tierMeta[t].bg.split(' ')[0]} ring-2 ${tierMeta[t].ring}`} />
              <span className={`text-[11px] font-semibold ${tierMeta[t].color}`}>{t}</span>
            </div>
            <div className="text-[11px] text-ink-dim mt-1 leading-tight">{tierMeta[t].description}</div>
            <div className="text-[10px] text-ink-dim mt-1.5 flex items-center gap-1">
              <Lock size={9} /> {tierMeta[t].retention}
            </div>
          </div>
        ))}
      </div>

      {view === 'flow' && (
        <>
          {/* Flow picker */}
          <div className="card p-3 mb-4">
            <div className="text-[11px] text-ink-dim mb-2">Pick a canonical FinServ data flow ({flowsFiltered.length})</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {flowsFiltered.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFlowId(f.id);
                    setSelectedStageId(f.stages[0].id);
                  }}
                  className={`flex-shrink-0 text-left p-3 rounded-input border min-w-[260px] max-w-[300px] ${
                    f.id === selectedFlowId
                      ? 'border-accent bg-accent/5'
                      : 'border-line-light dark:border-line-dark hover:border-accent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="chip">{f.subSector}</span>
                    <span className="text-[10px] text-ink-dim">{f.endToEndSla}</span>
                  </div>
                  <div className="text-sm font-medium leading-snug">{f.name}</div>
                  <div className="text-[11px] text-ink-dim mt-1 truncate">{f.volume}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Headline cards for the selected flow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <Card title="Business outcome" subtitle={flow.name}>
              <div className="text-sm leading-relaxed">{flow.outcome}</div>
              <div className="flex flex-wrap gap-1 mt-3">
                {flow.regulatorTags.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </Card>
            <Card title="Source system">
              {sourceMeta ? (
                <div className="text-sm space-y-1">
                  <div className="font-medium">{sourceMeta.name}</div>
                  <div className="text-[11px] text-ink-dim">{sourceMeta.vendor} · {sourceMeta.category}</div>
                  <div className="text-[11px] text-ink-dim mt-2">Protocol</div>
                  <div className="text-xs">{sourceMeta.protocol}</div>
                  <div className="text-[11px] text-ink-dim mt-2">Sensitivity</div>
                  <div><StatusChip status={sourceMeta.sensitivity} /></div>
                </div>
              ) : (
                <div className="text-xs text-ink-dim">Source not found</div>
              )}
            </Card>
            <Card title="Throughput & SLA">
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-ink-dim">Volume @ ref customer</span><span className="font-medium">{flow.volume}</span></div>
                <div className="flex justify-between"><span className="text-ink-dim">End-to-end SLA</span><span className="font-medium">{flow.endToEndSla}</span></div>
                <div className="flex justify-between"><span className="text-ink-dim">Stages</span><span>{flow.stages.length}</span></div>
                <div className="flex justify-between"><span className="text-ink-dim">Idempotency</span><span className="text-xs">Per-event natural key</span></div>
              </div>
            </Card>
          </div>

          {/* The big horizontal flow diagram */}
          <Card title="Stage-by-stage transformation" subtitle="Tap a stage to see the transformation, sample I/O, and code">
            <FlowDiagram flow={flow} activeId={stage.id} onSelect={setSelectedStageId} />
          </Card>

          {/* Selected stage detail */}
          <div className="mt-4">
            <StageDetail flow={flow} stage={stage} />
          </div>
        </>
      )}

      {view === 'datasets' && (
        <DatasetBrowser datasetSelected={datasetSelected} setDatasetSelected={setDatasetSelected} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage flow diagram (horizontal pipeline with tier swimlanes)
// ─────────────────────────────────────────────────────────────────────────────

function FlowDiagram({
  flow,
  activeId,
  onSelect,
}: {
  flow: MedallionFlow;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-2 min-w-max">
        {flow.stages.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => onSelect(s.id)}
              className={`text-left w-[200px] p-3 rounded-input border transition-all ${
                s.id === activeId
                  ? `border-accent bg-accent/5 shadow-card`
                  : 'border-line-light dark:border-line-dark hover:border-accent'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-chip ${tierMeta[s.tier].bg} ${tierMeta[s.tier].color}`}
                >
                  {s.tier}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-chip ${stageKindColor[s.kind]}`}>
                  {s.kind}
                </span>
              </div>
              <div className="text-xs font-semibold leading-tight">{s.title}</div>
              <div className="text-[11px] text-ink-dim mt-1 leading-tight line-clamp-2">{s.summary}</div>
              <div className="text-[10px] text-ink-dim mt-2 flex items-center gap-1">
                <Clock size={9} /> {s.sla}
              </div>
            </button>
            {i < flow.stages.length - 1 && (
              <ArrowRight size={14} className="text-ink-dim flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage detail — description, rules, sample in/out, code
// ─────────────────────────────────────────────────────────────────────────────

function StageDetail({ flow, stage }: { flow: MedallionFlow; stage: MedallionStage }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-chip ${tierMeta[stage.tier].bg} ${tierMeta[stage.tier].color}`}>
                  {stage.tier}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-chip ${stageKindColor[stage.kind]}`}>
                  {stage.kind}
                </span>
                <span className="text-[11px] text-ink-dim">· stage of {flow.name}</span>
              </div>
              <div className="text-lg font-semibold">{stage.title}</div>
            </div>
          </div>
          <div className="text-sm leading-relaxed">{stage.description}</div>

          <div className="grid sm:grid-cols-2 gap-3 mt-4 text-xs">
            <div>
              <div className="text-[11px] text-ink-dim">Engine</div>
              <div className="font-medium">{stage.engine}</div>
            </div>
            <div>
              <div className="text-[11px] text-ink-dim">SLA</div>
              <div className="font-medium">{stage.sla}</div>
            </div>
            {stage.idempotency && (
              <div className="sm:col-span-2">
                <div className="text-[11px] text-ink-dim">Idempotency / exactly-once</div>
                <div className="text-xs">{stage.idempotency}</div>
              </div>
            )}
          </div>
        </Card>

        {stage.code && (
          <Card title="Transformation code" subtitle="What actually runs at this stage">
            <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto whitespace-pre">
              {stage.code}
            </pre>
          </Card>
        )}

        {(stage.sampleIn || stage.sampleOut) && (
          <div className="grid sm:grid-cols-2 gap-3">
            {stage.sampleIn && (
              <Card title="Sample input">
                <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(stage.sampleIn, null, 2)}
                </pre>
              </Card>
            )}
            {stage.sampleOut && (
              <Card title="Sample output">
                <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(stage.sampleOut, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Card title="Contract / quality rules" subtitle="Enforced at this stage · breach routes to DLQ + steward">
          <ul className="text-xs space-y-1.5">
            {stage.rules.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Lineage in this flow">
          <ol className="text-xs space-y-1">
            {flow.stages.map((s, i) => (
              <li
                key={s.id}
                className={`flex items-center gap-2 ${s.id === stage.id ? 'text-accent font-semibold' : 'text-ink-dim'}`}
              >
                <span className="w-4 text-center">{i + 1}</span>
                <span className={`px-1.5 py-0.5 rounded-chip text-[10px] ${tierMeta[s.tier].bg} ${tierMeta[s.tier].color}`}>
                  {s.tier}
                </span>
                <span className="flex-1 truncate">{s.title}</span>
                {s.id === stage.id && <ChevronRight size={12} />}
              </li>
            ))}
          </ol>
        </Card>

        <Card title="What this stage unlocks">
          <ul className="text-xs space-y-1.5">
            <li className="flex items-start gap-2">
              <Layers size={11} className="text-accent mt-0.5 flex-shrink-0" />
              <span>{flow.outcome}</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock size={11} className="text-accent mt-0.5 flex-shrink-0" />
              <span>Lineage + retention enables: {flow.regulatorTags.join(' · ')}</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Existing dataset browser, kept under the second tab
// ─────────────────────────────────────────────────────────────────────────────

function DatasetBrowser({
  datasetSelected,
  setDatasetSelected,
}: {
  datasetSelected: Dataset | null;
  setDatasetSelected: (d: Dataset | null) => void;
}) {
  const { subSector } = useApp();
  const [showPlatinum, setShowPlatinum] = useState(true);

  const filtered = useMemo(
    () => datasets.filter((d) => subSector === 'All' || d.subSector === subSector || d.subSector === 'Cross'),
    [subSector],
  );
  const byTier = (t: Dataset['tier']) => filtered.filter((d) => d.tier === t);
  const cols: Dataset['tier'][] = showPlatinum ? ['Bronze', 'Silver', 'Gold', 'Platinum'] : ['Bronze', 'Silver', 'Gold'];

  return (
    <>
      <div className="flex justify-end mb-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={showPlatinum}
            onChange={(e) => setShowPlatinum(e.target.checked)}
          />
          Show Platinum tier
        </label>
      </div>
      <div className={`grid gap-4 ${showPlatinum ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {cols.map((c) => (
          <Card key={c} title={`${c}`} subtitle={tierMeta[c].description}>
            <div className="space-y-2">
              {byTier(c).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDatasetSelected(d)}
                  className={`w-full text-left p-3 rounded-input border ${
                    datasetSelected?.id === d.id
                      ? 'border-accent bg-accent/5'
                      : 'border-line-light dark:border-line-dark hover:border-accent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="id-mono text-xs truncate">{d.name}</div>
                    <StatusChip status={d.sensitivity} />
                  </div>
                  <div className="text-[11px] text-ink-dim">{d.rows} · {d.format}</div>
                </button>
              ))}
              {byTier(c).length === 0 && (
                <div className="text-xs text-ink-dim text-center py-4">No datasets at this tier for the current sub-sector filter.</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {datasetSelected && (
        <div className="mt-5">
          <Card title={datasetSelected.name} subtitle={`${datasetSelected.tier} · ${datasetSelected.format} · last refresh ${datasetSelected.lastRefresh}`}>
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <div className="section-title mb-2">Schema</div>
                <table className="table-grid">
                  <thead>
                    <tr><th>Column</th><th>Type</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    {datasetSelected.schema.map((c) => (
                      <tr key={c.col}>
                        <td className="id-mono flex items-center gap-1">
                          {c.col}
                          {c.pii && <span className="chip-accent">pii</span>}
                        </td>
                        <td className="text-xs text-ink-dim">{c.type}</td>
                        <td className="text-xs">{c.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="section-title mb-2">Sample (tokenized)</div>
                <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto">
                  {JSON.stringify(datasetSelected.sample, null, 2)}
                </pre>
                <div className="section-title mt-4 mb-2">Lineage</div>
                <div className="flex flex-col gap-2 text-xs">
                  <div><span className="text-ink-dim">Upstream · </span>{datasetSelected.upstream.length > 0 ? datasetSelected.upstream.join(', ') : '—'}</div>
                  <div><span className="text-ink-dim">Downstream · </span>{datasetSelected.downstream.length > 0 ? datasetSelected.downstream.join(', ') : '—'}</div>
                  <div><span className="text-ink-dim">Partitions · </span>{datasetSelected.partitions}</div>
                  <div><span className="text-ink-dim">Owner · </span>{datasetSelected.owner}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
