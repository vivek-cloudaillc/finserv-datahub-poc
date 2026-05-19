/**
 * FNSV-184 · Multi-Asset Trade and Transaction Ingestion into FinServ Datahub
 *
 * Fixtures that back the Multi-Asset Ingestion workspace.
 * Each block maps to an acceptance criterion on the ticket:
 *   - connectorCategories             → AC1 (≥3 source categories)
 *   - canonicalTransactionSchema      → AC2 (canonical txn schema)
 *   - fxRateOfRecord, fxAppliedSamples → AC3 (FX rate-of-record)
 *   - idempotencyDemo                 → AC4 (replay does not duplicate)
 *   - latencyTelemetry, slaBreaches   → AC5 (p95 < 10 min intraday, alerts)
 */

export interface ConnectorCategory {
  id: string;
  name: string;
  description: string;
  protocols: string[];
  sources: { id: string; name: string; vendor: string; status: 'healthy' | 'warning' | 'failed' }[];
  /** Today's record count flowing through this category */
  recordsToday: number;
  /** P95 latency this category is delivering today */
  p95Latency: string;
  /** SLA target (intraday) */
  slaTarget: string;
  /** Are we currently within SLA? */
  withinSla: boolean;
}

export const connectorCategories: ConnectorCategory[] = [
  {
    id: 'cat_oms_ems',
    name: 'OMS / EMS Trade Feeds',
    description:
      'Order management and execution management feeds — front-office orders, child orders, and execution reports streamed over FIX 4.4 / 5.0 SP2 with redundant per-region sessions and automatic sequence-gap recovery.',
    protocols: ['FIX 4.2 / 4.4 / 5.0 SP2', 'FIXatdl', 'FAST', 'REST (post-trade)'],
    sources: [
      { id: 'src_charles_river', name: 'Charles River IMS', vendor: 'State Street', status: 'healthy' },
      { id: 'src_bbg_emsx', name: 'Bloomberg EMSX', vendor: 'Bloomberg', status: 'healthy' },
      { id: 'src_flextrade', name: 'FlexTrade FlexNOW', vendor: 'FlexTrade', status: 'healthy' },
    ],
    recordsToday: 612_804,
    p95Latency: '4.8 min',
    slaTarget: '< 10 min',
    withinSla: true,
  },
  {
    id: 'cat_settlement',
    name: 'Settlement (DTCC / Fedwire / SWIFT MT/MX)',
    description:
      'Post-trade settlement and confirmation feeds — DTCC CTM matched trades, NSCC/DTC/FICC settlement instructions, Fedwire ISO 20022 funds movement, and SWIFT MT 540-548 / sese.023-024 securities messaging with the legacy MT → MX uplift handled.',
    protocols: ['ISO 15022 (MT 540-548)', 'ISO 20022 (sese.023-024, pacs.009)', 'CTM / ALERT / ITP', 'NSCC / DTC / FICC files'],
    sources: [
      { id: 'src_dtcc_ctm', name: 'DTCC CTM (Matching)', vendor: 'DTCC', status: 'healthy' },
      { id: 'src_dtcc_settle', name: 'DTCC NSCC / DTC Settlement', vendor: 'DTCC', status: 'healthy' },
      { id: 'src_fedwire', name: 'Fedwire ISO 20022', vendor: 'Federal Reserve', status: 'healthy' },
      { id: 'src_swift_mx', name: 'SWIFT MT→MX (sese.023-024)', vendor: 'SWIFT', status: 'warning' },
    ],
    recordsToday: 92_148,
    p95Latency: '6.2 min',
    slaTarget: '< 10 min',
    withinSla: true,
  },
  {
    id: 'cat_custody',
    name: 'Custody Positions & Holdings',
    description:
      'Position tape from prime brokers, custodians, and fund administrators — start-of-day and intraday snapshots, with corporate-action stream and per-row hash integrity to the vendor manifest.',
    protocols: ['SFTP positional files', 'SWIFT seev (corporate actions)', 'REST APIs (BNY DataX, Geneva)'],
    sources: [
      { id: 'src_bny_custody', name: 'BNY Mellon Custody', vendor: 'BNY Mellon', status: 'healthy' },
      { id: 'src_state_street', name: 'State Street Alpha', vendor: 'State Street', status: 'healthy' },
      { id: 'src_apex_clearing', name: 'Apex Clearing', vendor: 'Apex', status: 'healthy' },
    ],
    recordsToday: 420_182,
    p95Latency: '7.4 min',
    slaTarget: '< 10 min',
    withinSla: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AC2 · Canonical transaction schema
// ─────────────────────────────────────────────────────────────────────────────

export interface CanonicalSchemaField {
  col: string;
  type: string;
  required: boolean;
  desc: string;
  acceptance?: string;
}

export const canonicalTransactionSchema: CanonicalSchemaField[] = [
  { col: 'txn_id', type: 'string (UUID v7)', required: true, desc: 'Hub-assigned canonical transaction identifier (deterministic from source_system + source_id).', acceptance: 'AC2 · canonical txn_id' },
  { col: 'source_system', type: 'string', required: true, desc: 'Originating system code, e.g. "CRD", "DTCC_CTM", "FEDWIRE", "BNY_CUSTODY", "SWIFT_MT".', acceptance: 'AC4 · idempotency component' },
  { col: 'source_id', type: 'string', required: true, desc: 'Source-native primary key (FIX ClOrdID, CTM CTI, SWIFT MT seq, BNY position lot id).', acceptance: 'AC4 · idempotency component' },
  { col: 'trade_date', type: 'date', required: true, desc: 'Trade execution date in originating market timezone, normalized to ISO 8601.', acceptance: 'AC2 · canonical trade_date' },
  { col: 'settle_date', type: 'date', required: true, desc: 'Contractual settlement date (T+1 from May 2024 for US equities).', acceptance: 'AC2 · canonical settle_date' },
  { col: 'instrument', type: 'struct', required: true, desc: 'Resolved instrument: { figi, isin, cusip, sedol, ticker, asset_class, mic }.', acceptance: 'AC2 · canonical instrument' },
  { col: 'counterparty', type: 'struct', required: true, desc: 'Resolved counterparty: { lei, name, role, parent_lei }. GLEIF-validated.', acceptance: 'AC2 · canonical counterparty' },
  { col: 'side', type: 'enum', required: true, desc: 'Buy / Sell / SellShort / Cover.' },
  { col: 'qty', type: 'decimal(28,8)', required: true, desc: 'Quantity (shares / contracts / face).' },
  { col: 'price', type: 'decimal(18,8)', required: true, desc: 'Execution price in transaction currency.' },
  { col: 'notional', type: 'decimal(28,4)', required: true, desc: 'Gross notional in transaction currency (qty × price).', acceptance: 'AC2 · canonical notional' },
  { col: 'ccy', type: 'string (ISO 4217)', required: true, desc: 'Transaction currency.', acceptance: 'AC2 · canonical ccy' },
  { col: 'reporting_ccy', type: 'string (ISO 4217)', required: true, desc: 'Reporting currency (per legal-entity policy — default USD).' },
  { col: 'reporting_notional', type: 'decimal(28,4)', required: true, desc: 'Notional converted to reporting currency using FX rate-of-record.', acceptance: 'AC3 · FX-converted amount' },
  { col: 'fx_rate', type: 'decimal(18,8)', required: false, desc: 'FX rate applied (null for same-currency transactions).', acceptance: 'AC3 · FX rate-of-record' },
  { col: 'fx_source', type: 'string', required: false, desc: 'FX rate source: "WM_4PM_LDN_FIX", "FED_NOON_USD", "BLOOMBERG_BGNL", "ECB_REF_CCY".', acceptance: 'AC3 · FX provenance' },
  { col: 'fx_as_of', type: 'timestamp', required: false, desc: 'FX rate snapshot timestamp (UTC).' },
  { col: 'book', type: 'string', required: true, desc: 'Trading book / legal-entity / desk identifier.', acceptance: 'AC2 · canonical book' },
  { col: 'trader', type: 'string', required: false, desc: 'Trader id (tokenized for downstream sharing).' },
  { col: 'venue_mic', type: 'string (ISO 10383)', required: false, desc: 'Execution venue MIC.' },
  { col: 'lifecycle_state', type: 'enum', required: true, desc: 'New | Filled | Partial | Cancelled | Confirmed | Settled | Failed.' },
  { col: 'idempotency_key', type: 'string', required: true, desc: 'CONCAT(source_system, "|", source_id) — natural idempotency key.', acceptance: 'AC4 · idempotency key' },
  { col: 'ingest_ts_utc', type: 'timestamp', required: true, desc: 'Timestamp when the Hub received the record (system time).' },
  { col: 'event_ts_utc', type: 'timestamp', required: true, desc: 'Timestamp from the source system (valid time).', acceptance: 'AC5 · latency measurement basis' },
  { col: 'valid_time_from', type: 'timestamp', required: true, desc: 'Bi-temporal · when this record became canonical truth.' },
  { col: 'valid_time_to', type: 'timestamp', required: false, desc: 'Bi-temporal · null = currently valid.' },
];

/** Sample rows demonstrating the canonical schema with FX conversion */
export interface CanonicalTransactionSample {
  txn_id: string;
  source_system: string;
  source_id: string;
  trade_date: string;
  settle_date: string;
  instrument: { figi: string; isin?: string; cusip?: string; ticker: string; asset_class: string; mic?: string };
  counterparty: { lei: string; name: string };
  side: 'Buy' | 'Sell' | 'SellShort' | 'Cover';
  qty: number;
  price: number;
  notional: number;
  ccy: string;
  reporting_ccy: string;
  reporting_notional: number;
  fx_rate: number | null;
  fx_source: string | null;
  book: string;
  lifecycle_state: string;
  idempotency_key: string;
  event_ts_utc: string;
}

export const canonicalSamples: CanonicalTransactionSample[] = [
  {
    txn_id: 'TXN-2026-05-17-CRD-A14B',
    source_system: 'CRD',
    source_id: 'CLORD-A14B',
    trade_date: '2026-05-17',
    settle_date: '2026-05-20',
    instrument: { figi: 'BBG000B9XRY4', isin: 'US0378331005', cusip: '037833100', ticker: 'AAPL', asset_class: 'Equity', mic: 'XNAS' },
    counterparty: { lei: '549300CITIUSXX1234', name: 'Citibank N.A.' },
    side: 'Buy',
    qty: 1200,
    price: 184.22,
    notional: 221_064.00,
    ccy: 'USD',
    reporting_ccy: 'USD',
    reporting_notional: 221_064.00,
    fx_rate: null,
    fx_source: null,
    book: 'LCM-CASH-NY',
    lifecycle_state: 'Confirmed',
    idempotency_key: 'CRD|CLORD-A14B',
    event_ts_utc: '2026-05-17T13:42:18.214Z',
  },
  {
    txn_id: 'TXN-2026-05-17-DTCC-CTM-9821',
    source_system: 'DTCC_CTM',
    source_id: 'CTI-2026051709821',
    trade_date: '2026-05-17',
    settle_date: '2026-05-20',
    instrument: { figi: 'BBG000BPH459', isin: 'US5949181045', cusip: '594918104', ticker: 'MSFT', asset_class: 'Equity', mic: 'XNAS' },
    counterparty: { lei: '549300GSGPNYXX1234', name: 'Goldman Sachs & Co. LLC' },
    side: 'Sell',
    qty: 800,
    price: 418.66,
    notional: 334_928.00,
    ccy: 'USD',
    reporting_ccy: 'USD',
    reporting_notional: 334_928.00,
    fx_rate: null,
    fx_source: null,
    book: 'LCM-CASH-NY',
    lifecycle_state: 'Settled',
    idempotency_key: 'DTCC_CTM|CTI-2026051709821',
    event_ts_utc: '2026-05-17T13:48:02.812Z',
  },
  {
    txn_id: 'TXN-2026-05-17-CRD-B22F',
    source_system: 'CRD',
    source_id: 'CLORD-B22F',
    trade_date: '2026-05-17',
    settle_date: '2026-05-20',
    instrument: { figi: 'BBG000C0G1D1', isin: 'JP3902400005', ticker: '7203.T', asset_class: 'Equity', mic: 'XTKS' },
    counterparty: { lei: '353800NOMURXXXX5678', name: 'Nomura Securities Co.' },
    side: 'Buy',
    qty: 5000,
    price: 2148.00,
    notional: 10_740_000.00,
    ccy: 'JPY',
    reporting_ccy: 'USD',
    reporting_notional: 69_034.59,
    fx_rate: 0.006427,
    fx_source: 'WM_4PM_LDN_FIX',
    book: 'LCM-INTL-LDN',
    lifecycle_state: 'Confirmed',
    idempotency_key: 'CRD|CLORD-B22F',
    event_ts_utc: '2026-05-17T08:14:22.018Z',
  },
  {
    txn_id: 'TXN-2026-05-17-SWIFT-MT541-441C',
    source_system: 'SWIFT_MT',
    source_id: 'MT541-2026-05-17-441C',
    trade_date: '2026-05-17',
    settle_date: '2026-05-20',
    instrument: { figi: 'BBG000BVPV84', isin: 'DE000BASF111', ticker: 'BAS.DE', asset_class: 'Equity', mic: 'XETR' },
    counterparty: { lei: '7LTWFZYICNSX8D621K86', name: 'Deutsche Bank AG' },
    side: 'Sell',
    qty: 3200,
    price: 48.92,
    notional: 156_544.00,
    ccy: 'EUR',
    reporting_ccy: 'USD',
    reporting_notional: 170_312.93,
    fx_rate: 1.0879,
    fx_source: 'ECB_REF_CCY',
    book: 'LCM-INTL-LDN',
    lifecycle_state: 'Confirmed',
    idempotency_key: 'SWIFT_MT|MT541-2026-05-17-441C',
    event_ts_utc: '2026-05-17T13:18:44.412Z',
  },
  {
    txn_id: 'TXN-2026-05-17-BNY-POS-184228',
    source_system: 'BNY_CUSTODY',
    source_id: 'POS-LOT-184228',
    trade_date: '2026-05-15',
    settle_date: '2026-05-16',
    instrument: { figi: 'BBG000BBJQV0', isin: 'US67066G1040', cusip: '67066G104', ticker: 'NVDA', asset_class: 'Equity', mic: 'XNAS' },
    counterparty: { lei: '549300BNYMELXX0001', name: 'BNY Mellon (Custodian)' },
    side: 'Buy',
    qty: 240,
    price: 1118.42,
    notional: 268_420.80,
    ccy: 'USD',
    reporting_ccy: 'USD',
    reporting_notional: 268_420.80,
    fx_rate: null,
    fx_source: null,
    book: 'WLT-MODEL-60-40',
    lifecycle_state: 'Settled',
    idempotency_key: 'BNY_CUSTODY|POS-LOT-184228',
    event_ts_utc: '2026-05-16T22:14:18.000Z',
  },
  {
    txn_id: 'TXN-2026-05-17-FEDWIRE-CT-72A1',
    source_system: 'FEDWIRE',
    source_id: 'PACS009-2026051713-72A1',
    trade_date: '2026-05-17',
    settle_date: '2026-05-17',
    instrument: { figi: 'CASH-USD', ticker: 'USD', asset_class: 'Cash' },
    counterparty: { lei: '549300JPMORGUSXXX9999', name: 'JPMorgan Chase N.A.' },
    side: 'Sell',
    qty: 1,
    price: 4_200_000,
    notional: 4_200_000,
    ccy: 'USD',
    reporting_ccy: 'USD',
    reporting_notional: 4_200_000,
    fx_rate: null,
    fx_source: null,
    book: 'TSY-FUNDING',
    lifecycle_state: 'Settled',
    idempotency_key: 'FEDWIRE|PACS009-2026051713-72A1',
    event_ts_utc: '2026-05-17T13:42:18.214Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AC3 · FX rate-of-record table (per-leg policy)
// ─────────────────────────────────────────────────────────────────────────────

export interface FxRateOfRecord {
  pair: string;
  rate: number;
  source: string;
  asOf: string;
  policy: string;
}

export const fxRatesOfRecord: FxRateOfRecord[] = [
  { pair: 'EUR/USD', rate: 1.0879, source: 'ECB_REF_CCY',     asOf: '2026-05-17 14:15 UTC', policy: 'EU equities · ECB reference 14:15 CET' },
  { pair: 'GBP/USD', rate: 1.2614, source: 'WM_4PM_LDN_FIX',  asOf: '2026-05-17 16:00 BST', policy: 'UK securities & FX trades' },
  { pair: 'JPY/USD', rate: 0.006427, source: 'WM_4PM_LDN_FIX', asOf: '2026-05-17 16:00 BST', policy: 'APAC equities' },
  { pair: 'CHF/USD', rate: 1.1018, source: 'WM_4PM_LDN_FIX',  asOf: '2026-05-17 16:00 BST', policy: 'CH securities' },
  { pair: 'CAD/USD', rate: 0.7321, source: 'BOC_NOON_FIX',    asOf: '2026-05-17 16:00 ET',  policy: 'CA securities · BoC published' },
  { pair: 'AUD/USD', rate: 0.6612, source: 'WM_4PM_SYD_FIX',  asOf: '2026-05-17 16:00 AEST', policy: 'APAC ex-JP' },
  { pair: 'SGD/USD', rate: 0.7414, source: 'BLOOMBERG_BGNL',  asOf: '2026-05-17 14:30 UTC', policy: 'APAC ex-JP fallback' },
  { pair: 'HKD/USD', rate: 0.1283, source: 'BLOOMBERG_BGNL',  asOf: '2026-05-17 14:30 UTC', policy: 'HK equities' },
];

// ─────────────────────────────────────────────────────────────────────────────
// AC4 · Idempotency demo
// ─────────────────────────────────────────────────────────────────────────────

export interface IdempotencyDemoEvent {
  ts: string;
  message: string;
  detail: string;
  result: 'inserted' | 'deduped' | 'noop';
}

export const idempotencyDemoTimeline: IdempotencyDemoEvent[] = [
  {
    ts: '13:42:18.214',
    message: 'Source emits — CRD CLORD-A14B (AAPL Buy 1,200 @ 184.22)',
    detail: 'idempotency_key = CRD|CLORD-A14B  ·  payload_hash = 0x7a14…',
    result: 'inserted',
  },
  {
    ts: '13:42:18.642',
    message: 'Hub writes canonical row to silver.transactions',
    detail: 'txn_id = TXN-2026-05-17-CRD-A14B (deterministic UUID v7 from idempotency_key)',
    result: 'inserted',
  },
  {
    ts: '13:42:42.118',
    message: 'CRD session failover · same message re-delivered',
    detail: 'idempotency_key = CRD|CLORD-A14B  ·  payload_hash = 0x7a14… (match)',
    result: 'deduped',
  },
  {
    ts: '13:42:42.119',
    message: 'Hub MERGE — no insert, no update, watermark advanced',
    detail: 'row count unchanged · downstream consumers unaffected',
    result: 'noop',
  },
  {
    ts: '14:02:18.014',
    message: 'Manual replay window triggered (steward initiated)',
    detail: '4 hours of CRD log replayed · 184,228 events',
    result: 'noop',
  },
  {
    ts: '14:02:42.612',
    message: 'Replay complete · 0 duplicates created',
    detail: 'All 184,228 events matched existing idempotency_keys',
    result: 'deduped',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AC5 · Latency telemetry (p95 by connector, last 24 hours)
// ─────────────────────────────────────────────────────────────────────────────

export interface LatencyPoint {
  name: string; // hour label
  oms: number;
  settlement: number;
  custody: number;
}

export const latency24h: LatencyPoint[] = Array.from({ length: 24 }, (_, i) => {
  const hour = (14 - 23 + i + 48) % 24; // last 24h ending at 14:00 ET
  const label = `${String(hour).padStart(2, '0')}:00`;
  // Steady-state with one breach spike in the middle of the window
  const breach = i === 11; // ~11h ago
  return {
    name: label,
    oms: Math.round((3.8 + Math.sin(i / 3) * 0.6 + (breach ? 7.4 : 0)) * 10) / 10,
    settlement: Math.round((5.4 + Math.sin(i / 4) * 0.9 + (breach ? 5.8 : 0)) * 10) / 10,
    custody: Math.round((6.8 + Math.sin(i / 5) * 1.1) * 10) / 10,
  };
});

export const slaThresholdMin = 10;

export interface SlaBreach {
  id: string;
  ts: string;
  connector: string;
  p95Observed: string;
  threshold: string;
  rootCause: string;
  status: 'open' | 'mitigated' | 'resolved';
  resolution: string;
}

export const slaBreaches: SlaBreach[] = [
  {
    id: 'slo_001',
    ts: '2026-05-17 03:14 ET',
    connector: 'OMS / EMS (Charles River)',
    p95Observed: '11.2 min',
    threshold: '10 min',
    rootCause: 'CRD primary session failover · 3-min seq-gap recovery before ResendRequest cleared',
    status: 'resolved',
    resolution: 'Auto-recovered via redundant US-WEST session · runbook unchanged',
  },
  {
    id: 'slo_002',
    ts: '2026-05-17 03:18 ET',
    connector: 'Settlement (DTCC CTM)',
    p95Observed: '11.0 min',
    threshold: '10 min',
    rootCause: 'Downstream DTCC affirmation queue backlog on T+1 cutoff (21:00 ET prior day)',
    status: 'resolved',
    resolution: 'Cleared at 04:02 ET when DTCC drained · pre-emptive alert raised',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Jira ticket meta — for the workspace header
// ─────────────────────────────────────────────────────────────────────────────

export const jiraTicket = {
  id: 'FNSV-184',
  title: 'Multi-Asset Trade and Transaction Ingestion into FinServ Datahub',
  status: 'In Review',
  assignee: 'Kishore Kristamsetty',
  reporter: 'V. Kumar Astikar (Manager)',
  sprint: 'Sprint 24 · 2026-05-08 → 2026-05-21',
  storyPoints: 13,
  epic: 'FNSV-180 · Cross-asset Transaction 360',
  url: 'https://infinize.atlassian.net/browse/FNSV-184',
  userStory: {
    asA: 'data engineer on the FinServ platform',
    iWant: 'to ingest trade, settlement, and custody data from front, middle, and back-office systems into the central Datahub',
    soThat: 'risk, finance, and operations teams query one consolidated transaction store instead of reconciling across silos',
  },
  acceptance: [
    {
      id: 'AC1',
      text: 'Connectors for at least 3 source categories: OMS/EMS trade feeds, settlement (DTCC/Fedwire/SWIFT MT/MX), and custody positions',
      status: 'done' as const,
      evidence: 'connector-categories panel · 3 categories live with 10 sources, all healthy except SWIFT MT→MX (warning, monitored)',
    },
    {
      id: 'AC2',
      text: 'Records normalized to a canonical transaction schema (txn_id, trade_date, settle_date, instrument, counterparty, notional, ccy, book)',
      status: 'done' as const,
      evidence: 'canonical schema panel · 24 fields including all required canonical fields + bi-temporal stamping',
    },
    {
      id: 'AC3',
      text: 'FX-rate-of-record applied so all monetary amounts have a reporting-currency equivalent',
      status: 'done' as const,
      evidence: 'FX rate-of-record panel · 8 currency pairs, per-leg policy, sample non-USD transactions converted',
    },
    {
      id: 'AC4',
      text: 'Idempotent ingestion: replaying a source file does not duplicate transactions (keyed on source_system + source_id)',
      status: 'done' as const,
      evidence: 'idempotency demo · timeline showing dedupe on session failover + full 4h replay creating 0 duplicates',
    },
    {
      id: 'AC5',
      text: 'End-to-end latency p95 under 10 minutes for intraday feeds; SLAs alerted on breach',
      status: 'done' as const,
      evidence: '24h latency telemetry · OMS 4.8min / Settle 6.2min / Custody 7.4min · 2 breaches caught and alerted overnight',
    },
  ],
};
