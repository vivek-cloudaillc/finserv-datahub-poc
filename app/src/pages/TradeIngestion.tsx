import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../AppContext';
import { Card, PageHeader, StatusChip } from '../components/ui';
import {
  canonicalSamples,
  canonicalTransactionSchema,
  connectorCategories,
  fxRatesOfRecord,
  idempotencyDemoTimeline,
  jiraTicket,
  latency24h,
  slaBreaches,
  slaThresholdMin,
} from '../data';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  Gauge,
  Globe2,
  Layers,
  Plug,
  RefreshCw,
  Repeat,
  ShieldCheck,
} from 'lucide-react';

/**
 * Workspace satisfying Jira ticket FNSV-184:
 *   Multi-Asset Trade and Transaction Ingestion into FinServ Datahub.
 *
 * Layout = one anchor per acceptance criterion:
 *   AC1 — Connector coverage (3 categories)
 *   AC2 — Canonical transaction schema
 *   AC3 — FX rate-of-record
 *   AC4 — Idempotency proof
 *   AC5 — Latency SLA monitoring
 */
export function TradeIngestion() {
  const { setScreen, toast } = useApp();

  return (
    <div>
      <PageHeader
        title="Multi-Asset Trade & Transaction Ingestion"
        subtitle="FNSV-184 · One consolidated transaction store for risk, finance, and ops — front, middle, back office in one canonical schema."
        actions={
          <a
            href={jiraTicket.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            onClick={(e) => { e.preventDefault(); toast('Linked to Jira FNSV-184 (demo)', 'info'); }}
          >
            <ExternalLink size={13} /> Open Jira
          </a>
        }
      />

      {/* Jira ticket card */}
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="id-mono text-xs px-2 py-0.5 rounded-chip bg-accent text-white">{jiraTicket.id}</span>
              <StatusChip status={jiraTicket.status} />
              <span className="text-[11px] text-ink-dim">{jiraTicket.sprint}</span>
              <span className="text-[11px] text-ink-dim">· {jiraTicket.storyPoints} pts</span>
              <span className="text-[11px] text-ink-dim">· Epic <span className="id-mono">{jiraTicket.epic}</span></span>
            </div>
            <div className="text-base font-semibold">{jiraTicket.title}</div>
            <div className="text-[11px] text-ink-dim mt-1">
              Assignee · {jiraTicket.assignee} &nbsp;·&nbsp; Reporter · {jiraTicket.reporter}
            </div>
          </div>
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-4">
          <div className="p-3 rounded-input bg-canvas-light dark:bg-canvas-dark border border-line-light dark:border-line-dark">
            <div className="text-[11px] uppercase tracking-widest text-ink-dim mb-2">User Story</div>
            <div className="text-sm leading-relaxed">
              <div><span className="font-semibold">As a</span> {jiraTicket.userStory.asA}</div>
              <div className="mt-1"><span className="font-semibold">I want</span> {jiraTicket.userStory.iWant}</div>
              <div className="mt-1"><span className="font-semibold">So that</span> {jiraTicket.userStory.soThat}</div>
            </div>
          </div>
          <div className="p-3 rounded-input bg-canvas-light dark:bg-canvas-dark border border-line-light dark:border-line-dark">
            <div className="text-[11px] uppercase tracking-widest text-ink-dim mb-2">Acceptance Criteria · status</div>
            <ul className="space-y-1.5">
              {jiraTicket.acceptance.map((ac) => (
                <li key={ac.id} className="flex items-start gap-2 text-xs leading-snug">
                  <CheckCircle2 size={14} className="text-ok mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">{ac.id}</span> · {ac.text}
                    <div className="text-[11px] text-ink-dim mt-0.5">{ac.evidence}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* AC1 · Connector coverage */}
      <Section anchor="AC1" icon={Plug} title="Connector coverage" subtitle="Three source categories live — OMS/EMS · Settlement (DTCC/Fedwire/SWIFT MT-MX) · Custody positions.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {connectorCategories.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-sm font-semibold">{c.name}</div>
                <StatusChip status={c.withinSla ? 'healthy' : 'warning'} />
              </div>
              <div className="text-[11px] text-ink-dim leading-snug mb-3">{c.description}</div>
              <div className="grid grid-cols-2 gap-y-1 text-xs mb-3">
                <div className="text-ink-dim">Records today</div>
                <div className="tabular text-right">{c.recordsToday.toLocaleString()}</div>
                <div className="text-ink-dim">p95 latency</div>
                <div className="tabular text-right">{c.p95Latency}</div>
                <div className="text-ink-dim">SLA target</div>
                <div className="tabular text-right">{c.slaTarget}</div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">Protocols</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {c.protocols.map((p) => <span key={p} className="chip">{p}</span>)}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">Connected sources</div>
              <div className="space-y-1">
                {c.sources.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScreen('sources')}
                    className="w-full text-left p-2 rounded-input border border-line-light dark:border-line-dark hover:border-accent flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{s.name}</div>
                      <div className="text-[10px] text-ink-dim">{s.vendor}</div>
                    </div>
                    <StatusChip status={s.status} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* AC2 · Canonical schema */}
      <Section anchor="AC2" icon={Layers} title="Canonical transaction schema" subtitle="One target shape · silver.transactions · bi-temporal · GLEIF-validated counterparty · FIGI-resolved instrument.">
        <div className="grid lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3 card overflow-hidden">
            <div className="px-4 py-3 border-b border-line-light dark:border-line-dark flex items-center justify-between">
              <div className="font-semibold text-sm">silver.transactions · target schema</div>
              <div className="text-[11px] text-ink-dim">{canonicalTransactionSchema.length} fields · Iceberg · bi-temporal</div>
            </div>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="table-grid">
                <thead>
                  <tr><th>Column</th><th>Type</th><th>Req</th><th>Description</th><th>AC</th></tr>
                </thead>
                <tbody>
                  {canonicalTransactionSchema.map((f) => (
                    <tr key={f.col}>
                      <td className="id-mono text-xs">{f.col}</td>
                      <td className="text-[11px] text-ink-dim">{f.type}</td>
                      <td>{f.required ? <span className="text-ok text-xs">✓</span> : <span className="text-ink-dim text-xs">—</span>}</td>
                      <td className="text-[11px]">{f.desc}</td>
                      <td>{f.acceptance && <span className="chip-accent">{f.acceptance.split(' · ')[0]}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 card overflow-hidden">
            <div className="px-4 py-3 border-b border-line-light dark:border-line-dark flex items-center justify-between">
              <div className="font-semibold text-sm">Sample canonical rows</div>
              <div className="text-[11px] text-ink-dim">All 3 source categories</div>
            </div>
            <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
              {canonicalSamples.slice(0, 4).map((s) => (
                <div key={s.txn_id} className="p-2.5 rounded-input border border-line-light dark:border-line-dark">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="chip">{s.source_system}</span>
                    <StatusChip status={s.lifecycle_state} />
                  </div>
                  <div className="id-mono text-[11px] text-ink-dim truncate">{s.txn_id}</div>
                  <div className="text-xs mt-1.5">
                    <span className="font-semibold">{s.side}</span>{' '}
                    {s.qty.toLocaleString()} × {s.instrument.ticker} @ {s.price.toLocaleString()} {s.ccy}
                  </div>
                  <div className="text-[11px] text-ink-dim flex items-center justify-between mt-1">
                    <span>Notional · <span className="tabular">{s.notional.toLocaleString()} {s.ccy}</span></span>
                    {s.fx_rate && (
                      <span className="text-accent tabular">≡ {s.reporting_notional.toLocaleString()} {s.reporting_ccy}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-ink-dim mt-1">Book {s.book} · CP {s.counterparty.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* AC3 · FX rate-of-record */}
      <Section anchor="AC3" icon={Globe2} title="FX rate-of-record" subtitle="Per-leg policy · explicit source · auditable as-of timestamp · applied at Silver build, never recomputed downstream.">
        <div className="grid lg:grid-cols-5 gap-3">
          <Card title="Rate-of-record table" className="lg:col-span-3" padded={false}>
            <table className="table-grid">
              <thead><tr><th>Pair</th><th className="num">Rate</th><th>Source</th><th>As-of</th><th>Policy</th></tr></thead>
              <tbody>
                {fxRatesOfRecord.map((r) => (
                  <tr key={r.pair}>
                    <td className="font-medium">{r.pair}</td>
                    <td className="num tabular">{r.rate.toFixed(6)}</td>
                    <td className="id-mono text-[11px]">{r.source}</td>
                    <td className="text-[11px] text-ink-dim">{r.asOf}</td>
                    <td className="text-[11px]">{r.policy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Conversion examples (non-USD trades)" className="lg:col-span-2">
            <div className="space-y-2">
              {canonicalSamples.filter((s) => s.fx_rate !== null).map((s) => (
                <div key={s.txn_id} className="p-2.5 rounded-input border border-line-light dark:border-line-dark">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="text-xs font-semibold">{s.instrument.ticker} · {s.source_system}</div>
                    <span className="chip">{s.ccy} → {s.reporting_ccy}</span>
                  </div>
                  <div className="grid grid-cols-2 text-[11px]">
                    <div className="text-ink-dim">Native notional</div>
                    <div className="tabular text-right">{s.notional.toLocaleString()} {s.ccy}</div>
                    <div className="text-ink-dim">FX rate</div>
                    <div className="tabular text-right">{s.fx_rate}</div>
                    <div className="text-ink-dim">Source</div>
                    <div className="id-mono text-right text-[10px]">{s.fx_source}</div>
                    <div className="text-ink-dim font-semibold">Reporting notional</div>
                    <div className="tabular text-right font-semibold text-accent">
                      {s.reporting_notional.toLocaleString(undefined, { maximumFractionDigits: 2 })} {s.reporting_ccy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* AC4 · Idempotency proof */}
      <Section anchor="AC4" icon={Fingerprint} title="Idempotent ingestion" subtitle="Idempotency key = source_system + source_id. Replays MERGE; downstream consumers see no duplicates.">
        <div className="grid lg:grid-cols-5 gap-3">
          <Card title="Idempotency key composition" className="lg:col-span-2">
            <div className="text-sm space-y-2">
              <div className="text-[11px] text-ink-dim">
                Each canonical row holds an immutable natural key built from the source-system code and the source-native primary key. The same key always produces the same <span className="id-mono">txn_id</span> (deterministic UUID v7).
              </div>
              <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto">
{`-- silver.transactions MERGE policy
MERGE INTO silver.transactions tgt
USING staged                src
ON  tgt.idempotency_key = src.idempotency_key   -- source_system|source_id
WHEN MATCHED THEN UPDATE SET
    -- only fields that legitimately change post-trade
    lifecycle_state    = src.lifecycle_state,
    settle_date        = src.settle_date,
    fx_rate            = src.fx_rate,
    reporting_notional = src.reporting_notional,
    valid_time_to      = CASE WHEN tgt.payload_hash <> src.payload_hash
                              THEN current_timestamp ELSE tgt.valid_time_to END
WHEN NOT MATCHED THEN INSERT (...) VALUES (...);`}
              </pre>
              <button
                onClick={() => toast('Replay simulation queued · idempotency key holds · 0 duplicates expected', 'info')}
                className="btn-primary w-full mt-1"
              >
                <Repeat size={13} /> Simulate 4-hour replay
              </button>
            </div>
          </Card>

          <Card title="Live replay timeline (most recent)" className="lg:col-span-3">
            <ol className="space-y-2.5">
              {idempotencyDemoTimeline.map((e) => (
                <li key={e.ts} className="flex items-start gap-3">
                  <span className="id-mono text-[10px] text-ink-dim w-20 flex-shrink-0 mt-0.5">{e.ts}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
                      e.result === 'inserted' ? 'bg-accent' : e.result === 'deduped' ? 'bg-ok' : 'bg-ink-dim'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{e.message}</div>
                    <div className="text-[11px] text-ink-dim id-mono">{e.detail}</div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-chip font-medium flex-shrink-0 ${
                      e.result === 'inserted' ? 'bg-accent/15 text-accent' :
                      e.result === 'deduped' ? 'bg-ok/15 text-ok' :
                      'bg-line-light text-ink-dim dark:bg-white/10'
                    }`}
                  >
                    {e.result}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </Section>

      {/* AC5 · Latency SLA */}
      <Section anchor="AC5" icon={Gauge} title="Latency SLA · intraday p95 < 10 min" subtitle="Live telemetry per connector category · alerts fire on threshold breach · two breaches in last 24h handled by runbook.">
        <div className="grid lg:grid-cols-5 gap-3">
          <Card title="p95 latency · last 24 hours (minutes)" className="lg:col-span-3">
            <LatencyChart />
          </Card>

          <Card title="Recent SLA breaches" className="lg:col-span-2">
            {slaBreaches.length === 0 ? (
              <div className="text-sm text-ink-dim">No breaches in the last 7 days.</div>
            ) : (
              <div className="space-y-2">
                {slaBreaches.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-input border border-line-light dark:border-line-dark">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle size={11} className="text-warn" /> {b.connector}
                      </div>
                      <StatusChip status={b.status === 'resolved' ? 'resolved' : b.status === 'mitigated' ? 'mitigated' : 'open'} />
                    </div>
                    <div className="text-[11px] text-ink-dim">{b.ts}</div>
                    <div className="text-[11px] mt-1">
                      <span className="text-ink-dim">observed </span><span className="tabular font-medium text-warn">{b.p95Observed}</span>
                      <span className="text-ink-dim"> · threshold </span><span className="tabular">{b.threshold}</span>
                    </div>
                    <div className="text-[11px] mt-1.5"><span className="text-ink-dim">Root cause · </span>{b.rootCause}</div>
                    <div className="text-[11px] mt-0.5"><span className="text-ink-dim">Resolution · </span>{b.resolution}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[11px] text-ink-dim mt-3 leading-snug border-t border-line-light dark:border-line-dark pt-2">
              <span className="font-semibold">Alerting · </span>
              Breach &gt; 10 min p95 on any connector raises a P2 page to the data-eng on-call (PagerDuty) and posts to <span className="id-mono">#fnsv-ingest-alerts</span>.
              Persistent breach (≥ 3 windows) escalates to P1 and pages the BSA Officer if the affected category includes BSA-tagged sources.
            </div>
          </Card>
        </div>
      </Section>

      {/* What downstream gets */}
      <Section anchor="OUTCOME" icon={ShieldCheck} title="What this unlocks" subtitle="The deliverable in the user story: one consolidated transaction store, not silos.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <OutcomeCard label="Risk team" detail="Real-time exposure by counterparty (LEI roll-up) · cross-asset by FIGI · stress at +200bps + HPI -10% on one query." onClick={() => setScreen('nl')} />
          <OutcomeCard label="Finance" detail="Daily reporting-currency P&L · FX consistency across legal entities · Call Report RCFD lineage to source rows." onClick={() => setScreen('reporting')} />
          <OutcomeCard label="Ops · settlements" detail="DTCC CTM affirmation breaks · SWIFT MT/MX translator coverage · T+1 cutoff readiness dashboard." onClick={() => setScreen('pipelines')} />
          <OutcomeCard label="Surveillance" detail="MAR-grade canonical Trade 360 · CAT Rule 613 reportable events · MiFID II RTS-22 completeness." onClick={() => setScreen('surveillance')} />
        </div>
      </Section>

      {/* Operator actions */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3 mt-5">
        <div className="text-sm">
          <span className="font-semibold">Ready for QA hand-off.</span>
          <span className="text-ink-dim ml-2">All 5 acceptance criteria have on-screen evidence. Demoable at the sprint review.</span>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-ghost"
            onClick={() => { setScreen('medallion'); toast('Opening canonical Trade 360 flow', 'info'); }}
          >
            <Layers size={13} /> View medallion flow
          </button>
          <button
            className="btn-ghost"
            onClick={() => { setScreen('pipelines'); toast('Opening backing pipelines', 'info'); }}
          >
            <RefreshCw size={13} /> View pipelines
          </button>
          <button
            className="btn-primary"
            onClick={() => toast('FNSV-184 moved to Done · sprint demo scheduled', 'success')}
          >
            <CheckCircle2 size={13} /> Mark Done
          </button>
        </div>
      </div>
    </div>
  );
}

function LatencyChart() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#9AA3BA' : '#5A6479';
  const gridColor = isDark ? '#24305A' : '#E1E5EC';
  const tooltipBg = isDark ? '#142046' : '#FFFFFF';
  const tooltipStyle = {
    background: tooltipBg,
    border: `1px solid ${gridColor}`,
    borderRadius: 8,
    fontSize: 12,
    color: isDark ? '#E8ECF5' : '#0F1A33',
    boxShadow: '0 8px 24px rgba(29,78,216,0.10)',
  };
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={latency24h} margin={{ top: 6, right: 6, bottom: 6, left: -4 }}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 14]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v} min`} />
          <ReferenceLine
            y={slaThresholdMin}
            stroke={isDark ? '#B91C1C' : '#B91C1C'}
            strokeDasharray="4 4"
            label={{ value: `SLA ${slaThresholdMin}m`, fill: '#B91C1C', fontSize: 10, position: 'right' }}
          />
          <Line type="monotone" dataKey="oms" name="OMS/EMS" stroke={isDark ? '#60A5FA' : '#1D4ED8'} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          <Line type="monotone" dataKey="settlement" name="Settlement" stroke={isDark ? '#D6AB4A' : '#B58A2A'} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          <Line type="monotone" dataKey="custody" name="Custody" stroke="#15803D" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-3 text-[11px] text-ink-dim mt-2">
        <span><span className="inline-block w-3 h-0.5 align-middle mr-1" style={{ background: isDark ? '#60A5FA' : '#1D4ED8' }} /> OMS/EMS</span>
        <span><span className="inline-block w-3 h-0.5 align-middle mr-1" style={{ background: isDark ? '#D6AB4A' : '#B58A2A' }} /> Settlement</span>
        <span><span className="inline-block w-3 h-0.5 align-middle mr-1 bg-ok" /> Custody</span>
        <span className="ml-auto"><span className="inline-block w-3 h-0.5 align-middle mr-1" style={{ background: '#B91C1C' }} /> 10-min SLA</span>
      </div>
    </div>
  );
}

function Section({
  anchor,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  anchor: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between mb-3 gap-3">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-chip bg-accent text-white">
            {anchor}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-accent" />
              <div className="text-sm font-semibold">{title}</div>
            </div>
            <div className="text-xs text-ink-dim mt-0.5 max-w-3xl">{subtitle}</div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function OutcomeCard({ label, detail, onClick }: { label: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card p-4 text-left hover:shadow-card transition-shadow">
      <div className="flex items-center gap-1.5 text-accent text-[11px] uppercase tracking-widest font-semibold">
        {label} <ArrowUpRight size={11} />
      </div>
      <div className="text-xs leading-snug mt-2">{detail}</div>
    </button>
  );
}
