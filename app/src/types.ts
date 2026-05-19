export type Role =
  | 'Analyst'
  | 'Steward'
  | 'Risk'
  | 'Compliance'
  | 'Underwriter'
  | 'Advisor'
  | 'Admin';

export type Density = 'Compact' | 'Comfortable';
export type Theme = 'light' | 'dark';

export type SubSector = 'Banking' | 'Capital Markets' | 'Insurance' | 'Wealth' | 'All';

export type ScreenKey =
  | 'home'
  | 'sources'
  | 'add-source'
  | 'trade-ingestion'
  | 'pipelines'
  | 'architecture'
  | 'medallion'
  | 'quality'
  | 'observability'
  | 'governance'
  | 'access'
  | 'customer-360'
  | 'transaction-360'
  | 'portfolio'
  | 'aml'
  | 'fraud'
  | 'surveillance'
  | 'claims'
  | 'underwriting'
  | 'nl'
  | 'reporting'
  | 'compliance'
  | 'model-governance'
  | 'dora'
  | 'admin';

export type SensitivityTier =
  | 'Public'
  | 'Internal'
  | 'Confidential'
  | 'NPI'
  | 'PCI'
  | 'PHI'
  | 'MNPI'
  | 'Auth Secret';

export type SourceHealth = 'healthy' | 'warning' | 'failed' | 'paused';

export interface Source {
  id: string;
  name: string;
  vendor: string;
  category:
    | 'Core Banking'
    | 'Card Processor'
    | 'Payment Rail'
    | 'KYC/IDV'
    | 'Sanctions'
    | 'Aggregation'
    | 'OMS'
    | 'EMS'
    | 'Market Data'
    | 'Custody'
    | 'Fund Admin'
    | 'Policy Admin'
    | 'Claims'
    | 'Underwriting'
    | 'Wealth Platform'
    | 'CRM'
    | 'ERP'
    | 'Product Analytics'
    | 'Bureau'
    | 'AML/TM';
  subSector: Exclude<SubSector, 'All'> | 'Cross';
  protocol: string;
  frequency: string;
  sensitivity: SensitivityTier;
  ingestionPattern: string;
  owner: string;
  steward: string;
  lastRun: string;
  healthScore: number;
  status: SourceHealth;
  schemaVersion: string;
  landingZone: string;
  volumePerDay: string;
  pitfalls: string;
  regulatorTags: string[];
}

export interface Pipeline {
  id: string;
  name: string;
  source: string;
  pattern: 'Batch' | 'Micro-Batch' | 'Streaming' | 'CDC' | 'Webhook';
  schedule: string;
  status: 'healthy' | 'warning' | 'failed' | 'running';
  successRate: number;
  p95Latency: string;
  throughput: string;
  dlq: number;
  lastRun: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  subSector: Exclude<SubSector, 'All'> | 'Cross';
}

export interface QualityRule {
  id: string;
  dataset: string;
  field: string;
  dimension:
    | 'Accuracy'
    | 'Completeness'
    | 'Consistency'
    | 'Timeliness'
    | 'Uniqueness'
    | 'Validity';
  type: string;
  rule: string;
  passing: number;
  failing: number;
  status: 'pass' | 'warn' | 'fail';
  steward: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  subSector: Exclude<SubSector, 'All'> | 'Cross';
}

export interface Incident {
  id: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  pipeline: string;
  dataset: string;
  openedAt: string;
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  mttd: string;
  mttr: string;
  owner: string;
  timeline: { time: string; event: string }[];
  blastRadius: string[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  household: string;
  dob: string;
  ssnMasked: string;
  einMasked?: string;
  segment: 'Mass' | 'Affluent' | 'HNW' | 'UHNW' | 'Commercial' | 'Institutional';
  state: string;
  city: string;
  email: string;
  phone: string;
  rm: string;
  riskScore: number;
  amlRisk: 'Low' | 'Medium' | 'High';
  ltv: number;
  productsHeld: string[];
  flags: string[];
  consent: {
    section1033: boolean;
    affiliates: boolean;
    marketing: boolean;
    hipaa?: boolean;
  };
  subSectors: Exclude<SubSector, 'All'>[];
  accounts: Account[];
  policies: Policy[];
  positions: Position[];
}

export interface Account {
  id: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Mortgage' | 'Auto Loan' | 'HELOC' | 'Brokerage' | 'IRA' | '401(k)' | 'Annuity' | 'Commercial';
  numberMasked: string;
  balance: number;
  openedAt: string;
  status: 'Active' | 'Closed' | 'Frozen' | 'Delinquent';
  institution: string;
}

export interface Policy {
  id: string;
  policyNumberMasked: string;
  line: 'Auto' | 'Home' | 'Umbrella' | 'Life' | 'Annuity' | 'Commercial GL' | 'Commercial Property' | 'Workers Comp' | 'Cyber';
  premium: number;
  status: 'In-Force' | 'Lapsed' | 'Cancelled' | 'Pending';
  inceptionDate: string;
  expirationDate: string;
  carrier: string;
  reinsurer?: string;
  cededPct?: number;
}

export interface Position {
  id: string;
  symbol: string;
  cusip: string;
  figi: string;
  isin?: string;
  qty: number;
  costBasis: number;
  marketValue: number;
  asOf: string;
  custodian: string;
  account: string;
  assetClass: 'Equity' | 'Fixed Income' | 'ETF' | 'Mutual Fund' | 'Option' | 'Future' | 'Cash' | 'Crypto';
  fairValueLevel: 1 | 2 | 3;
}

export interface Transaction {
  id: string;
  customerId: string;
  account: string;
  rail: 'ACH' | 'Wire' | 'RTP' | 'FedNow' | 'Card' | 'Internal' | 'Check' | 'P2P';
  amount: number;
  currency: string;
  direction: 'Debit' | 'Credit';
  counterparty: string;
  counterpartyCountry?: string;
  mcc?: string;
  bic?: string;
  status: 'Posted' | 'Pending' | 'Returned' | 'Held' | 'Disputed';
  timestamp: string;
  iso20022Ref?: string;
  iso8583Ref?: string;
  fraudScore?: number;
  amlFlags?: string[];
  geo?: { city: string; country: string };
}

export interface Trade {
  id: string;
  customerId: string;
  symbol: string;
  cusip?: string;
  figi: string;
  side: 'Buy' | 'Sell' | 'Short' | 'Cover';
  qty: number;
  price: number;
  notional: number;
  venue: string;
  tradeDate: string;
  settleDate: string;
  execTime: string;
  fixSeq: number;
  fixClOrdId: string;
  status: 'Filled' | 'Partial' | 'Cancelled' | 'Rejected' | 'Pending';
  desk: string;
  trader: string;
  bestExScore?: number;
  surveillanceFlags?: string[];
}

export interface AmlAlert {
  id: string;
  customerId: string;
  typology: 'Structuring' | 'Layering' | 'Rapid Movement' | 'Mule' | 'Trade-Based' | 'Smurfing' | 'Sanctions Hit';
  score: number;
  amount: number;
  openedAt: string;
  status: 'open' | 'investigating' | 'sar-drafted' | 'cleared' | 'filed';
  assignee: string;
  triggeredRules: string[];
  narrative: string;
  relatedParties: string[];
  citations: string[];
}

export interface FraudCase {
  id: string;
  customerId: string;
  channel: 'Card-Not-Present' | 'Card-Present' | 'ACH' | 'Wire' | 'Account Takeover' | 'Synthetic ID' | 'New Account';
  riskScore: number;
  amount: number;
  openedAt: string;
  status: 'open' | 'reviewing' | 'blocked' | 'released' | 'confirmed-fraud';
  signals: { name: string; value: number }[];
  device: { fingerprint: string; ip: string; geo: string };
  modelVersion: string;
}

export interface SurveillanceAlert {
  id: string;
  pattern: 'Insider' | 'Spoofing' | 'Layering' | 'Wash' | 'Marking-the-Close' | 'Front-Running' | 'Pump-and-Dump';
  symbol: string;
  desk: string;
  trader: string;
  score: number;
  openedAt: string;
  status: 'open' | 'reviewing' | 'escalated' | 'cleared' | 'reported';
  evidence: string[];
  ordersInvolved: number;
  notional: number;
}

export interface Claim {
  id: string;
  customerId: string;
  policy: string;
  line: 'Auto' | 'Home' | 'Commercial' | 'Workers Comp';
  fnolDate: string;
  cause: string;
  state: string;
  reserve: number;
  paid: number;
  status: 'FNOL' | 'In Adjudication' | 'Approved' | 'Denied' | 'Closed' | 'Litigated';
  fraudScore: number;
  siuReferred: boolean;
  cededTo?: string;
  subrogation: boolean;
  adjuster: string;
}

export interface UnderwritingSubmission {
  id: string;
  insured: string;
  line: 'Commercial Property' | 'Commercial GL' | 'Workers Comp' | 'Cyber' | 'Specialty Life' | 'Annuity';
  effectiveDate: string;
  premium: number;
  exposure: number;
  catModelLoss: number;
  riskScore: number;
  status: 'New' | 'Quoted' | 'Bound' | 'Declined' | 'In Review';
  broker: string;
  mga: string;
  notes: string;
}

export interface NlTranscript {
  id: string;
  persona: string;
  question: string;
  intent: string;
  metrics: string[];
  dimensions: string[];
  sql: string;
  chart: 'bar' | 'line' | 'area' | 'donut' | 'table';
  data: { name: string; value: number; extra?: number }[];
  summary: string;
  citations: string[];
  guardrails: {
    rbac: 'OK' | 'BLOCKED';
    sensitivity: string;
    rows: number;
    informationBarrier: 'OK' | 'BLOCKED';
    tokenized: boolean;
  };
  followups: string[];
}

export interface Regulation {
  id: string;
  name: string;
  status: 'Compliant' | 'In Progress' | 'Gap';
  scope: string;
  controls: number;
  implemented: number;
  evidence: string[];
  requirements: { id: string; text: string; addressed: string }[];
  category: 'Banking' | 'Capital Markets' | 'Insurance' | 'Payments' | 'Privacy' | 'Cross';
}

export interface Dataset {
  id: string;
  name: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  rows: string;
  owner: string;
  sensitivity: SensitivityTier;
  format: string;
  partitions: string;
  schema: { col: string; type: string; pii?: boolean; desc: string }[];
  sample: Record<string, string | number>[];
  upstream: string[];
  downstream: string[];
  lastRefresh: string;
  subSector: Exclude<SubSector, 'All'> | 'Cross';
}

export interface ModelCard {
  id: string;
  name: string;
  purpose: string;
  owner: string;
  status: 'Production' | 'Challenger' | 'Retired' | 'Validation';
  version: string;
  trainingData: string[];
  performance: { metric: string; value: number }[];
  fairness: { metric: string; value: number }[];
  drift: number;
  lastValidated: string;
  nextReview: string;
  sr11_7: 'Compliant' | 'In Review' | 'Action Required';
}

export interface RegReport {
  id: string;
  name: string;
  regulator: string;
  cadence: string;
  dueDate: string;
  status: 'Draft' | 'In Review' | 'Filed' | 'Late';
  preparer: string;
  approver: string;
  lineItems: { code: string; label: string; value: number; priorValue: number; lineageRows: number }[];
}

export interface DoraIncident {
  id: string;
  title: string;
  classification: 'Major' | 'Significant' | 'Non-Major';
  openedAt: string;
  status: 'Open' | 'Investigating' | 'Mitigated' | 'Resolved';
  initialNotificationDue: string;
  intermediateDue: string;
  finalDue: string;
  service: string;
  impact: string;
}
