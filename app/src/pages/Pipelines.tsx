import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, Drawer, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { medallionFlows, pipelines, sources, stageKindColor, tierMeta } from '../data';
import type { MedallionFlow } from '../data';
import { ArrowRight, ChevronDown, Clock, Layers, Pause, Play, Plus, RefreshCw, Workflow } from 'lucide-react';
import type { Pipeline } from '../types';
import { layerTransitions, PipelineBuilder } from './PipelineBuilder';
import type { LayerTransitionMeta } from './PipelineBuilder';

export function Pipelines() {
  const { subSector, toast, consumeScreenParams, userPipelines } = useApp();
  const [selected, setSelected] = useState<Pipeline | null>(null);

  // New pipeline · layer dropdown + builder state
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [builderTransition, setBuilderTransition] = useState<LayerTransitionMeta | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setLayerMenuOpen(false);
      }
    }
    if (layerMenuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [layerMenuOpen]);

  useEffect(() => {
    const p = consumeScreenParams();
    if (p.pipelineId) {
      const all = [...userPipelines, ...pipelines];
      const match = all.find((x) => x.id === p.pipelineId);
      if (match) setSelected(match);
    }
  }, [consumeScreenParams, userPipelines]);

  const allPipelines = useMemo(() => [...userPipelines, ...pipelines], [userPipelines]);
  const filtered = useMemo(
    () => allPipelines.filter((p) => subSector === 'All' || p.subSector === subSector || p.subSector === 'Cross'),
    [allPipelines, subSector],
  );

  const counts = {
    healthy: filtered.filter((p) => p.status === 'healthy').length,
    warning: filtered.filter((p) => p.status === 'warning').length,
    failed: filtered.filter((p) => p.status === 'failed').length,
    running: filtered.filter((p) => p.status === 'running').length,
  };
  const totalDlq = filtered.reduce((s, p) => s + p.dlq, 0);

  const throughputSeries = Array.from({ length: 14 }, (_, i) => ({
    name: `D-${13 - i}`,
    value: Math.round(2_500_000 + Math.sin(i / 2) * 480_000 + i * 12000),
  }));

  // Group pipelines by tier for the swimlane view
  const byTier: Record<Pipeline['tier'], Pipeline[]> = {
    Bronze: filtered.filter((p) => p.tier === 'Bronze'),
    Silver: filtered.filter((p) => p.tier === 'Silver'),
    Gold: filtered.filter((p) => p.tier === 'Gold'),
    Platinum: filtered.filter((p) => p.tier === 'Platinum'),
  };

  // Map a pipeline to a canonical medallion flow (best-effort by source)
  const flowForPipeline = (p: Pipeline): MedallionFlow | undefined =>
    medallionFlows.find((f) => f.source === p.source);

  return (
    <div>
      <PageHeader
        title="Ingestion Pipelines"
        subtitle="Batch · Micro-Batch · Streaming · CDC · Webhook — declarative pipeline-as-code, idempotent, replayable, observable end-to-end."
        actions={
          <div className="relative" ref={menuRef}>
            <button
              className="btn-primary"
              onClick={() => setLayerMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={layerMenuOpen}
            >
              <Plus size={14} /> New pipeline <ChevronDown size={13} />
            </button>
            {layerMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-[360px] card overflow-hidden z-30 animate-fadein"
              >
                <div className="px-3 py-2 border-b border-line-light dark:border-line-dark text-[10px] uppercase tracking-widest font-semibold text-ink-dim">
                  Choose a layer transition
                </div>
                {layerTransitions.map((lt) => (
                  <button
                    key={lt.id}
                    role="menuitem"
                    onClick={() => {
                      setBuilderTransition(lt);
                      setLayerMenuOpen(false);
                    }}
                    className="w-full px-3 py-3 flex items-start gap-3 text-left hover:bg-canvas-light dark:hover:bg-white/5 border-b border-line-light/60 dark:border-line-dark/60 last:border-b-0"
                  >
                    <span className={`w-9 h-9 rounded-input flex items-center justify-center flex-shrink-0 ${tierMeta[lt.toTier].bg}`}>
                      <Layers size={16} className={tierMeta[lt.toTier].color} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{lt.title}</div>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-chip ${tierMeta[lt.toTier].bg} ${tierMeta[lt.toTier].color}`}>
                          {lt.tierLabel.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-dim mt-0.5">{lt.blurb}</div>
                    </div>
                    <ArrowRight size={14} className="text-ink-dim mt-1 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <div className="card p-4"><div className="text-[11px] text-ink-dim">Healthy</div><div className="kpi-num text-ok">{counts.healthy}</div></div>
        <div className="card p-4"><div className="text-[11px] text-ink-dim">Warning</div><div className="kpi-num text-warn">{counts.warning}</div></div>
        <div className="card p-4"><div className="text-[11px] text-ink-dim">Failed</div><div className="kpi-num text-danger">{counts.failed}</div></div>
        <div className="card p-4"><div className="text-[11px] text-ink-dim">Running now</div><div className="kpi-num text-accent">{counts.running}</div></div>
        <div className="card p-4"><div className="text-[11px] text-ink-dim">DLQ rows</div><div className={`kpi-num ${totalDlq > 0 ? 'text-warn' : 'text-ok'}`}>{totalDlq}</div></div>
      </div>

      <Card title="Throughput across all rails (14d, rows / day)" className="mb-4">
        <SimpleChart kind="area" data={throughputSeries} height={180} />
      </Card>

      {/* Swimlane view by medallion tier */}
      <Card title="Pipelines by tier (medallion swimlanes)" subtitle="Click any pipeline to see its full stage DAG" padded={false} className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 p-3">
          {(['Bronze', 'Silver', 'Gold', 'Platinum'] as const).map((tier) => (
            <div
              key={tier}
              className="p-3 rounded-input bg-canvas-light dark:bg-canvas-dark border border-line-light dark:border-line-dark min-h-[160px]"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${tierMeta[tier].bg.split(' ')[0]} ring-2 ${tierMeta[tier].ring}`} />
                <span className={`text-xs font-semibold ${tierMeta[tier].color}`}>{tier}</span>
              </div>
              <div className="space-y-1.5">
                {byTier[tier].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="w-full text-left p-2 rounded-input bg-card-light dark:bg-card-dark border border-line-light dark:border-line-dark hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-medium truncate">{p.name}</span>
                      <StatusChip status={p.status} />
                    </div>
                    <div className="text-[10px] text-ink-dim mt-1 flex items-center gap-1.5">
                      <span>{p.pattern}</span>·<span>{p.p95Latency}</span>·<span>DLQ {p.dlq}</span>
                    </div>
                  </button>
                ))}
                {byTier[tier].length === 0 && (
                  <div className="text-[11px] text-ink-dim italic">No pipelines in this tier for the current sub-sector filter.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Full pipelines table */}
      <Card title="All pipelines" padded={false}>
        <table className="table-grid">
          <thead>
            <tr>
              <th>Pipeline</th>
              <th>Source</th>
              <th>Pattern</th>
              <th>Tier</th>
              <th>Schedule</th>
              <th>Status</th>
              <th className="num">Success</th>
              <th className="num">P95</th>
              <th className="num">DLQ</th>
              <th>Last run</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const src = sources.find((s) => s.id === p.source);
              return (
                <tr key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                  <td>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-[11px] text-ink-dim">{p.id}</div>
                  </td>
                  <td className="text-xs">{src?.name ?? p.source}</td>
                  <td><span className="chip">{p.pattern}</span></td>
                  <td>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-chip ${tierMeta[p.tier].bg} ${tierMeta[p.tier].color}`}>
                      {p.tier}
                    </span>
                  </td>
                  <td className="text-xs text-ink-dim">{p.schedule}</td>
                  <td><StatusChip status={p.status} /></td>
                  <td className="num tabular">{p.successRate}%</td>
                  <td className="num text-xs">{p.p95Latency}</td>
                  <td className={`num tabular ${p.dlq > 0 ? 'text-warn' : ''}`}>{p.dlq}</td>
                  <td className="text-xs text-ink-dim">{p.lastRun}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width="w-[860px]">
        {selected && <PipelineDetail pipeline={selected} flow={flowForPipeline(selected)} toast={toast} />}
      </Drawer>

      {/* Pipeline builder · slide-in wizard */}
      <PipelineBuilder
        open={!!builderTransition}
        transition={builderTransition}
        onClose={() => setBuilderTransition(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline detail — stage DAG + run history + DLQ + replay + YAML
// ─────────────────────────────────────────────────────────────────────────────

function PipelineDetail({
  pipeline,
  flow,
  toast,
}: {
  pipeline: Pipeline;
  flow: MedallionFlow | undefined;
  toast: (text: string, tone?: 'info' | 'success' | 'warn' | 'danger') => void;
}) {
  const [tab, setTab] = useState<'dag' | 'runs' | 'dlq' | 'config'>('dag');
  const src = sources.find((s) => s.id === pipeline.source);

  // Synthetic run history series
  const runs = Array.from({ length: 24 }, (_, i) => ({
    name: `R-${23 - i}`,
    value: Math.round(pipeline.successRate + Math.sin(i / 3) * 1.6 - (i === 5 ? 4 : 0)),
  }));

  // DLQ row examples
  const dlqRows = [
    { row: 18421, field: 'creditor_bic', issue: 'BIC not in SWIFTRef', rule: 'ofac_screen.bic_valid', severity: 'P2' },
    { row: 18509, field: 'amount', issue: 'Negative interbank settlement amt', rule: 'amount > 0', severity: 'P1' },
    { row: 18620, field: 'mcr_id', issue: 'Confidence 0.81 < 0.92 threshold', rule: 'mcr.confidence ≥ 0.92', severity: 'P2' },
    { row: 18712, field: 'schema_version', issue: 'pacs.008.001.09 (expected .10)', rule: 'iso20022.version', severity: 'P2' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-chip ${tierMeta[pipeline.tier].bg} ${tierMeta[pipeline.tier].color}`}>
              {pipeline.tier}
            </span>
            <span className="chip">{pipeline.pattern}</span>
            <StatusChip status={pipeline.status} />
          </div>
          <div className="text-xs text-ink-dim">
            {src?.name} · {pipeline.schedule} · last run {pipeline.lastRun}
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button className="btn-ghost" onClick={() => toast(`Replay window queued for ${pipeline.id}`, 'info')}>
            <RefreshCw size={12} /> Replay
          </button>
          <button className="btn-ghost" onClick={() => toast(`Pipeline ${pipeline.id} paused`, 'warn')}>
            <Pause size={12} /> Pause
          </button>
          <button className="btn-primary" onClick={() => toast(`Manual run triggered for ${pipeline.id}`, 'success')}>
            <Play size={12} /> Run now
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="card p-3"><div className="text-[10px] text-ink-dim">Success rate</div><div className="text-base font-semibold tabular">{pipeline.successRate}%</div></div>
        <div className="card p-3"><div className="text-[10px] text-ink-dim">P95 latency</div><div className="text-base font-semibold">{pipeline.p95Latency}</div></div>
        <div className="card p-3"><div className="text-[10px] text-ink-dim">Throughput</div><div className="text-base font-semibold">{pipeline.throughput}</div></div>
        <div className="card p-3"><div className="text-[10px] text-ink-dim">DLQ depth</div><div className={`text-base font-semibold ${pipeline.dlq > 0 ? 'text-warn' : 'text-ok'}`}>{pipeline.dlq}</div></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-line-light dark:border-line-dark">
        {(['dag', 'runs', 'dlq', 'config'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs -mb-px border-b-2 ${
              tab === t ? 'border-accent text-accent font-medium' : 'border-transparent text-ink-dim hover:text-ink-light'
            }`}
          >
            {t === 'dag' ? 'Stage DAG' : t === 'runs' ? 'Run history' : t === 'dlq' ? `DLQ (${pipeline.dlq})` : 'Config (YAML)'}
          </button>
        ))}
      </div>

      {tab === 'dag' && (
        <div>
          {flow ? (
            <>
              <div className="text-xs text-ink-dim mb-3">
                <Workflow size={11} className="inline mr-1" />
                Mapped to canonical flow · <span className="font-medium text-ink-light dark:text-ink-dark">{flow.name}</span>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="flex items-stretch gap-2 min-w-max">
                  {flow.stages.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="w-[180px] p-2.5 rounded-input border border-line-light dark:border-line-dark bg-canvas-light dark:bg-canvas-dark">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-chip ${tierMeta[s.tier].bg} ${tierMeta[s.tier].color}`}>{s.tier}</span>
                          <span className={`text-[9px] font-medium px-1 py-0.5 rounded-chip ${stageKindColor[s.kind]}`}>{s.kind}</span>
                        </div>
                        <div className="text-xs font-semibold leading-tight">{s.title}</div>
                        <div className="text-[10px] text-ink-dim mt-1 leading-tight line-clamp-2">{s.summary}</div>
                        <div className="text-[9px] text-ink-dim mt-1.5 flex items-center gap-1"><Clock size={8} /> {s.sla}</div>
                      </div>
                      {i < flow.stages.length - 1 && <ArrowRight size={12} className="text-ink-dim flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-ink-dim mt-3">
                End-to-end SLA: <span className="font-medium text-ink-light dark:text-ink-dark">{flow.endToEndSla}</span> · regulator coverage: {flow.regulatorTags.join(', ')}
              </div>
            </>
          ) : (
            <div className="text-sm text-ink-dim">No canonical flow mapped for this pipeline yet.</div>
          )}
        </div>
      )}

      {tab === 'runs' && (
        <div>
          <SimpleChart kind="bar" data={runs} height={160} />
          <div className="mt-3">
            <table className="table-grid">
              <thead><tr><th>Run</th><th>Started</th><th>Duration</th><th>Rows</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td className="id-mono text-xs">run-2026-05-17-14:03</td><td className="text-xs">14:03:18</td><td className="text-xs">{pipeline.p95Latency}</td><td className="num">{pipeline.throughput}</td><td><StatusChip status={pipeline.status} /></td></tr>
                <tr><td className="id-mono text-xs">run-2026-05-17-13:03</td><td className="text-xs">13:03:14</td><td className="text-xs">{pipeline.p95Latency}</td><td className="num">{pipeline.throughput}</td><td><StatusChip status="healthy" /></td></tr>
                <tr><td className="id-mono text-xs">run-2026-05-17-12:03</td><td className="text-xs">12:03:12</td><td className="text-xs">{pipeline.p95Latency}</td><td className="num">{pipeline.throughput}</td><td><StatusChip status="healthy" /></td></tr>
                <tr><td className="id-mono text-xs">run-2026-05-17-11:03</td><td className="text-xs">11:03:08</td><td className="text-xs">{pipeline.p95Latency}</td><td className="num">{pipeline.throughput}</td><td><StatusChip status="warning" /></td></tr>
                <tr><td className="id-mono text-xs">run-2026-05-17-10:03</td><td className="text-xs">10:03:02</td><td className="text-xs">{pipeline.p95Latency}</td><td className="num">{pipeline.throughput}</td><td><StatusChip status="healthy" /></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'dlq' && (
        <div>
          {pipeline.dlq === 0 ? (
            <div className="text-sm text-ink-dim p-4 text-center">No rows currently in the dead-letter queue.</div>
          ) : (
            <>
              <div className="text-[11px] text-ink-dim mb-3">
                {pipeline.dlq} row(s) failed contract checks · routed to DLQ with idempotent replay key · steward auto-assigned per dataset.
              </div>
              <table className="table-grid">
                <thead><tr><th>Row</th><th>Field</th><th>Issue</th><th>Rule</th><th>Sev.</th><th></th></tr></thead>
                <tbody>
                  {dlqRows.map((r) => (
                    <tr key={r.row}>
                      <td className="id-mono text-xs">{r.row}</td>
                      <td className="id-mono text-xs">{r.field}</td>
                      <td className="text-xs">{r.issue}</td>
                      <td className="text-xs text-ink-dim">{r.rule}</td>
                      <td><StatusChip status={r.severity} /></td>
                      <td><button className="text-xs text-accent underline" onClick={() => toast(`Row ${r.row} requeued for replay`, 'info')}>Replay</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {tab === 'config' && (
        <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto whitespace-pre">
{`pipeline: ${pipeline.id}
source: ${pipeline.source}
pattern: ${pipeline.pattern.toLowerCase()}
schedule: ${pipeline.schedule}
emit_to: ${pipeline.tier.toLowerCase()}
contract:
  version: 1.3.0
  schema_evolution: backward_compatible
  breaking_change_policy: blocked_at_ci
sla:
  p95_latency: "${pipeline.p95Latency}"
  freshness: "<= 30s"
  availability: "99.97"
idempotency:
  strategy: natural_key
  key: ["msg_id"]
exactly_once: true
late_arrival:
  policy: backfill_partition
  watermark: "24h"
  return_codes: ["R01","R02","R03","R07","R10","R20"]   # ACH-specific where applicable
quality:
  - rule: ofac_screen_pass
    severity: P1
    on_fail: route_to gold.aml.workspace
  - rule: bic_swiftref_valid
    severity: P2
    on_fail: route_to dlq
  - rule: mcr_confidence_ge_0_92
    severity: P2
    on_fail: route_to dlq
dlq:
  triage_ui: enabled
  steward: ${src?.steward ?? 'auto'}
  replay: idempotent
observability:
  openlineage: enabled
  bcbs_239:
    accuracy: tracked
    timeliness: tracked
    completeness: tracked
governance:
  sensitivity: ${src?.sensitivity ?? 'NPI'}
  regulator_tags: ${JSON.stringify(src?.regulatorTags ?? [])}
  retention: ${tierMeta[pipeline.tier].retention.split(' · ')[0]}`}
        </pre>
      )}
    </div>
  );
}
