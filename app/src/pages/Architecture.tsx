import { useApp } from '../AppContext';
import { Card, PageHeader, StatusChip } from '../components/ui';
import { medallionFlows, tierMeta } from '../data';
import { ArrowRight, Cloud, Database, Eye, Lock, Workflow, Zap } from 'lucide-react';

/**
 * Reference architecture story page. Read top-to-bottom:
 *   1.  Source landscape  (what we ingest, by sub-sector + pattern)
 *   2.  Ingest layer       (batch / micro-batch / streaming / CDC / webhook)
 *   3.  Bronze landing     (S3 Object Lock, faithful preservation)
 *   4.  Silver conformance (parse → validate → resolve → enrich)
 *   5.  Gold curation      (dbt-built marts, business outcomes)
 *   6.  Platinum serving   (sub-100ms decisioning features)
 *   7.  Cross-cutting      (governance, observability, model risk, DORA)
 *
 * This is the "explain the platform to an examiner / CDO / engineering lead"
 * page. It's a static reference; the live flow detail lives in Medallion.
 */
export function Architecture() {
  const { setScreen } = useApp();

  return (
    <div>
      <PageHeader
        title="Ingestion Architecture"
        subtitle="End-to-end reference: how data moves from source systems to regulator-defensible Gold and sub-100ms Platinum serving."
      />

      {/* Headline metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="card p-4"><div className="text-[11px] text-ink-dim">Source connectors</div><div className="kpi-num">30</div><div className="text-[11px] text-ink-dim">SDK-templated, semver-versioned</div></div>
        <div className="card p-4"><div className="text-[11px] text-ink-dim">Ingest patterns</div><div className="kpi-num">5</div><div className="text-[11px] text-ink-dim">Batch · μ-Batch · Streaming · CDC · Webhook</div></div>
        <div className="card p-4"><div className="text-[11px] text-ink-dim">Lakehouse format</div><div className="kpi-num">Iceberg</div><div className="text-[11px] text-ink-dim">Delta / Hudi via abstraction</div></div>
        <div className="card p-4"><div className="text-[11px] text-ink-dim">End-to-end SLA</div><div className="kpi-num">&lt; 30s</div><div className="text-[11px] text-ink-dim">streaming · &lt; 4h batch · sub-100ms hot path</div></div>
      </div>

      {/* The horizontal reference architecture diagram (5 layers) */}
      <Card title="Reference architecture — top to bottom" subtitle="Click any layer to drill in" className="mb-5">
        <div className="grid grid-cols-1 gap-3">
          <ArchLayer
            color="bg-slate-50 dark:bg-white/5"
            badge="Source"
            badgeCls="text-slate-600 dark:text-slate-400"
            title="Source landscape — FinServ sub-sectors"
            blurb="30+ FinServ sources across banking, capital markets, insurance, wealth, and cross-cutting CRM/ERP. Onboarded via the Connector SDK with semver data contracts and breaking-change CI gates."
            onClick={() => setScreen('sources')}
            items={[
              'Core banking · Fiserv DNA · Jack Henry SilverLake · FIS · Finastra · Temenos',
              'Cards · Marqeta · Stripe Issuing · Fiserv (FDR) · Galileo',
              'Payment rails · ACH (Nacha) · Fedwire · CHIPS · FedNow · RTP · SWIFT gpi · ISO 8583',
              'KYC / IDV · Persona · Alloy · Socure · Jumio · Onfido · Trulioo',
              'Sanctions / TM · OFAC · Dow Jones WC · ComplyAdvantage · Verafin · NICE Actimize',
              'OMS / EMS · Charles River · Bloomberg AIM / EMSX · Eze · FlexTrade · FIX 4.2/4.4/5.0',
              'Market data · Bloomberg B-PIPE · Refinitiv RDP · ICE · CME MDP · NYSE TAQ · Nasdaq TotalView',
              'Custody / fund admin · BNY · State Street · Northern Trust · Pershing · Geneva · Eagle',
              'Wealth · Envestnet · Orion · Addepar · Black Diamond · eMoney',
              'Policy / claims · Guidewire (PC/CC/BC) · Duck Creek · Majesco · Insurity · Sapiens',
              'Underwriting · Verisk LightSpeed · RMS · AIR · Cape Analytics · Earnix',
              'CRM / ERP · Salesforce FSC · D365 · Workday · NetSuite · SAP S/4HANA',
              'Aggregation / 1033 · Plaid · MX · Finicity · Akoya · FDX 6.x',
              'Bureaus · Experian · Equifax · TransUnion · D&B · LexisNexis Risk',
              'eComms (recordkeeping) · Smarsh · Global Relay · Theta Lake · Symphony Compliance',
            ]}
          />

          <ArrowDown />

          <ArchLayer
            color="bg-accent/10 dark:bg-accent-dark/15"
            badge="Ingest"
            badgeCls="text-accent dark:text-accent-dark"
            title="Ingest layer — five patterns, idempotent, exactly-once"
            blurb="Pattern picked per source. Idempotency at ingress · DLQ + replay framework · backpressure + per-source quotas · mainframe support via Precisely Connect / IBM CDC."
            onClick={() => setScreen('pipelines')}
            items={[
              'Batch · SFTP file drops, S3/ADLS/GCS, JDBC pulls — cores, custodians, processors, mainframes (VSAM/IMS/DB2)',
              'Micro-batch · AWS Kinesis · Amazon MSK · Confluent Cloud · Pub/Sub · Event Hubs',
              'Streaming · ISO 20022 RTP/FedNow · ISO 8583 card auth · FIX engines · market-data ticker plants',
              'Webhook / API · Plaid · Persona · Marqeta · Stripe · Guidewire Cloud · Bloomberg DAPI · Refinitiv RDP',
              'CDC · Debezium · Oracle GoldenGate · AWS DMS · Striim · Qlik Replicate · IBM InfoSphere CDC',
              'Idempotency strategies · per-event natural key · (SenderComp, TargetComp, MsgSeqNum) for FIX · token_transaction_id for cards',
              'Backpressure · per-source quotas · DLQ with triage UI · idempotent replay window 5–30 days',
              'Late-arriving data · ACH returns R01-R85 · trade breaks · policy endorsements · corporate-action restatements',
            ]}
          />

          <ArrowDown />

          <ArchLayer
            color="bg-amber-50 dark:bg-amber-500/10"
            badge="Bronze"
            badgeCls="text-amber-700 dark:text-amber-400"
            title="Bronze — faithful, immutable landing"
            blurb={tierMeta.Bronze.description}
            onClick={() => setScreen('medallion')}
            items={[
              'Apache Iceberg on S3 (or ADLS / GCS) — partitioned by source/ingestion_date/hour',
              'S3 Object Lock Compliance Mode — non-modifiable retention for regulator evidence',
              'Retention · 7y BSA / SEC 17a-4 default · 10y Life-Annuity · indefinite ledger and trade blotter',
              'Per-tenant KMS CMK · envelope encryption · BYOK / HYOK options',
              'Raw payloads preserved · ISO 20022 XML · ISO 8583 binary · ACORD XML · FIX log · FHIR bundles · positional/EBCDIC',
              'Tamper-evident · per-row SHA-256 hash chain · vendor manifest MD5 cross-check',
            ]}
          />

          <ArrowDown />

          <ArchLayer
            color="bg-accent-soft dark:bg-accent-dark/15"
            badge="Silver"
            badgeCls="text-accent dark:text-accent-dark"
            title="Silver — parse · validate · resolve · enrich · conform"
            blurb={tierMeta.Silver.description}
            onClick={() => setScreen('medallion')}
            items={[
              'Parse — ISO 20022 → IFCM payment · ISO 8583 → IFCM card · FIX → IFCM trade · ACORD → IFCM policy/claim · FpML/ISDA CDM',
              'Validate — schema · range · referential · cross-field · temporal · code-list (BIC, ISIN, CUSIP, LEI checksums)',
              'Dedupe — natural key + content hash · DLQ with steward assignment + SLA timer',
              'Resolve — Master Customer Record (deterministic + probabilistic Splink) · counterparty graph via GLEIF LEI',
              'Enrich — FX intraday + EOD · BVAL/ICE pricing · merchant MDM (MCC/NAICS) · counterparty MDM',
              'Conform — bi-temporal valid-time + system-time · canonical IFCM tables (transactions, trades, positions, policies, claims)',
              'Reconcile — internal vs. core · internal vs. custodian · ceded vs. reinsurer bordereau · debits = credits at TB close',
              'Common Data Models · FIBO · ISO 20022 Biz Components · FDC3 · ACORD · HL7 FHIR R4/R5 · ISDA CDM · FDX 6.x',
            ]}
          />

          <ArrowDown />

          <ArchLayer
            color="bg-emerald-50 dark:bg-emerald-500/10"
            badge="Gold"
            badgeCls="text-emerald-700 dark:text-emerald-400"
            title="Gold — certified business marts"
            blurb={tierMeta.Gold.description}
            onClick={() => setScreen('medallion')}
            items={[
              'Customer 360 · Household 360 · Counterparty 360',
              'Transaction 360 (cross-rail) · Trade 360 (cross-asset) · Position & NAV',
              'Policy 360 · Claim 360 · Loss-Ratio cockpit · Reinsurance cession view',
              'Risk marts · AML · Fraud · Credit · Market · Liquidity · Operational · Model · Conduct',
              'Profitability marts · FTP · RAROC · CLV · agent / advisor commission',
              'Regulatory marts · Call Report · FR Y-14 · HMDA LAR · §1071 · MiFID RTS-22 · EMIR · CAT · NAIC Schedule D/F/P · IFRS-17 cohorts · LDTI',
              'Actuarial marts · earned/written premium · IBNR triangles · exposure-by-peril · ceded',
              'Capital marts · RWA · CET1 · leverage · LCR · NSFR · IRRBB',
              'Built with dbt Cloud / SQLMesh · contract-backed · consumer-driven tests · SLAs published',
            ]}
          />

          <ArrowDown />

          <ArchLayer
            color="bg-violet-50 dark:bg-violet-500/10"
            badge="Platinum"
            badgeCls="text-violet-700 dark:text-violet-400"
            title="Platinum — sub-100ms online decisioning"
            blurb={tierMeta.Platinum.description}
            onClick={() => setScreen('medallion')}
            items={[
              'Card fraud authorization · model decision in < 46ms p95 · ONNX runtime on Lambda warm pool',
              'AML real-time pre-screening · stream features on FedNow / RTP / Wire flows',
              'Pre-trade risk · Rule 15c3-5 controls · < 5ms hot path · in-memory rules engine',
              'Underwriting decisioning · Earnix-aware pricing · Verisk + RMS enrichment cache',
              'NBA · next-best-action for advisors, RMs, agents · Reg-BI / Reg-FD compliant',
              'Feature stores · Tecton on DynamoDB · Feast · Aerospike — TTL-aware sync from Gold',
            ]}
          />
        </div>
      </Card>

      {/* Cross-cutting concerns */}
      <Card title="Cross-cutting layers" subtitle="Wrapped around every tier — examiner-grade, audit-grade, sponsor-bank-grade.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <CrossCutCard
            icon={Eye}
            title="Observability"
            items={[
              'OpenLineage + Marquez column-level lineage',
              'BCBS 239 accuracy / integrity / completeness / timeliness / adaptability gauges',
              'Data downtime metric (MTTD / MTTR) tracked monthly',
              'DORA ICT incident workflow (4hr / 72hr / 1mo)',
            ]}
          />
          <CrossCutCard
            icon={Lock}
            title="Governance"
            items={[
              'Catalog · Glue + DataHub + Collibra / Alation / Atlan / IDMC',
              'RBAC + ABAC + PBAC · row + column · information barriers for MNPI',
              'Consent · Section 1033 (FDX 6.x) · HIPAA · GDPR · CCPA/CPRA',
              'SR 11-7 model risk · per-model card · drift + fairness panels',
            ]}
          />
          <CrossCutCard
            icon={Workflow}
            title="Reliability"
            items={[
              'Idempotent writes · exactly-once semantics for ledger / payment / trade-confirm / policy bind',
              'Replay + backfill framework · per-partition watermarks',
              'Dead-letter queue with triage UI · one-click reprocess',
              'Multi-region active-active for payments + trading · 99.99% SLO on hot path',
            ]}
          />
          <CrossCutCard
            icon={Cloud}
            title="Cloud & multi-tenancy"
            items={[
              'AWS primary · Azure + GCP parity via abstraction layer',
              'Account-per-tenant for money-center customers · pooled-with-isolation for fintech',
              'AWS Control Tower · 14-account org · SCPs enforce residency + encryption',
              'Dedicated PCI · MNPI · PHI accounts for scoped workloads',
            ]}
          />
        </div>
      </Card>

      {/* Canonical flows the architecture realizes */}
      <Card title="Canonical FinServ flows realized by this architecture" subtitle="Each flow is a concrete, demoable journey through every tier" padded={false} className="mt-4">
        <table className="table-grid">
          <thead><tr><th>Flow</th><th>Sub-sector</th><th>Volume</th><th>End-to-end SLA</th><th>Regulator coverage</th><th></th></tr></thead>
          <tbody>
            {medallionFlows.map((f) => (
              <tr key={f.id} className="cursor-pointer" onClick={() => setScreen('medallion')}>
                <td>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-[11px] text-ink-dim">{f.stages.length} stages</div>
                </td>
                <td><span className="chip">{f.subSector}</span></td>
                <td className="text-xs">{f.volume}</td>
                <td className="text-xs">{f.endToEndSla}</td>
                <td className="text-xs">
                  {f.regulatorTags.slice(0, 3).map((t) => <span key={t} className="chip mr-1">{t}</span>)}
                  {f.regulatorTags.length > 3 && <span className="chip">+{f.regulatorTags.length - 3}</span>}
                </td>
                <td className="text-xs text-accent">Open flow →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* SLO summary */}
      <Card title="Service-level objectives by surface" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <SloCard label="Card fraud auth" target="P95 < 46ms" actual="42ms" tone="ok" />
          <SloCard label="Pre-trade risk (Rule 15c3-5)" target="P95 < 5ms" actual="3.8ms" tone="ok" />
          <SloCard label="ISO 20022 streaming → Silver" target="P95 < 30s" actual="22s" tone="ok" />
          <SloCard label="EOD core batch → Silver" target="< 60 min" actual="48 min" tone="ok" />
          <SloCard label="Call Report assembly (EOD)" target="< 4h" actual="2h 42m" tone="ok" />
          <SloCard label="NAV cube refresh (EOD)" target="< 90 min" actual="64 min" tone="ok" />
          <SloCard label="Reserving cube (EOD)" target="< 2h" actual="1h 28m" tone="ok" />
          <SloCard label="Dashboard p95" target="< 2s" actual="1.4s" tone="ok" />
          <SloCard label="NL query p95" target="< 6s" actual="4.2s" tone="ok" />
        </div>
      </Card>
    </div>
  );
}

function ArchLayer({
  color,
  badge,
  badgeCls,
  title,
  blurb,
  items,
  onClick,
}: {
  color: string;
  badge: string;
  badgeCls: string;
  title: string;
  blurb: string;
  items: string[];
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-input border border-line-light dark:border-line-dark p-4 ${color} hover:shadow-card transition-shadow w-full`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${badgeCls}`}>{badge}</span>
        <span className="text-base font-semibold">{title}</span>
      </div>
      <div className="text-xs text-ink-dim mb-3 max-w-3xl leading-relaxed">{blurb}</div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0 opacity-40" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function ArrowDown() {
  return (
    <div className="flex justify-center" aria-hidden>
      <ArrowRight size={16} className="text-ink-dim rotate-90" />
    </div>
  );
}

function CrossCutCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="p-3 rounded-input border border-line-light dark:border-line-dark">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-accent" />
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <ul className="text-[11px] space-y-1 text-ink-light dark:text-ink-dark">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SloCard({ label, target, actual, tone }: { label: string; target: string; actual: string; tone: 'ok' | 'warn' | 'danger' }) {
  return (
    <div className="p-3 rounded-input border border-line-light dark:border-line-dark">
      <div className="text-[11px] text-ink-dim mb-1">{label}</div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs"><span className="text-ink-dim">target</span> {target}</span>
        <StatusChip status={tone === 'ok' ? 'healthy' : tone === 'warn' ? 'warning' : 'failed'} />
      </div>
      <div className="text-base font-semibold tabular mt-1">{actual}</div>
    </div>
  );
}

// Re-export typed icons (Zap unused warning suppression)
void Zap;
void Database;
