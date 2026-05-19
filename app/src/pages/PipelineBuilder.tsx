import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Layers, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { sources, tierMeta } from '../data';
import type { Pipeline, SubSector } from '../types';

/**
 * Three medallion-layer transitions a user can build:
 *   - Source  → Bronze : land raw, tokenize, run syntactic gates
 *   - Bronze  → Silver : rail-aware decoders, MCR resolution, bi-temporal
 *   - Silver  → Gold   : pre-aggregated marts, §1033 + reg-reporting policy
 */
export type LayerTransition = 'source-bronze' | 'bronze-silver' | 'silver-gold';

export interface LayerTransitionMeta {
  id: LayerTransition;
  fromTier: 'Source' | 'Bronze' | 'Silver';
  toTier: 'Bronze' | 'Silver' | 'Gold';
  title: string;
  tierLabel: 'Bronze' | 'Silver' | 'Gold';
  blurb: string;
  defaultRules: string[];
}

export const layerTransitions: LayerTransitionMeta[] = [
  {
    id: 'source-bronze',
    fromTier: 'Source',
    toTier: 'Bronze',
    title: 'Source → Bronze',
    tierLabel: 'Bronze',
    blurb: 'Raw landing · tokenization · syntactic gates',
    defaultRules: [
      'S3 Object Lock Compliance Mode',
      'PAN / SSN / EIN tokenization at edge',
      'Per-tenant KMS CMK envelope encryption',
      'Vendor manifest MD5 + per-row SHA-256 hash',
      'Schema version pinned · breaking change blocked at CI',
    ],
  },
  {
    id: 'bronze-silver',
    fromTier: 'Bronze',
    toTier: 'Silver',
    title: 'Bronze → Silver',
    tierLabel: 'Silver',
    blurb: 'Rail-aware decoders · MCR · bi-temporal',
    defaultRules: [
      'ISO 20022 / ISO 8583 / FIX / ACORD decoder',
      'BIC / LEI / ISIN / CUSIP / MCC checksum',
      'OFAC + sanctions screening',
      'Master Customer Record resolution ≥ 0.92 confidence',
      'Bi-temporal valid-time + system-time stamping',
      'FX rate-of-record applied for reporting currency',
    ],
  },
  {
    id: 'silver-gold',
    fromTier: 'Silver',
    toTier: 'Gold',
    title: 'Silver → Gold',
    tierLabel: 'Gold',
    blurb: 'Pre-aggregated marts · §1033 policy',
    defaultRules: [
      'Consumer-driven contract tests (downstream apps)',
      'dbt Cloud certified · materialized incremental',
      'BCBS 239 timeliness < 60s',
      'Section 1033 consent gating (FDX 6.x)',
      'Row-level security by legal entity',
      'Column lineage to Bronze (OpenLineage)',
    ],
  },
];

const PATTERNS: Pipeline['pattern'][] = ['Batch', 'Micro-Batch', 'Streaming', 'CDC', 'Webhook'];
const SUB_SECTORS: Exclude<SubSector, 'All'>[] = ['Banking', 'Capital Markets', 'Insurance', 'Wealth'];
type SectorOrCross = Exclude<SubSector, 'All'> | 'Cross';

const STEP_LABELS = ['Basics', 'Upstream', 'Transformations', 'Quality', 'SLA', 'Review'] as const;

interface Draft {
  name: string;
  pattern: Pipeline['pattern'];
  subSector: SectorOrCross;
  schedule: string;
  source: string;          // src_… or '' if not S→B
  upstreamDataset: string; // bronze.* / silver.* for non-S→B
  transformations: string[];
  rules: string[];
  slaP95: string;
  idempotency: string;
}

const TRANSFORM_LIBRARY: Record<LayerTransition, { id: string; label: string }[]> = {
  'source-bronze': [
    { id: 'parse_envelope',       label: 'Wrap payload + JSON envelope (msg_id, schema_version, ingest_ts)' },
    { id: 'partition_by_hour',    label: 'Partition by source/ingestion_date/hour' },
    { id: 'tokenize_pii',         label: 'Tokenize PAN / SSN / EIN / NPI at ingress' },
    { id: 'object_lock',          label: 'Object Lock Compliance Mode (regulator retention)' },
    { id: 'schema_pin',           label: 'Pin to schema version · reject on breaking change' },
    { id: 'integrity_chain',      label: 'Per-row SHA-256 chain (tamper-evidence)' },
  ],
  'bronze-silver': [
    { id: 'iso20022_decode',      label: 'Decode ISO 20022 XML → canonical payment' },
    { id: 'iso8583_decode',       label: 'Decode ISO 8583 binary → canonical card auth' },
    { id: 'fix_decode',           label: 'Decode FIX 4.4 / 5.0 → canonical trade event' },
    { id: 'acord_decode',         label: 'Decode ACORD XML → canonical policy / claim' },
    { id: 'mcr_resolve',          label: 'Resolve to Master Customer Record (deterministic + Splink)' },
    { id: 'lei_resolve',          label: 'Resolve counterparty BIC → GLEIF LEI' },
    { id: 'figi_resolve',         label: 'Resolve instrument → OpenFIGI / CUSIP / ISIN' },
    { id: 'fx_normalize',         label: 'FX rate-of-record · reporting-currency notional' },
    { id: 'bitemporal',           label: 'Bi-temporal stamping · valid_time + system_time' },
    { id: 'ofac_screen',          label: 'OFAC + UN + EU + UK HMT screening' },
  ],
  'silver-gold': [
    { id: 'household_rollup',     label: 'Household / counterparty roll-up' },
    { id: 'aggregate_daily',      label: 'Daily aggregation (txn count, notional, FX)' },
    { id: 'profitability',        label: 'FTP / RAROC / customer LTV computation' },
    { id: 'regulatory',           label: 'Regulator mart (Call Report, HMDA, MiFID, CAT, NAIC)' },
    { id: 'risk_marts',           label: 'Risk mart (AML, fraud, credit, market, liquidity)' },
    { id: 'cohort_assign',        label: 'IFRS-17 / LDTI cohort assignment' },
    { id: 'attribution',          label: 'Performance attribution vs. benchmark' },
    { id: 'consent_gate',         label: 'Section 1033 consent gate (FDX 6.x)' },
  ],
};

const UPSTREAM_DATASETS: Record<LayerTransition, string[]> = {
  'source-bronze': [],
  'bronze-silver': [
    'bronze.payments.fednow_raw',
    'bronze.payments.fedwire_raw',
    'bronze.payments.ach_raw',
    'bronze.cards.marqeta_auth',
    'bronze.oms.charles_river_fix',
    'bronze.posttrade.dtcc_ctm',
    'bronze.custody.bny',
    'bronze.insurance.guidewire_policy',
    'bronze.insurance.guidewire_claim',
    'bronze.aggregation.plaid',
    'bronze.kyc.persona',
  ],
  'silver-gold': [
    'silver.payments.unified',
    'silver.trades.equities',
    'silver.trades.fixed_income',
    'silver.wealth.positions',
    'silver.insurance.policies',
    'silver.insurance.claims',
    'silver.customers.mcr',
    'silver.entities.counterparty',
    'silver.aml.ofac_screen',
  ],
};

export function PipelineBuilder({
  open,
  transition,
  onClose,
}: {
  open: boolean;
  transition: LayerTransitionMeta | null;
  onClose: () => void;
}) {
  const { toast, addUserPipeline } = useApp();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    name: '',
    pattern: 'Streaming',
    subSector: 'Capital Markets',
    schedule: '24×7',
    source: '',
    upstreamDataset: '',
    transformations: [],
    rules: [],
    slaP95: '< 5 min',
  idempotency: 'natural key (source_system + source_id)',
  });

  // Reset whenever transition changes / drawer reopens
  useEffect(() => {
    if (open && transition) {
      setStep(0);
      setDraft({
        name: '',
        pattern: 'Streaming',
        subSector: 'Capital Markets',
        schedule: '24×7',
        source: '',
        upstreamDataset: UPSTREAM_DATASETS[transition.id][0] ?? '',
        transformations: TRANSFORM_LIBRARY[transition.id].slice(0, 4).map((t) => t.id),
        rules: transition.defaultRules,
        slaP95: transition.id === 'source-bronze' ? '< 2 s' : transition.id === 'bronze-silver' ? '< 5 min' : '< 12 min',
        idempotency: 'natural key (source_system + source_id)',
      });
    }
  }, [open, transition]);

  if (!open || !transition) return null;

  const canNext = () => {
    if (step === 0) return draft.name.trim().length > 2;
    if (step === 1) return transition.id === 'source-bronze' ? !!draft.source : !!draft.upstreamDataset;
    return true;
  };

  const toggleTransform = (id: string) => {
    setDraft((d) =>
      d.transformations.includes(id)
        ? { ...d, transformations: d.transformations.filter((x) => x !== id) }
        : { ...d, transformations: [...d.transformations, id] },
    );
  };

  const handleSave = () => {
    const id = `pl_user_${Date.now().toString(36)}`;
    const sourceId = transition.id === 'source-bronze'
      ? draft.source
      : (sources.find((s) => s.subSector === draft.subSector || s.subSector === 'Cross')?.id ?? sources[0].id);
    const newPipe: Pipeline = {
      id,
      name: draft.name,
      source: sourceId,
      pattern: draft.pattern,
      schedule: draft.schedule,
      status: 'running',
      successRate: 99.0,
      p95Latency: draft.slaP95,
      throughput: '— (warming up)',
      dlq: 0,
      lastRun: 'just now',
      tier: transition.toTier as Pipeline['tier'],
      subSector: draft.subSector,
    };
    addUserPipeline(newPipe);
    toast(`Pipeline "${draft.name}" deployed · status: running`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 animate-fadein" onClick={onClose}>
      <div
        className="absolute top-0 right-0 h-full w-[760px] max-w-full bg-card-light dark:bg-card-dark shadow-pop border-l border-line-light dark:border-line-dark flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-line-light dark:border-line-dark flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-7 h-7 rounded-input flex items-center justify-center ${tierMeta[transition.toTier].bg}`}>
              <Layers size={14} className={tierMeta[transition.toTier].color} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">New pipeline · {transition.title}</div>
              <div className="text-[11px] text-ink-dim truncate">{transition.blurb}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-dim hover:text-ink-light dark:hover:text-ink-dark p-1">
            <X size={16} />
          </button>
        </div>

        {/* Stepper · compact pills */}
        <div className="px-4 py-3 border-b border-line-light dark:border-line-dark flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-ink-dim">Step {step + 1} of {STEP_LABELS.length} · {STEP_LABELS[step]}</div>
            <div className="text-[10px] text-ink-dim">{Math.round(((step + 1) / STEP_LABELS.length) * 100)}%</div>
          </div>
          <div className="h-1 rounded-full bg-line-light dark:bg-line-dark overflow-hidden">
            <div className="h-full bg-accent transition-all duration-200 ease-out-soft" style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {STEP_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-chip text-[10px] border transition-colors ${
                  i === step
                    ? 'bg-accent text-white border-accent font-medium'
                    : i < step
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-line-light dark:border-line-dark text-ink-dim opacity-70'
                }`}
              >
                <span className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-semibold">
                  {i < step ? <Check size={8} /> : i + 1}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 text-sm">
          {/* STEP 0 · Basics */}
          {step === 0 && (
            <div className="space-y-3">
              <Field label="Pipeline name *" hint="A short, human-readable identifier. The Hub will generate a slug id automatically.">
                <input
                  className="input"
                  placeholder="e.g. RTP pacs.008 → Silver canonical payments"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  autoFocus
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pattern">
                  <Select value={draft.pattern} onChange={(v) => setDraft({ ...draft, pattern: v as Pipeline['pattern'] })} options={PATTERNS} />
                </Field>
                <Field label="Sub-sector">
                  <Select
                    value={draft.subSector}
                    onChange={(v) => setDraft({ ...draft, subSector: v as SectorOrCross })}
                    options={[...SUB_SECTORS, 'Cross'] as SectorOrCross[]}
                  />
                </Field>
              </div>
              <Field label="Schedule" hint="Cron, ISO interval, or '24×7' for streaming">
                <input
                  className="input"
                  value={draft.schedule}
                  onChange={(e) => setDraft({ ...draft, schedule: e.target.value })}
                  placeholder="24×7 · 0 2 * * * · every 5m"
                />
              </Field>
            </div>
          )}

          {/* STEP 1 · Upstream */}
          {step === 1 && (
            <div className="space-y-3">
              {transition.id === 'source-bronze' ? (
                <>
                  <div className="text-xs text-ink-dim mb-1">Pick the source system this pipeline lands into Bronze.</div>
                  <div className="space-y-1 max-h-[420px] overflow-y-auto">
                    {sources.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setDraft({ ...draft, source: s.id })}
                        className={`w-full text-left p-2.5 rounded-input border transition-colors ${
                          draft.source === s.id
                            ? 'border-accent bg-accent-soft'
                            : 'border-line-light dark:border-line-dark hover:border-accent'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{s.name}</div>
                            <div className="text-[11px] text-ink-dim truncate">{s.vendor} · {s.protocol}</div>
                          </div>
                          <span className="chip text-[10px]">{s.subSector}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-ink-dim mb-1">Pick the upstream dataset this pipeline reads from.</div>
                  <div className="space-y-1 max-h-[420px] overflow-y-auto">
                    {UPSTREAM_DATASETS[transition.id].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDraft({ ...draft, upstreamDataset: d })}
                        className={`w-full text-left p-2.5 rounded-input border transition-colors ${
                          draft.upstreamDataset === d
                            ? 'border-accent bg-accent-soft'
                            : 'border-line-light dark:border-line-dark hover:border-accent'
                        }`}
                      >
                        <div className="id-mono text-xs">{d}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2 · Transformations */}
          {step === 2 && (
            <div className="space-y-2">
              <div className="text-xs text-ink-dim mb-1">
                Pick the transformations to chain. Order is preserved at run time. Default selections match the standard {transition.tierLabel} build.
              </div>
              {TRANSFORM_LIBRARY[transition.id].map((t) => {
                const on = draft.transformations.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTransform(t.id)}
                    className={`w-full text-left p-2.5 rounded-input border flex items-start gap-2 transition-colors ${
                      on
                        ? 'border-accent bg-accent-soft'
                        : 'border-line-light dark:border-line-dark hover:border-accent'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 ${
                        on ? 'bg-accent text-white' : 'border border-line-light dark:border-line-dark'
                      }`}
                    >
                      {on && <Check size={11} />}
                    </span>
                    <div>
                      <div className="text-sm">{t.label}</div>
                      <div className="text-[10px] text-ink-dim id-mono mt-0.5">{t.id}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 3 · Quality */}
          {step === 3 && (
            <div className="space-y-2">
              <div className="text-xs text-ink-dim mb-1">
                Contract rules enforced at this stage. Failures route to DLQ + auto-assign the dataset steward.
              </div>
              {draft.rules.map((r, i) => (
                <div
                  key={`${r}-${i}`}
                  className="flex items-center gap-2 p-2 rounded-input border border-line-light dark:border-line-dark"
                >
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  <span className="text-sm flex-1">{r}</span>
                  <button
                    onClick={() => setDraft({ ...draft, rules: draft.rules.filter((_, idx) => idx !== i) })}
                    className="text-ink-dim hover:text-danger text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <AddRule onAdd={(text) => setDraft({ ...draft, rules: [...draft.rules, text] })} />
            </div>
          )}

          {/* STEP 4 · SLA */}
          {step === 4 && (
            <div className="space-y-3">
              <Field label="P95 latency target" hint="What you commit to downstream consumers. Surfaced on Pipelines + Observability.">
                <input
                  className="input"
                  value={draft.slaP95}
                  onChange={(e) => setDraft({ ...draft, slaP95: e.target.value })}
                />
              </Field>
              <Field label="Idempotency strategy" hint="Replays + session failover must not duplicate rows.">
                <Select
                  value={draft.idempotency}
                  onChange={(v) => setDraft({ ...draft, idempotency: v })}
                  options={[
                    'natural key (source_system + source_id)',
                    'FIX (SenderCompID + TargetCompID + MsgSeqNum)',
                    'ISO 20022 GrpHdr/MsgId',
                    'pan_token + transaction_id (Marqeta)',
                    'payload_hash dedupe (fallback)',
                  ]}
                />
              </Field>
              <div className="p-3 rounded-input bg-canvas-light dark:bg-canvas-dark border border-line-light dark:border-line-dark text-xs">
                <div className="font-medium mb-1">Alerting policy</div>
                <ul className="text-ink-dim space-y-0.5">
                  <li>· Breach &gt; SLA on any window → P2 PagerDuty page</li>
                  <li>· Persistent breach (≥ 3 windows) → P1 escalation</li>
                  <li>· BSA-tagged sources also page the BSA Officer</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 5 · Review */}
          {step === 5 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Name">{draft.name}</Stat>
                <Stat label="Layer">{transition.title}</Stat>
                <Stat label="Pattern">{draft.pattern}</Stat>
                <Stat label="Sub-sector">{draft.subSector}</Stat>
                <Stat label="Schedule">{draft.schedule}</Stat>
                <Stat label="P95 SLA">{draft.slaP95}</Stat>
                <Stat label={transition.id === 'source-bronze' ? 'Source' : 'Upstream'}>
                  {transition.id === 'source-bronze'
                    ? sources.find((s) => s.id === draft.source)?.name ?? '—'
                    : draft.upstreamDataset}
                </Stat>
                <Stat label="Idempotency">{draft.idempotency}</Stat>
              </div>
              <div>
                <div className="text-[11px] text-ink-dim mb-1">Transformations ({draft.transformations.length})</div>
                <div className="flex flex-wrap gap-1">
                  {draft.transformations.map((t) => <span key={t} className="chip">{t}</span>)}
                  {draft.transformations.length === 0 && <span className="text-[11px] text-ink-dim">No transformations selected.</span>}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-ink-dim mb-1">Quality rules ({draft.rules.length})</div>
                <ul className="text-xs space-y-1">
                  {draft.rules.map((r, i) => <li key={i}>· {r}</li>)}
                </ul>
              </div>

              <div className="text-[11px] text-ink-dim border-t border-line-light dark:border-line-dark pt-2">
                On save, this pipeline is registered in the catalog with a generated id and starts in <span className="font-medium text-ink-light dark:text-ink-dark">running</span> state.
                It will appear in the pipelines list and the medallion swimlane immediately.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-line-light dark:border-line-dark p-3 flex items-center justify-between flex-shrink-0">
          <button className="btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={13} /> Back
          </button>
          {step < STEP_LABELS.length - 1 ? (
            <button
              className="btn-primary disabled:opacity-50"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
            >
              Next <ArrowRight size={13} />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>
              <Check size={13} /> Deploy pipeline
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium mb-1">{label}</div>
      {children}
      {hint && <div className="text-[10px] text-ink-dim mt-1">{hint}</div>}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-dim">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function AddRule({ onAdd }: { onAdd: (text: string) => void }) {
  const [v, setV] = useState('');
  return (
    <div className="flex gap-2 pt-1">
      <input
        className="input flex-1"
        placeholder="Add a custom contract rule…"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && v.trim()) {
            onAdd(v.trim());
            setV('');
          }
        }}
      />
      <button
        className="btn-ghost"
        onClick={() => {
          if (v.trim()) {
            onAdd(v.trim());
            setV('');
          }
        }}
      >
        Add
      </button>
    </div>
  );
}
