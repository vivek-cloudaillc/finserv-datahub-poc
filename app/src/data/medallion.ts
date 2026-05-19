/**
 * Medallion transformation fixtures — detailed Source → Bronze → Silver → Gold → Platinum
 * journeys for the canonical FinServ data flows the Hub ingests.
 *
 * Each flow lists explicit stages with concrete transformation logic, sample input rows,
 * sample output rows, and the SLA / contract attached to that stage. These power the
 * Medallion Explorer "flow" panel and the Pipelines stage DAG.
 */

export type StageKind =
  | 'Ingest'
  | 'Parse'
  | 'Validate'
  | 'Dedupe'
  | 'Resolve'
  | 'Enrich'
  | 'Conform'
  | 'Curate'
  | 'Publish'
  | 'Serve';

export interface MedallionStage {
  id: string;
  kind: StageKind;
  tier: 'Source' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  title: string;
  description: string;
  /** One-line transformation summary suitable for a chip */
  summary: string;
  /** Latency target for this stage */
  sla: string;
  /** Idempotency / exactly-once strategy */
  idempotency?: string;
  /** Engine that runs this stage */
  engine: string;
  /** Quality / contract rules enforced at this stage */
  rules: string[];
  /** Sample input record (object) */
  sampleIn?: Record<string, unknown>;
  /** Sample output record (object) */
  sampleOut?: Record<string, unknown>;
  /** Code snippet — SQL, Python, YAML, or pseudo-code — that runs at this stage */
  code?: string;
}

export interface MedallionFlow {
  id: string;
  name: string;
  subSector: 'Banking' | 'Capital Markets' | 'Insurance' | 'Wealth' | 'Cross';
  source: string;
  /** Headline business outcome this flow unlocks */
  outcome: string;
  /** Volume @ reference customer */
  volume: string;
  /** End-to-end SLA from source event to Gold/Platinum availability */
  endToEndSla: string;
  /** Regulatory tags this flow contributes evidence for */
  regulatorTags: string[];
  stages: MedallionStage[];
}

export const medallionFlows: MedallionFlow[] = [
  // ────────────────────────────────────────────────────────────────────────
  // 1. FedNow ISO 20022 real-time payments — the marquee streaming flow
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'flow_fednow',
    name: 'FedNow ISO 20022 pacs.008 → Real-time Payments 360',
    subSector: 'Banking',
    source: 'src_fednow',
    outcome:
      'Real-time AML pre-screening, OFAC interdiction at < 30s, and Transaction 360 enrichment for every FedNow payment.',
    volume: '184K payments / day · $48M notional',
    endToEndSla: 'P95 < 28s (event → Gold)',
    regulatorTags: ['OFAC', 'BSA', 'Reg J', 'BCBS 239'],
    stages: [
      {
        id: 'fn_ingest',
        kind: 'Ingest',
        tier: 'Source',
        title: 'FedNow message bus',
        description:
          'FedNow service emits ISO 20022 pacs.008 (CreditTransfer), pacs.002 (Status Report), pain.013/014 (request-for-payment) messages over a mTLS-secured AMQP endpoint. Hub maintains a redundant consumer per AZ with per-message ACK and at-least-once semantics.',
        summary: 'AMQP consumer · mTLS · per-AZ failover',
        sla: 'Event delivery < 500 ms',
        engine: 'AWS MSK + dedicated FedNow consumer pool',
        idempotency: 'msg_id is the natural idempotency key; consumer commits per message',
        rules: ['mTLS client cert valid', 'Message envelope schema = ISO 20022 RC2 2024', 'Replay window 72h'],
        code: `# fednow_consumer.py — at-least-once consumer with idempotency
consumer = kafka.Consumer({
    "bootstrap.servers": MSK_BOOTSTRAP,
    "security.protocol": "SSL",
    "ssl.certificate.location": "/secrets/fednow.crt",
    "group.id": "infinize-fednow-prod",
    "enable.auto.commit": False,         # manual commit after S3 PUT
    "isolation.level": "read_committed",
})
consumer.subscribe(["fednow.pacs.008", "fednow.pacs.002"])
while True:
    msg = consumer.poll(0.5)
    if msg is None: continue
    msg_id = parse_msg_id(msg.value())
    if seen_recently(msg_id): consumer.commit(msg); continue   # dedupe
    s3_put_object(
        Bucket="infinize-bronze",
        Key=f"rails/fednow/dt={today}/h={hour}/{msg_id}.xml",
        Body=msg.value(),
        ObjectLockMode="COMPLIANCE",
        ObjectLockRetainUntilDate=now() + timedelta(days=7*365),
    )
    consumer.commit(msg)`,
      },
      {
        id: 'fn_bronze',
        kind: 'Parse',
        tier: 'Bronze',
        title: 'Bronze · raw ISO 20022 XML',
        description:
          'Faithful, immutable landing. Source XML preserved byte-for-byte for SAR forensics, MAR look-back, and FRB examination. S3 Object Lock Compliance Mode + 7-year retention. Partitioned by source/ingestion_date/hour for cheap pruning.',
        summary: 'Faithful XML · S3 Object Lock · 7y retention',
        sla: 'Land < 2s from event receipt',
        engine: 'AWS S3 + Iceberg manifest',
        idempotency: 'Object key = msg_id; idempotent overwrite blocked by Object Lock',
        rules: ['Object Lock Compliance Mode', 'KMS CMK per tenant', 'No PAN / no clear PII in path'],
        sampleIn: {
          msg_id: 'INFNZ-2026051709420001',
          payload: '<?xml version="1.0"?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">\n  <FIToFICstmrCdtTrf>\n    <GrpHdr><MsgId>INFNZ-2026051709420001</MsgId>...</GrpHdr>\n    <CdtTrfTxInf>\n      <IntrBkSttlmAmt Ccy="USD">4892.00</IntrBkSttlmAmt>\n      <CdtrAgt><FinInstnId><BICFI>CITIUS33</BICFI></FinInstnId></CdtrAgt>\n      <DbtrAgt><FinInstnId><BICFI>CHASUS33</BICFI></FinInstnId></DbtrAgt>\n    </CdtTrfTxInf>\n  </FIToFICstmrCdtTrf>\n</Document>',
        },
        sampleOut: {
          s3_uri: 's3://infinize-bronze/rails/fednow/dt=2026-05-17/h=14/INFNZ-2026051709420001.xml',
          object_lock_until: '2033-05-17',
          ingest_ts: '2026-05-17T18:03:14.142Z',
          bronze_msg_id: 'INFNZ-2026051709420001',
          schema_version: 'pacs.008.001.10',
        },
        code: `-- Iceberg manifest registration (Glue)
INSERT INTO infinize_bronze.payments.fednow_raw
SELECT msg_id, payload_xml, schema_version,
       date_format(ingest_ts, 'yyyy-MM-dd') AS ingestion_date,
       hour(ingest_ts) AS ingestion_hour,
       ingest_ts
FROM staging.fednow_event_landings;`,
      },
      {
        id: 'fn_silver_parse',
        kind: 'Parse',
        tier: 'Silver',
        title: 'Silver · ISO 20022 → canonical payment',
        description:
          'XML → Infinize Financial Canonical Model (IFCM). XPath extraction with namespace awareness, schema-versioned per ISO 20022 release. Casts numeric amounts to decimal(18,2), validates currency against ISO 4217.',
        summary: 'XML → IFCM canonical · namespace-aware',
        sla: 'P95 < 3s',
        engine: 'Managed Service for Apache Flink',
        rules: ['ISO 20022 RC2 2024 schema validation', 'BIC valid against SWIFTRef', 'Currency ∈ ISO 4217'],
        sampleIn: { msg_id: 'INFNZ-2026051709420001', payload_xml: '<Document>...</Document>' },
        sampleOut: {
          txn_id: 'TXN-2026-05-17-FN-001',
          msg_id: 'INFNZ-2026051709420001',
          rail: 'FedNow',
          msg_type: 'pacs.008.001.10',
          amount: 4892.00,
          currency: 'USD',
          creditor_bic: 'CITIUS33',
          debtor_bic: 'CHASUS33',
          settle_dt: '2026-05-17',
          posted_at_utc: '2026-05-17T18:03:14.142Z',
        },
        code: `-- Flink SQL · stateless parse
CREATE VIEW silver.payments.fednow_parsed AS
SELECT
  uuid()                                                  AS txn_id,
  xpath_string(payload_xml, '//GrpHdr/MsgId')              AS msg_id,
  'FedNow'                                                AS rail,
  xpath_string(payload_xml, '@xmlns')                      AS msg_type,
  CAST(xpath_string(payload_xml,'//IntrBkSttlmAmt') AS DECIMAL(18,2))
                                                          AS amount,
  xpath_string(payload_xml,'//IntrBkSttlmAmt/@Ccy')        AS currency,
  xpath_string(payload_xml,'//CdtrAgt/FinInstnId/BICFI')   AS creditor_bic,
  xpath_string(payload_xml,'//DbtrAgt/FinInstnId/BICFI')   AS debtor_bic,
  CAST(xpath_string(payload_xml,'//IntrBkSttlmDt') AS DATE)
                                                          AS settle_dt,
  ingest_ts                                                AS posted_at_utc
FROM bronze.payments.fednow_raw;`,
      },
      {
        id: 'fn_silver_validate',
        kind: 'Validate',
        tier: 'Silver',
        title: 'Silver · DQ + OFAC + sanctions screen',
        description:
          'Inline OFAC + UN + EU + UK HMT screening, BIC validity, amount-range plausibility. Failing rows fork to a quarantine table with an SLA timer and assigned steward. OFAC hits route to AML investigations workspace.',
        summary: 'OFAC interdiction · DQ contract · quarantine',
        sla: 'P95 < 8s',
        engine: 'Flink + Bedrock-hosted name-match model',
        rules: [
          'OFAC name match score < 0.95 OR flag',
          'BIC valid (SWIFTRef daily refresh)',
          'amount > 0',
          'currency ∈ supported (USD, EUR, GBP, CAD, JPY)',
          'creditor BIC country = creditor country code',
        ],
        sampleOut: {
          txn_id: 'TXN-2026-05-17-FN-001',
          ofac_screen_status: 'pass',
          ofac_match_score: 0.12,
          bic_valid: true,
          dq_status: 'pass',
        },
        code: `-- Soda Core inline contract (Flink predicate)
checks for silver.payments.fednow_validated:
  - failed rows:
      name: ofac_block
      fail query: |
        SELECT * FROM CURRENT_BATCH WHERE ofac_match_score >= 0.95
      severity: P1
      on_fail: route_to gold.aml.workspace
  - row_count > 0
  - schema:
      creditor_bic: not null
      amount: must be > 0
  - freshness:
      column: posted_at_utc
      must be < 30s`,
      },
      {
        id: 'fn_silver_resolve',
        kind: 'Resolve',
        tier: 'Silver',
        title: 'Silver · Entity resolution (MCR + Counterparty)',
        description:
          'Resolve creditor/debtor BICs to a counterparty entity (GLEIF LEI graph) and the originating customer to a Master Customer Record. Probabilistic + deterministic matching with bi-temporal valid-time/system-time stamping.',
        summary: 'BIC → LEI · customer → MCR · bi-temporal',
        sla: 'P95 < 6s',
        engine: 'Splink (probabilistic) + dbt deterministic joins',
        rules: ['LEI checksum ISO 17442', 'MCR confidence ≥ 0.92 else queue for steward'],
        sampleOut: {
          txn_id: 'TXN-2026-05-17-FN-001',
          creditor_lei: '549300CITIUSXX1234',
          debtor_lei: '549300CHASUSXX5678',
          customer_mcr_id: 'MCR-00184',
          mcr_confidence: 0.97,
          valid_time: '2026-05-17T18:03:14Z',
          system_time: '2026-05-17T18:03:21Z',
        },
        code: `-- dbt · models/silver/payments/fednow_resolved.sql
{{ config(materialized='incremental', incremental_strategy='merge', unique_key='txn_id') }}

SELECT
  p.*,
  cp_cred.lei AS creditor_lei,
  cp_debt.lei AS debtor_lei,
  COALESCE(mcr.mcr_id, splink_resolve(p.debtor_account, p.debtor_name).mcr_id)
       AS customer_mcr_id,
  splink_resolve(p.debtor_account, p.debtor_name).confidence AS mcr_confidence,
  p.posted_at_utc AS valid_time,
  current_timestamp AS system_time
FROM silver.payments.fednow_validated p
LEFT JOIN ref.counterparty_lei cp_cred ON p.creditor_bic = cp_cred.bic
LEFT JOIN ref.counterparty_lei cp_debt ON p.debtor_bic   = cp_debt.bic
LEFT JOIN silver.customers.mcr      mcr ON p.debtor_account = mcr.account_number_e2e
{% if is_incremental() %}
  WHERE p.posted_at_utc > (SELECT MAX(valid_time) FROM {{ this }})
{% endif %}`,
      },
      {
        id: 'fn_gold',
        kind: 'Curate',
        tier: 'Gold',
        title: 'Gold · Transaction 360 + AML workspace',
        description:
          'Cross-rail Transaction 360 mart joined with customer, account, AML, fraud, and household roll-ups. Materialized incrementally; certified via dbt Cloud tests. Powers the customer-facing surfaces and regulator reports.',
        summary: 'Certified mart · cross-rail · household roll-up',
        sla: 'P95 < 18s end-to-end',
        engine: 'dbt Cloud + Iceberg merge',
        rules: ['debits = credits at TB close', 'consumer-driven contract test (Customer 360 app)', 'BCBS 239 timeliness < 60s'],
        sampleOut: {
          txn_id: 'TXN-2026-05-17-FN-001',
          rail: 'FedNow',
          customer_mcr_id: 'MCR-00184',
          customer_segment: 'HNW',
          amount_usd: 4892.00,
          counterparty_lei: '549300CITIUSXX1234',
          counterparty_name: 'Citibank N.A.',
          ofac_screen_status: 'pass',
          aml_score: 0.08,
          household_id: 'HH-1183',
          legal_entity: 'Meridian Bank N.A.',
        },
      },
      {
        id: 'fn_platinum',
        kind: 'Serve',
        tier: 'Platinum',
        title: 'Platinum · Real-time AML feature store',
        description:
          'Hot features (per-debtor velocity 1m/5m/1h/24h, counterparty network density, cross-border vs. domestic, structuring proximity) served via DynamoDB / Tecton for the AML scoring model. TTL 30 days, sub-100ms reads.',
        summary: 'DynamoDB + Tecton · sub-100ms · 30d TTL',
        sla: 'P95 read < 8ms',
        engine: 'Tecton on DynamoDB',
        rules: ['feature freshness < 60s', 'PII tokenized before write'],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 2. Marqeta ISO 8583 — card auth fraud-decision hot path
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'flow_marqeta',
    name: 'Marqeta ISO 8583 → Card Fraud Decision (< 100ms)',
    subSector: 'Banking',
    source: 'src_marqeta',
    outcome:
      'Sub-100ms fraud authorization decisions, with full lineage to Bronze for chargeback and dispute reconstruction.',
    volume: '8.2M auth / day · 2.1M cleared',
    endToEndSla: 'Auth decision P95 < 46ms · Bronze land P95 < 800ms',
    regulatorTags: ['PCI-DSS', 'Reg E', 'Reg II'],
    stages: [
      {
        id: 'mq_ingest',
        kind: 'Ingest',
        tier: 'Source',
        title: 'Marqeta auth tap (ISO 8583 0100/0110)',
        description:
          'Marqeta routes the authorization request to the Hub via low-latency webhook + an ISO 8583 binary tap for downstream forensics. The decision endpoint must respond within network roundtrip budget (Marqeta ~150ms total auth budget).',
        summary: 'Webhook + ISO 8583 binary tap · sub-100ms decision',
        sla: 'Webhook ingress P95 < 12ms',
        engine: 'AWS API Gateway + Lambda (provisioned concurrency) + Kinesis sidecar',
        idempotency: 'token_transaction_id is idempotency key; auth_code 5-tuple as fallback',
        rules: ['PCI-DSS scope · CDE-only', 'PAN tokenized at edge', 'No clear PAN in CloudWatch'],
      },
      {
        id: 'mq_decide',
        kind: 'Serve',
        tier: 'Platinum',
        title: 'Platinum · Card fraud decision (hot path)',
        description:
          'Synchronous model scoring. Feature lookup (DynamoDB + in-memory caches) → ONNX-runtime model on Lambda (warm pool) → decision. Decision logged to Kinesis for downstream Bronze persistence.',
        summary: 'ONNX runtime · feature lookup · decision logged',
        sla: 'P95 < 46ms (auth round-trip)',
        engine: 'Lambda (provisioned) + DynamoDB + ONNX Runtime',
        rules: ['Model registry SR 11-7 compliant', 'Block rate within ±20% of trailing 24h'],
        sampleIn: {
          token_transaction_id: 'mq_abc123',
          pan_token: 'tok_4111****1234',
          amount: 84.20,
          currency: 'USD',
          mcc: '5411',
          merchant_country: 'US',
          merchant_id: 'mch_grocery_42',
          decision_budget_ms: 100,
        },
        sampleOut: {
          decision: 'approve',
          score: 0.08,
          decision_latency_ms: 38,
          model_version: 'card-fraud-v4.2.1',
          reason_codes: ['low-velocity', 'merchant-trusted'],
        },
        code: `# fraud_score.py (Lambda handler, warm)
def lambda_handler(event, context):
    t0 = time.perf_counter_ns()
    tx = parse_event(event)                        # ~1ms
    feats = feature_store.batch_lookup(tx)         # ~4ms (DDB + cache)
    score = onnx_session.run(None, feats)[0][0]    # ~3ms
    decision = "decline" if score >= 0.92 else (
                "review" if score >= 0.62 else "approve")
    log_to_kinesis({                                # async, fire-and-forget
        "token_transaction_id": tx.id,
        "score": float(score),
        "decision": decision,
        "model_version": MODEL_VERSION,
        "decision_latency_ns": time.perf_counter_ns() - t0,
    })
    return {"decision": decision, "score": float(score),
            "model_version": MODEL_VERSION}`,
      },
      {
        id: 'mq_bronze',
        kind: 'Parse',
        tier: 'Bronze',
        title: 'Bronze · raw ISO 8583 + JSON envelope',
        description:
          'Async write-behind: ISO 8583 binary preserved (BCD packed-decimal where applicable) for SEC 17a-4 / FFIEC retention. JSON envelope holds the Marqeta webhook payload, the decision, the model version, and a hash-chain link for tamper-evidence.',
        summary: 'Binary + JSON envelope · 7y retention · tamper-evident',
        sla: 'Land P95 < 800ms (async)',
        engine: 'Kinesis Firehose → S3 (Iceberg)',
        rules: ['PAN tokenized · no clear-PAN', 'Hash-chain integrity (SHA-256 of prior row)'],
      },
      {
        id: 'mq_silver',
        kind: 'Resolve',
        tier: 'Silver',
        title: 'Silver · canonical card events',
        description:
          'Canonical card model: pan_token → MCR linkage, MCC mapping to internal taxonomy, merchant-name cleansing using Plaid/MX taxonomies + internal merchant MDM. Bi-temporal positions for chargeback look-back.',
        summary: 'Merchant MDM · MCC taxonomy · pan_token ↔ MCR',
        sla: 'P95 < 14s',
        engine: 'Flink Structured Streaming + dbt',
        rules: ['merchant_country valid ISO 3166', 'MCC valid ISO 18245', 'MCR resolution confidence ≥ 0.92'],
        code: `-- dbt · models/silver/cards/auth_resolved.sql
SELECT
  e.token_transaction_id,
  e.pan_token,
  e.amount,
  e.currency,
  e.mcc,
  m.merchant_clean_name,
  m.merchant_category,
  e.merchant_country,
  e.decision,
  e.score AS fraud_score,
  e.model_version,
  CASE WHEN e.response_code = '00' THEN 'approved'
       WHEN e.response_code IN ('05','51','61') THEN 'declined'
       ELSE 'other' END AS settlement_status,
  pan.mcr_id AS customer_mcr_id,
  e.posted_at_utc AS valid_time,
  current_timestamp AS system_time
FROM bronze.cards.marqeta_auth e
LEFT JOIN ref.merchant_mdm     m   ON e.merchant_id = m.merchant_id
LEFT JOIN ref.pan_token_to_mcr pan ON e.pan_token   = pan.pan_token`,
      },
      {
        id: 'mq_gold',
        kind: 'Curate',
        tier: 'Gold',
        title: 'Gold · Transaction 360 + chargeback workspace',
        description:
          'Unified into Transaction 360 alongside ACH/Wire/RTP/FedNow. Powers Reg E dispute workflow, chargeback economics, and merchant profitability marts.',
        summary: 'Transaction 360 · dispute ready · merchant economics',
        sla: 'P95 < 22s end-to-end',
        engine: 'dbt Cloud + Iceberg',
        rules: ['Reg E SLA timer attached on dispute open'],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 3. Charles River FIX 4.4 → Trade 360 + Surveillance
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'flow_crd',
    name: 'Charles River FIX 4.4 → Trade 360 + Surveillance',
    subSector: 'Capital Markets',
    source: 'src_charles_river',
    outcome:
      'CAT-ready, MiFID II RTS-22-clean trade lifecycle from order to settlement, with real-time MAR surveillance.',
    volume: '184K orders · 612K executions / day',
    endToEndSla: 'P95 < 4s order→Gold · CAT T+1 ready',
    regulatorTags: ['CAT (Rule 613)', 'MiFID II RTS 22', 'Reg NMS', 'T+1 (May 2024)', '17a-3/4'],
    stages: [
      {
        id: 'cr_ingest',
        kind: 'Ingest',
        tier: 'Source',
        title: 'FIX 4.4 session consumer',
        description:
          'QuickFIX/J engine with redundant primary/secondary sessions per region (US-EAST + US-WEST). MsgSeqNum monitored for gaps; ResendRequest issued automatically. Raw FIX log written to Bronze before parse.',
        summary: 'QuickFIX/J · seq-gap recovery · raw log preserved',
        sla: 'Tick-to-Bronze < 600ms',
        engine: 'QuickFIX/J on ECS Fargate (dedicated)',
        idempotency: '(SenderCompID, TargetCompID, MsgSeqNum) uniquely identifies a FIX message',
        rules: ['FIX session sequence integrity', 'ClOrdID uniqueness within trading day', 'No MNPI in logs'],
      },
      {
        id: 'cr_bronze',
        kind: 'Parse',
        tier: 'Bronze',
        title: 'Bronze · raw FIX log (pipe-delimited)',
        description:
          'Pipe-delimited FIX preserved verbatim; SOH (0x01) normalized to "|" only in display, original bytes archived for FINRA 17a-4 retention.',
        summary: 'Raw FIX · 17a-4 WORM-equivalent · 6y retention',
        sla: 'Land < 600ms',
        engine: 'S3 Object Lock + Iceberg',
        rules: ['17a-4 retention path', 'No MNPI in metadata'],
        sampleIn: {
          raw_fix: '8=FIX.4.4|9=158|35=D|34=184220|49=CRDM-PROD|56=INFNZ-FIX|11=CLORD-A14B|55=AAPL|54=1|38=1200|40=2|44=184.20|59=0|10=098|',
        },
        sampleOut: {
          msg_type: 'D',
          sender_comp: 'CRDM-PROD',
          target_comp: 'INFNZ-FIX',
          msg_seq: 184220,
          cl_ord_id: 'CLORD-A14B',
          symbol: 'AAPL',
          side: '1',
          order_qty: 1200,
          ord_type: '2',
          price: 184.20,
        },
      },
      {
        id: 'cr_silver_parse',
        kind: 'Parse',
        tier: 'Silver',
        title: 'Silver · FIX → canonical trade event',
        description:
          'FIX → IFCM canonical trade. Side codes (1/2/5) mapped to Buy/Sell/SellShort; OrdType (1/2/3/4) mapped; ExecType (F/4/5/8) mapped. Instrument resolved via FIGI lookup; LEI joined for counterparty.',
        summary: 'FIX → IFCM · FIGI/LEI resolution',
        sla: 'P95 < 1.4s',
        engine: 'Flink Structured Streaming',
        rules: ['ISIN check digit', 'CUSIP check digit', 'FIGI resolution success ≥ 99.5%'],
        code: `// Flink job · CharlesRiverFixParser.java (excerpt)
DataStream<TradeEvent> trades = fixStream
  .flatMap(new FixDecoder())                 // tag-value parse
  .keyBy(msg -> msg.field(55))               // by Symbol
  .map(msg -> TradeEvent.builder()
      .clOrdId(msg.field(11))
      .symbol(msg.field(55))
      .side(SideCode.of(msg.field(54)))       // 1=Buy, 2=Sell, 5=SellShort
      .ordType(OrdTypeCode.of(msg.field(40)))
      .qty(msg.decimal(38))
      .price(msg.decimal(44))
      .figi(figiResolver.lookup(msg.field(55)))
      .lei(leiResolver.fromBic(msg.field(115)))
      .tradeDate(msg.date(75))
      .settleDate(msg.date(64))               // T+1 since May 2024
      .build())
  .filter(t -> t.lei() != null || logQuarantine(t));`,
      },
      {
        id: 'cr_silver_validate',
        kind: 'Validate',
        tier: 'Silver',
        title: 'Silver · Pre-trade risk + best-ex',
        description:
          'Rule 15c3-5 pre-trade controls (gross/net notional, single-order, price collar, restricted lists, MNPI restrictions for sell-side desks). Best-ex score computed against consolidated tape (NYSE TAQ + ICE CT).',
        summary: '15c3-5 controls · best-ex vs. consolidated tape',
        sla: 'P95 < 5ms (hot path) · 1.2s (best-ex)',
        engine: 'In-memory rules engine + Flink',
        rules: [
          'gross notional ≤ desk limit',
          'price within 5σ of last sale',
          'restricted list lookup',
          'MNPI desk segmentation enforced',
        ],
      },
      {
        id: 'cr_gold',
        kind: 'Curate',
        tier: 'Gold',
        title: 'Gold · Trade 360 + CAT mart',
        description:
          'Cross-asset Trade 360 mart. Joined to position tape, allocation tape, and post-trade settlement (DTCC CTM). CAT Rule 613 mart auto-assembled for T+1 submission.',
        summary: 'Trade 360 · CAT T+1 · best-ex panel',
        sla: 'P95 < 4s end-to-end',
        engine: 'dbt Cloud + Iceberg',
        rules: ['CAT reportable event coverage 100%', 'MiFID II RTS-22 65-field completeness'],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 4. Guidewire PolicyCenter / ClaimCenter ACORD XML
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'flow_guidewire',
    name: 'Guidewire ACORD XML → Policy 360 + Reserving + IFRS-17',
    subSector: 'Insurance',
    source: 'src_gw_policy',
    outcome:
      'ACORD-clean policy + claim feeds powering Policy 360, IBNR reserving, IFRS-17 cohort cube, and reinsurance ceded reconciliation.',
    volume: '92K endorsements · 4.2K FNOL / day',
    endToEndSla: 'P95 < 6s policy event · EOD cube refresh < 90 min',
    regulatorTags: ['NAIC MAR', 'ORSA', 'IFRS 17 / LDTI', 'State DOI', 'MCAS'],
    stages: [
      {
        id: 'gw_ingest',
        kind: 'Ingest',
        tier: 'Source',
        title: 'Guidewire Cloud REST + JMS',
        description:
          'Guidewire Cloud emits PolicyChanged / ClaimFNOL events via REST webhooks and JMS for high-frequency desk subscriptions. Each event carries an ACORD-mapped XML body.',
        summary: 'REST webhooks + JMS · ACORD XML body',
        sla: 'Event ingress < 800ms',
        engine: 'API Gateway + Lambda + SQS sidecar',
        idempotency: 'GW eventId + eventVersion is idempotency key',
        rules: ['HMAC signature validation', 'Guidewire schema version 10.2', 'PII not in URL'],
      },
      {
        id: 'gw_bronze',
        kind: 'Parse',
        tier: 'Bronze',
        title: 'Bronze · raw ACORD XML',
        description:
          'Faithful ACORD XML preserved. Photos and binary attachments stored separately in an Object Lock bucket; only references land in Bronze. Retention 10 years for life/annuity, 7 for P&C.',
        summary: 'ACORD XML faithful · attachments by-reference · 7-10y',
        sla: 'Land < 1s',
        engine: 'S3 Object Lock + Iceberg',
        rules: ['Object Lock Compliance Mode', 'Attachment refs only'],
        sampleIn: {
          eventId: 'GW-EVT-2026-05-17-184228',
          payload: '<ClaimsSvcRq><Claim><ClaimSysId>clm_001</ClaimSysId><LineOfBusiness>Auto</LineOfBusiness><LossDt>2026-05-15</LossDt><LossCauseCd>RearEnd</LossCauseCd><Reserve>28500</Reserve></Claim></ClaimsSvcRq>',
        },
      },
      {
        id: 'gw_silver_parse',
        kind: 'Parse',
        tier: 'Silver',
        title: 'Silver · ACORD → canonical claim/policy',
        description:
          'ACORD XML → IFCM canonical. ActionCd enums validated, LossCauseCd mapped to internal peril taxonomy, state DOI codes normalized. Bi-temporal versioning preserves endorsement history for restatement.',
        summary: 'ACORD → IFCM · peril taxonomy · bi-temporal',
        sla: 'P95 < 4s',
        engine: 'Flink + dbt',
        rules: ['ACORD ActionCd valid enum', 'LossCauseCd ∈ peril taxonomy', 'state ∈ ISO 3166-2:US'],
        code: `-- dbt · models/silver/insurance/claims.sql
SELECT
  uuid()                                                        AS claim_id_e2e,
  xpath_string(payload, '//ClaimSysId')                          AS claim_sys_id,
  xpath_string(payload, '//LineOfBusiness')                      AS line_of_business,
  CAST(xpath_string(payload, '//LossDt') AS DATE)                AS loss_dt,
  xpath_string(payload, '//LossCauseCd')                         AS loss_cause_cd,
  peril_map.peril                                                AS peril,                 -- normalized
  CAST(xpath_string(payload, '//Reserve') AS DECIMAL(18,2))      AS reserve,
  xpath_string(payload, '//State')                               AS state_cd,
  cust.mcr_id                                                    AS customer_mcr_id,
  pol.policy_id_e2e                                              AS policy_id_e2e,
  ingest_ts                                                      AS valid_time,
  current_timestamp                                              AS system_time
FROM bronze.insurance.guidewire_claim e
LEFT JOIN ref.peril_taxonomy peril_map ON xpath_string(payload,'//LossCauseCd') = peril_map.acord_cd
LEFT JOIN silver.customers.mcr cust    ON xpath_string(payload,'//Insured/PartyInfoCommonExt/ExternalId') = cust.external_id
LEFT JOIN silver.insurance.policies pol ON xpath_string(payload,'//PolicyRef') = pol.policy_sys_id`,
      },
      {
        id: 'gw_silver_recon',
        kind: 'Validate',
        tier: 'Silver',
        title: 'Silver · Reserve + bordereau reconciliation',
        description:
          'Earned ≤ written premium check, reserve adequacy triangle bounds, and reinsurance ceded reconciliation to reinsurer bordereaux (Munich Re, Swiss Re, Lloyd\'s).',
        summary: 'Triangle bounds · ceded recon · bordereau match',
        sla: 'EOD < 90 min',
        engine: 'dbt + Great Expectations',
        rules: [
          'earned_premium ≤ written_premium',
          'reserve adequacy ±5%',
          'ceded vs. bordereau ±0.1%',
        ],
      },
      {
        id: 'gw_gold',
        kind: 'Curate',
        tier: 'Gold',
        title: 'Gold · Reserves + IFRS-17 cohort cube',
        description:
          'IBNR reserve triangles per line/state/peril; IFRS-17 cohort cube with CSM/risk-adjustment per cohort. Powers MAR attestation, ORSA Summary Report, NAIC Schedule P/D.',
        summary: 'IBNR · IFRS-17 cohort · ORSA / Schedule D',
        sla: 'EOD < 2h',
        engine: 'dbt + Spark actuarial UDFs',
        rules: ['IFRS-17 cohort assignment to contract boundary', 'Schedule D investments captured'],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 5. BNY Mellon Custody → Wealth Positions
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'flow_bny',
    name: 'BNY Mellon Custody → Wealth Positions + NAV',
    subSector: 'Wealth',
    source: 'src_bny_custody',
    outcome:
      'Trusted positions and NAV tape for advisor dashboards, suitability checks (Reg BI), and IFRS-9 / CECL ALM inputs.',
    volume: '420K positions · 4.2K corporate actions / day',
    endToEndSla: 'P95 < 18 min (4× daily) · NAV cutoff 21:30 ET',
    regulatorTags: ['Reg BI', 'Form ADV', '17a-4', 'CSDR', 'BCBS 239'],
    stages: [
      {
        id: 'bny_ingest',
        kind: 'Ingest',
        tier: 'Source',
        title: 'BNY SFTP + SWIFT seev',
        description:
          'BNY drops SOD/EOD positions to a customer-owned SFTP endpoint; SWIFT seev messages stream corporate actions in real time. Hub maintains an MD5 manifest per file for integrity.',
        summary: 'SFTP + SWIFT seev · MD5 integrity',
        sla: 'File arrival window 13:00–13:30 ET',
        engine: 'AWS Transfer Family + Lambda watcher',
        rules: ['MD5 matches BNY manifest', 'File size > 0', 'No partial files'],
      },
      {
        id: 'bny_bronze',
        kind: 'Parse',
        tier: 'Bronze',
        title: 'Bronze · raw position + corp-action files',
        description:
          'Faithful positional-file preservation. Each row hashed for tamper-evidence; SWIFT seev messages preserved verbatim.',
        summary: 'Raw files · per-row hash · seev faithful',
        sla: 'Land < 90s',
        engine: 'S3 Object Lock + Iceberg',
        rules: ['Object Lock', 'Per-row SHA-256', 'No PII in filename'],
      },
      {
        id: 'bny_silver',
        kind: 'Conform',
        tier: 'Silver',
        title: 'Silver · positions canonical + tax-lot',
        description:
          'BNY position lots → canonical position with FIGI/ISIN/CUSIP resolution, FX normalization to USD intraday + EOD, fair-value level assignment (ASC 820 L1/L2/L3). Tax-lot accounting (FIFO/LIFO/Specific-ID) with wash-sale tracking.',
        summary: 'FIGI/ISIN resolution · FX · tax-lots · wash-sale',
        sla: 'P95 < 12 min',
        engine: 'dbt + Spark',
        rules: ['ISIN check digit', 'FV level assignment 100%', 'Wash-sale window 30 days'],
      },
      {
        id: 'bny_silver_recon',
        kind: 'Validate',
        tier: 'Silver',
        title: 'Silver · custodian reconciliation',
        description:
          'Internal positions vs. BNY positions per account · per security. Tolerances by asset class; breaks routed to a recon workspace with steward assignment.',
        summary: 'Internal vs. custodian · break workspace',
        sla: 'EOD < 30 min',
        engine: 'dbt + Iceberg',
        rules: ['qty match within tolerance', 'price variance within band'],
      },
      {
        id: 'bny_gold',
        kind: 'Curate',
        tier: 'Gold',
        title: 'Gold · Portfolio 360 + attribution',
        description:
          'Household → account → position roll-up with performance attribution vs. blended benchmark. Powers Advisor surfaces, Reg BI suitability, and IFRS-9 ECL inputs.',
        summary: 'Household roll-up · attribution · Reg BI suitability',
        sla: 'EOD < 90 min',
        engine: 'dbt + Spark',
        rules: ['NAV reconciliation to fund admin'],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 6. Fiserv DNA EOD — core banking ledger
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'flow_fiserv',
    name: 'Fiserv DNA EOD → Customer 360 + Call Report',
    subSector: 'Banking',
    source: 'src_fiserv_dna',
    outcome:
      'Trial-balance-clean Customer 360, deposit + loan sub-ledgers, and a regulator-ready Call Report pipeline.',
    volume: '18.4M rows / nightly · 42 GB',
    endToEndSla: 'EOD batch + Silver build < 60 min',
    regulatorTags: ['Call Report 031/041/051', 'HMDA', 'BSA', 'GLBA', 'Section 1071'],
    stages: [
      {
        id: 'fv_ingest',
        kind: 'Ingest',
        tier: 'Source',
        title: 'DNA SFTP + Debezium CDC',
        description:
          'Fiserv DNA emits a nightly EOD batch via SFTP (positional, EBCDIC for the COBOL-origin tables) plus an intraday Debezium CDC stream off the Oracle staging schema. Mainframe extracts use IBM CDC for the older copybook tables.',
        summary: 'SFTP positional + Debezium CDC',
        sla: 'File window 01:30–03:00 ET',
        engine: 'AWS Transfer Family + Debezium on MSK Connect',
        rules: ['Copybook drift check', 'Row count = manifest count'],
      },
      {
        id: 'fv_bronze',
        kind: 'Parse',
        tier: 'Bronze',
        title: 'Bronze · raw DNA extracts',
        description:
          'Faithful positional/EBCDIC tables preserved. Precisely Connect handles EBCDIC pack-decimal where applicable. 7-year retention.',
        summary: 'Positional + EBCDIC faithful · 7y',
        sla: 'Land < 8 min',
        engine: 'Precisely Connect + S3 Iceberg',
        rules: ['Object Lock', 'EBCDIC → UTF-8 with lossless audit'],
      },
      {
        id: 'fv_silver',
        kind: 'Conform',
        tier: 'Silver',
        title: 'Silver · deposit/loan sub-ledgers conformed',
        description:
          'Per-account deposit + loan sub-ledger conformed to canonical model. Trial-balance reconciliation against the core. Bi-temporal stamping for restatement.',
        summary: 'Sub-ledgers conformed · TB recon · bi-temporal',
        sla: 'P95 < 22 min',
        engine: 'dbt + Spark',
        rules: ['debits = credits', 'sub-ledger ties to GL', 'no orphan accounts'],
      },
      {
        id: 'fv_gold',
        kind: 'Curate',
        tier: 'Gold',
        title: 'Gold · Customer 360 + Call Report',
        description:
          'Customer 360 mart + the FFIEC Call Report mart (031/041/051) with source-row lineage to every line item.',
        summary: 'Customer 360 · Call Report lineage to line items',
        sla: 'EOD < 4h end-to-end',
        engine: 'dbt Cloud + Iceberg',
        rules: ['HMDA LAR completeness', 'Section 1071 critical fields'],
      },
    ],
  },
];

export type MedallionTier = 'Source' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export const tierMeta: Record<
  MedallionTier,
  { color: string; bg: string; ring: string; description: string; retention: string }
> = {
  Source: {
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-white/5',
    ring: 'ring-slate-200 dark:ring-white/10',
    description: 'External system — Hub does not store, only consumes.',
    retention: 'Per source vendor SLA',
  },
  Bronze: {
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    ring: 'ring-amber-200 dark:ring-amber-500/20',
    description: 'Faithful, immutable landing. Byte-for-byte source preservation under S3 Object Lock Compliance Mode.',
    retention: '7y BSA / SEC 17a-4 · 10y Life/Annuity · indefinite ledger',
  },
  Silver: {
    color: 'text-accent dark:text-accent-dark',
    bg: 'bg-accent-soft dark:bg-accent-dark/15',
    ring: 'ring-accent/20 dark:ring-accent-dark/30',
    description: 'Parsed · validated · deduped · entity-resolved · FX-normalized · bi-temporal canonical model.',
    retention: '7y · column lineage to Bronze',
  },
  Gold: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    ring: 'ring-emerald-200 dark:ring-emerald-500/20',
    description: 'Business-ready marts. dbt-modeled, certified, contract-backed, SLA-bound.',
    retention: '7y · column-level lineage',
  },
  Platinum: {
    color: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    ring: 'ring-violet-200 dark:ring-violet-500/20',
    description: 'Online decisioning tier. Sub-100ms feature store backed by DynamoDB / Redis / Tecton.',
    retention: 'Rolling TTL · 7-30d',
  },
};

export const stageKindColor: Record<StageKind, string> = {
  Ingest:   'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  Parse:    'bg-accent-soft text-accent dark:bg-accent-dark/20 dark:text-accent-dark',
  Validate: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Dedupe:   'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  Resolve:  'bg-accent-soft text-accent dark:bg-accent-dark/20 dark:text-accent-dark',
  Enrich:   'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  Conform:  'bg-accent-soft text-accent dark:bg-accent-dark/20 dark:text-accent-dark',
  Curate:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Publish:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Serve:    'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
};
