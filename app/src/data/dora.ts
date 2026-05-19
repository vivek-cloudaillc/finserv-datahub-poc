import type { DoraIncident } from '../types';

export const doraIncidents: DoraIncident[] = [
  {
    id: 'dora_001',
    title: 'Bloomberg B-PIPE feed degradation (London region)',
    classification: 'Significant',
    openedAt: '2026-05-16 13:14 UTC',
    status: 'Investigating',
    initialNotificationDue: '2026-05-16 17:14 UTC',
    intermediateDue: '2026-05-19 13:14 UTC',
    finalDue: '2026-06-16 13:14 UTC',
    service: 'Market Data',
    impact: 'Tick latency on EU equity pairs +180ms; affects best-ex monitoring',
  },
  {
    id: 'dora_002',
    title: 'Marqeta auth retries elevated',
    classification: 'Non-Major',
    openedAt: '2026-05-15 08:22 UTC',
    status: 'Mitigated',
    initialNotificationDue: '—',
    intermediateDue: '—',
    finalDue: '—',
    service: 'Card Issuing',
    impact: 'Auth retry rate up to 3.1%; vendor fix deployed at 14:08',
  },
  {
    id: 'dora_003',
    title: 'Persona IDV webhook backlog',
    classification: 'Non-Major',
    openedAt: '2026-05-13 19:42 UTC',
    status: 'Resolved',
    initialNotificationDue: '—',
    intermediateDue: '—',
    finalDue: '—',
    service: 'KYC',
    impact: 'Webhook queue depth crossed 5K; cleared in 38 min',
  },
];

export const tppRegister = [
  { id: 'tpp_aws', name: 'AWS', service: 'Cloud + S3 + KMS + GuardDuty', tier: 'Critical', country: 'IE/DE', soc: 'SOC 2 Type II', doraNote: 'Critical TPP; written agreement Sec 30' },
  { id: 'tpp_bloomberg', name: 'Bloomberg', service: 'Market Data B-PIPE', tier: 'Critical', country: 'GB/US', soc: 'SOC 1 + SOC 2', doraNote: 'Critical TPP; exit plan documented' },
  { id: 'tpp_marqeta', name: 'Marqeta', service: 'Card issuing platform', tier: 'Critical', country: 'US', soc: 'PCI-DSS L1 + SOC 2', doraNote: 'TPP; concentration risk monitored' },
  { id: 'tpp_persona', name: 'Persona', service: 'IDV / KYC', tier: 'Important', country: 'US', soc: 'SOC 2 Type II', doraNote: 'TPP register row' },
  { id: 'tpp_plaid', name: 'Plaid', service: 'Open banking aggregation', tier: 'Important', country: 'US', soc: 'SOC 2 Type II', doraNote: 'TPP register row' },
  { id: 'tpp_snowflake', name: 'Snowflake', service: 'External tables / data sharing', tier: 'Important', country: 'US/EU', soc: 'SOC 1 + SOC 2 + ISO 27001', doraNote: 'TPP register row' },
  { id: 'tpp_anthropic', name: 'Anthropic', service: 'LLM for NL→SQL + copilots', tier: 'Important', country: 'US', soc: 'SOC 2 Type II', doraNote: 'LLM provider; PII guardrails enforced upstream' },
];
