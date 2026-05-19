import type { NlTranscript } from '../types';

export const nlTranscripts: NlTranscript[] = [
  {
    id: 'nl_01',
    persona: 'CDO',
    question: 'Show me HNW clients in CA and NY with both a deposit relationship and a wealth advisory account who have transacted across 3+ states last quarter and have not been contacted by an advisor in 60 days.',
    intent: 'cohort.cross_domain_unreached_hnw',
    metrics: ['customer_count', 'aum_total', 'last_advisor_contact_days'],
    dimensions: ['state', 'segment', 'days_since_contact'],
    sql: `WITH eligible AS (
  SELECT c.mcr_id, c.segment, c.state, SUM(a.balance) AS aum
  FROM gold.customer_360 c
  JOIN gold.accounts a USING (mcr_id)
  WHERE c.segment = 'HNW'
    AND c.state IN ('CA','NY')
    AND a.type IN ('Brokerage','IRA')
    AND a.balance > 0
  GROUP BY c.mcr_id, c.segment, c.state
), mobility AS (
  SELECT mcr_id, COUNT(DISTINCT state) AS states_q
  FROM gold.transaction_360
  WHERE posted_at >= date_trunc('quarter', current_date) - INTERVAL '1 quarter'
    AND posted_at <  date_trunc('quarter', current_date)
  GROUP BY mcr_id
)
SELECT e.state, COUNT(*) AS customers, ROUND(SUM(e.aum)/1e6,1) AS aum_mm
FROM eligible e
JOIN mobility m USING (mcr_id)
LEFT JOIN gold.advisor_contact h USING (mcr_id)
WHERE m.states_q >= 3
  AND COALESCE(h.last_contact_dt, '1900-01-01') < current_date - INTERVAL '60 days'
GROUP BY e.state
ORDER BY customers DESC;`,
    chart: 'bar',
    data: [
      { name: 'NY', value: 42, extra: 92.4 },
      { name: 'CA', value: 31, extra: 71.8 },
    ],
    summary:
      '73 HNW cross-domain clients across NY (42) and CA (31) with $164.2M aggregate AUM are unreached for 60+ days while showing 3+ state-mobility — clear right-place-right-time outreach list for advisor channels.',
    citations: [
      'gold.customer_360',
      'gold.accounts',
      'gold.transaction_360',
      'gold.advisor_contact',
    ],
    guardrails: {
      rbac: 'OK',
      sensitivity: 'NPI — auto-tokenized for downstream marketing',
      rows: 73,
      informationBarrier: 'OK',
      tokenized: true,
    },
    followups: [
      'Slice by household, not customer',
      'Add NBA propensity score column',
      'Limit to advisors with capacity ≥ 2 new clients',
    ],
  },
  {
    id: 'nl_02',
    persona: 'BSA Officer',
    question: "What's driving the spike in ACH returns last week, and which originator is responsible?",
    intent: 'investigation.ach_return_spike',
    metrics: ['return_count', 'return_pct', 'top_originator'],
    dimensions: ['originator', 'return_code', 'date'],
    sql: `SELECT originator_name, return_code, COUNT(*) AS ret_count
FROM silver.payments.ach
WHERE return_dt BETWEEN current_date - INTERVAL '7 days' AND current_date
GROUP BY originator_name, return_code
ORDER BY ret_count DESC
LIMIT 25;`,
    chart: 'bar',
    data: [
      { name: 'R01-NSF', value: 142 },
      { name: 'R02-Account closed', value: 88 },
      { name: 'R03-No account', value: 41 },
      { name: 'R07-Auth revoked', value: 28 },
      { name: 'R10-Unauthorized', value: 22 },
      { name: 'R20-Non-txn acct', value: 14 },
    ],
    summary:
      'ACH returns up 38% week-on-week, driven by originator "Hedgewood Recurring LLC" (R01 142, R02 88). Hedgewood crossed Nacha 15% return-rate threshold — recommend originator review and possible CCD origination hold.',
    citations: ['silver.payments.ach', 'gold.aml.workspace'],
    guardrails: {
      rbac: 'OK',
      sensitivity: 'NPI',
      rows: 25,
      informationBarrier: 'OK',
      tokenized: false,
    },
    followups: [
      'Show Hedgewood customer base',
      'Cross-tab against AML alerts',
      'Compare to 4-week trailing average',
    ],
  },
  {
    id: 'nl_03',
    persona: 'Chief Actuary',
    question: 'Where is my loss ratio worst this quarter and what perils drive it?',
    intent: 'insurance.loss_ratio_by_peril',
    metrics: ['loss_ratio', 'incurred_loss', 'earned_premium'],
    dimensions: ['line_of_business', 'peril', 'state'],
    sql: `SELECT line_of_business, peril, state,
       SUM(incurred_loss)/NULLIF(SUM(earned_premium),0) AS lr,
       SUM(earned_premium) AS ep
FROM gold.insurance.loss_ratio
WHERE accounting_period = quarter('2026-05-17')
GROUP BY line_of_business, peril, state
HAVING SUM(earned_premium) > 250000
ORDER BY lr DESC
LIMIT 20;`,
    chart: 'bar',
    data: [
      { name: 'Auto · Hail TX', value: 1.18 },
      { name: 'Home · Wind FL', value: 1.04 },
      { name: 'Home · Wildfire CA', value: 0.92 },
      { name: 'Auto · Theft IL', value: 0.84 },
      { name: 'Commercial · Cyber NY', value: 0.78 },
      { name: 'Auto · Hail OK', value: 0.74 },
    ],
    summary:
      'Loss ratio worst on TX Auto Hail (118%) — single peril, three counties driving 62% of incurred. Recommend re-rating action and reinsurance review (current 12% cession too thin).',
    citations: ['gold.insurance.loss_ratio', 'gold.insurance.reserves'],
    guardrails: {
      rbac: 'OK',
      sensitivity: 'Confidential',
      rows: 20,
      informationBarrier: 'OK',
      tokenized: false,
    },
    followups: [
      'Project full-year loss ratio with current trend',
      'Show ceded vs. net for top 5 perils',
      'Compare to industry NAIC Schedule P',
    ],
  },
  {
    id: 'nl_04',
    persona: 'CIO (asset management)',
    question: 'Which traders breached pre-trade limits this month and what was the override pattern?',
    intent: 'surveillance.pretrade_breaches',
    metrics: ['breach_count', 'override_count', 'notional'],
    dimensions: ['trader', 'desk', 'limit_type'],
    sql: `SELECT trader, desk, limit_type, COUNT(*) AS breaches,
       SUM(CASE WHEN override = TRUE THEN 1 ELSE 0 END) AS overrides
FROM gold.surveillance.pretrade
WHERE event_dt >= date_trunc('month', current_date)
GROUP BY trader, desk, limit_type
ORDER BY breaches DESC;`,
    chart: 'bar',
    data: [
      { name: 'A. Sato · Quant', value: 14, extra: 12 },
      { name: 'D. Williamson · Quant', value: 11, extra: 10 },
      { name: 'H. Vasquez · LCM', value: 6, extra: 2 },
      { name: 'P. Sosa · LCM', value: 5, extra: 4 },
    ],
    summary:
      'Quant desk holds 25 of 36 month-to-date pre-trade limit breaches and 22 of 28 overrides. Sosa LCM 5 breaches / 4 overrides flagged for supervisory review — pattern suggests override-as-norm.',
    citations: ['gold.surveillance.pretrade', 'silver.trades.equities'],
    guardrails: {
      rbac: 'OK',
      sensitivity: 'MNPI',
      rows: 36,
      informationBarrier: 'OK',
      tokenized: false,
    },
    followups: [
      'Drill into Sosa overrides',
      'Plot breach vs. P&L correlation',
      'Generate suitability memo for compliance',
    ],
  },
  {
    id: 'nl_05',
    persona: 'CRO',
    question: 'Show me concentration of credit exposure by industry and rating across the bank.',
    intent: 'credit.concentration',
    metrics: ['exposure', 'pct_of_total'],
    dimensions: ['industry_naics', 'rating'],
    sql: `SELECT naics_industry, internal_rating,
       SUM(exposure_usd) AS exposure
FROM gold.credit.exposure
WHERE as_of_date = current_date
GROUP BY naics_industry, internal_rating
ORDER BY exposure DESC LIMIT 25;`,
    chart: 'donut',
    data: [
      { name: 'CRE Office', value: 1840 },
      { name: 'Healthcare', value: 1280 },
      { name: 'Tech', value: 980 },
      { name: 'Energy', value: 720 },
      { name: 'Manufacturing', value: 640 },
      { name: 'Other', value: 1240 },
    ],
    summary:
      'CRE Office still 28% of total exposure with 22% sub-investment-grade — Risk Appetite Statement threshold 25%. Recommend prudential cap and provision uplift before next FR Y-14 cycle.',
    citations: ['gold.credit.exposure', 'gold.ratings'],
    guardrails: {
      rbac: 'OK',
      sensitivity: 'Confidential',
      rows: 25,
      informationBarrier: 'OK',
      tokenized: false,
    },
    followups: [
      'Stress at +200bps with HPI -10%',
      'Top-20 names within CRE Office',
      'Compare to peer banks (call report)',
    ],
  },
  {
    id: 'nl_06',
    persona: 'CISO',
    question: 'Which datasets contain MNPI and are accessed outside the information barrier?',
    intent: 'governance.mnpi_outside_barrier',
    metrics: ['access_count', 'user_count'],
    dimensions: ['dataset', 'role'],
    sql: `SELECT dataset, accessor_role, COUNT(*) AS access_count
FROM audit.access_log
WHERE sensitivity_tier = 'MNPI'
  AND information_barrier_pass = FALSE
  AND access_dt >= current_date - INTERVAL '30 days'
GROUP BY dataset, accessor_role
ORDER BY access_count DESC;`,
    chart: 'bar',
    data: [
      { name: 'silver.trades.equities (Wealth Adv)', value: 4 },
      { name: 'gold.trade_360 (Risk Analyst)', value: 2 },
      { name: 'bronze.oms.charles_river (Steward)', value: 1 },
    ],
    summary:
      '7 attempted accesses to MNPI datasets by non-trading roles in the last 30 days; all blocked at query time. Recommend retraining for Wealth Advisor role and revisit purpose-of-use clause in policy.',
    citations: ['audit.access_log', 'governance.policies'],
    guardrails: {
      rbac: 'OK',
      sensitivity: 'Confidential',
      rows: 7,
      informationBarrier: 'OK',
      tokenized: false,
    },
    followups: [
      'Who are the accessors (de-identified)',
      'Show policy version in effect',
      'Generate evidence packet',
    ],
  },
  {
    id: 'nl_07',
    persona: 'Treasurer',
    question: 'What is our LCR and NSFR trend versus regulatory minimums?',
    intent: 'liquidity.lcr_nsfr',
    metrics: ['lcr', 'nsfr'],
    dimensions: ['date'],
    sql: `SELECT report_dt, lcr_pct, nsfr_pct
FROM gold.regulatory.lcr_nsfr
WHERE report_dt >= current_date - INTERVAL '90 days'
ORDER BY report_dt;`,
    chart: 'line',
    data: [
      { name: 'Wk-12', value: 124 },
      { name: 'Wk-11', value: 121 },
      { name: 'Wk-10', value: 119 },
      { name: 'Wk-9', value: 116 },
      { name: 'Wk-8', value: 118 },
      { name: 'Wk-7', value: 120 },
      { name: 'Wk-6', value: 122 },
      { name: 'Wk-5', value: 121 },
      { name: 'Wk-4', value: 118 },
      { name: 'Wk-3', value: 117 },
      { name: 'Wk-2', value: 119 },
      { name: 'Wk-1', value: 121 },
    ],
    summary: 'LCR has trended 116–124% (minimum 100%); NSFR steady at 108–112% (minimum 100%). Comfortable but with thin buffer in periods of large corporate-deposit outflow.',
    citations: ['gold.regulatory.lcr_nsfr', 'silver.deposits'],
    guardrails: { rbac: 'OK', sensitivity: 'Confidential', rows: 12, informationBarrier: 'OK', tokenized: false },
    followups: ['Stress at 30% deposit run-off', 'Decompose HQLA mix', 'Project T+1 to T+0 funding impact'],
  },
  {
    id: 'nl_08',
    persona: 'Portfolio Manager',
    question: 'For Aspen Wealth model portfolio Conservative-60/40, where are we tracking vs. benchmark this YTD?',
    intent: 'wealth.attribution',
    metrics: ['twr', 'attribution_alpha'],
    dimensions: ['asset_class', 'sector'],
    sql: `SELECT asset_class, sector, twr, benchmark, twr - benchmark AS alpha
FROM gold.wealth.attribution
WHERE model = 'Conservative-60/40'
  AND ytd = TRUE
ORDER BY alpha DESC;`,
    chart: 'bar',
    data: [
      { name: 'US Eq — Mega Cap', value: 1.2 },
      { name: 'US Eq — Mid Cap', value: 0.4 },
      { name: 'Intl Eq — Dev', value: -0.6 },
      { name: 'FI — Corp IG', value: 0.3 },
      { name: 'FI — Treasuries', value: -0.2 },
      { name: 'Cash & Equiv', value: 0 },
    ],
    summary: 'YTD alpha +0.9% vs. blended benchmark; driven by US Mega-Cap overweight. Intl Dev drag (-0.6%) tied to FX. Maintain current allocation through next rebalance.',
    citations: ['gold.wealth.attribution', 'silver.wealth.positions'],
    guardrails: { rbac: 'OK', sensitivity: 'Internal', rows: 6, informationBarrier: 'OK', tokenized: false },
    followups: ['Risk-adjusted alpha', 'Decompose by client (top 20)', 'Suitability checks (Reg BI)'],
  },
  {
    id: 'nl_09',
    persona: 'Underwriter',
    question: 'Assemble a risk packet for Atlas Renewables LLC, commercial property submission.',
    intent: 'underwriting.risk_packet',
    metrics: ['exposure', 'cat_modeled_loss', 'prior_losses'],
    dimensions: ['peril', 'location'],
    sql: `SELECT peril, location, modeled_loss, prior_losses
FROM gold.underwriting.risk_packet
WHERE insured = 'Atlas Renewables LLC';`,
    chart: 'table',
    data: [],
    summary:
      'Submission has 12 solar-farm locations across TX & LA; RMS hurricane v23 modeled $18.4M PML. No prior loss history. Recommended attachment $5M, ceded 30% to specialty market; preliminary premium $1.24M.',
    citations: ['gold.underwriting.risk_packet', 'silver.insurance.policies', 'src_rms'],
    guardrails: { rbac: 'OK', sensitivity: 'Confidential', rows: 12, informationBarrier: 'OK', tokenized: false },
    followups: ['Generate quote letter draft', 'Compare to peer submissions', 'Show modeled loss curve'],
  },
  {
    id: 'nl_10',
    persona: 'Claims Adjuster',
    question: 'Summarize the FNOL for claim clm_004 and recommend next actions.',
    intent: 'claims.summary',
    metrics: ['fraud_score', 'reserve_recommended'],
    dimensions: ['claim'],
    sql: `SELECT * FROM gold.claims.workspace WHERE claim_id = 'clm_004';`,
    chart: 'table',
    data: [],
    summary:
      "Home theft claim, $18.4K reserve. Fraud score 78 — prior burglary 2024 at same address, both claimed during owner travel. SIU referral recommended; obtain police report and travel verification before adjudicating.",
    citations: ['gold.claims.workspace', 'src_gw_claim', 'silver.fraud.signals'],
    guardrails: { rbac: 'OK', sensitivity: 'NPI', rows: 1, informationBarrier: 'OK', tokenized: true },
    followups: ['Draft SIU referral memo', 'Pull subrogation candidates', 'Show prior-claim history'],
  },
  {
    id: 'nl_11',
    persona: 'Controller',
    question: 'Explain the change in Call Report line item RCFD2170 (Total Loans) period-over-period.',
    intent: 'regulatory.call_report_line',
    metrics: ['period_value', 'prior_value', 'delta'],
    dimensions: ['line_item'],
    sql: `SELECT line_item, period_value, prior_value, period_value - prior_value AS delta
FROM gold.regulatory.call_report
WHERE line_item = 'RCFD2170' AND report_period = '2026Q1';`,
    chart: 'table',
    data: [],
    summary:
      'RCFD2170 (Total Loans) grew $182M QoQ. Drivers: $148M commercial originations (originator Hedgewood Commercial Capital), $34M residential refis. Lineage traces to silver.lending.loans:184272 source rows.',
    citations: ['gold.regulatory.call_report', 'silver.lending.loans', 'silver.lending.payments'],
    guardrails: { rbac: 'OK', sensitivity: 'Confidential', rows: 1, informationBarrier: 'OK', tokenized: false },
    followups: ['Show RCFD2170 historical trend', 'Compare to peer call reports', 'Generate variance memo'],
  },
  {
    id: 'nl_12',
    persona: 'Compliance',
    question: 'Generate a sponsor-bank-grade evidence packet for AML controls Q1 2026.',
    intent: 'evidence.aml_controls',
    metrics: ['alert_count', 'sar_filed', 'avg_review_days'],
    dimensions: ['typology', 'review_outcome'],
    sql: `SELECT typology, COUNT(*) alerts,
       SUM(CASE WHEN final = 'SAR' THEN 1 ELSE 0 END) sars,
       AVG(DATEDIFF('day', opened_at, closed_at)) avg_days
FROM gold.aml.workspace
WHERE quarter = '2026Q1'
GROUP BY typology;`,
    chart: 'bar',
    data: [
      { name: 'Structuring', value: 142 },
      { name: 'Layering', value: 88 },
      { name: 'Rapid Movement', value: 64 },
      { name: 'Mule', value: 48 },
      { name: 'Trade-Based', value: 22 },
      { name: 'Smurfing', value: 18 },
      { name: 'Sanctions', value: 14 },
    ],
    summary:
      'Q1 2026: 396 alerts, 41 SARs filed (10.4% conversion), avg review 6.2 days. Backlog flat. Citations and timestamps exportable as audit packet (CSV + S3 Object Lock URLs).',
    citations: ['gold.aml.workspace', 'audit.sar_filings'],
    guardrails: { rbac: 'OK', sensitivity: 'Confidential', rows: 7, informationBarrier: 'OK', tokenized: false },
    followups: ['Export PDF packet', 'Add OFAC screening summary', 'Compare to last 4 quarters'],
  },
];
