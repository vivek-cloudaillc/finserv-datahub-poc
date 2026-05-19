import { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, Drawer, HealthScore, PageHeader, StatusChip } from '../components/ui';
import { medallionFlows, pipelines, sources, stageKindColor, tierMeta } from '../data';
import { ArrowRight, PlusCircle, Search } from 'lucide-react';
import type { Source, SubSector } from '../types';

function matches(s: Source, q: string, sector: SubSector) {
  const hit = `${s.name} ${s.vendor} ${s.category} ${s.steward} ${s.owner} ${s.protocol}`.toLowerCase();
  const queryMatch = !q || hit.includes(q.toLowerCase());
  const sectorMatch = sector === 'All' || s.subSector === sector || s.subSector === 'Cross';
  return queryMatch && sectorMatch;
}

// Per-category ingestion snippet templates — what actually runs at the edge for this kind of source
function ingestionSnippet(s: Source): { lang: string; code: string } {
  if (s.category === 'Core Banking') {
    return {
      lang: 'yaml',
      code: `# Pipeline-as-code · ${s.id}
ingest:
  pattern: ${s.ingestionPattern}
  schedule: "${s.frequency}"
  channels:
    - kind: sftp
      host: sftp-prod.${s.vendor.toLowerCase()}.partner
      auth: ed25519 (rotated 90d via Vault Transit)
      files:
        - path: "/deposits/EOD_${'$'}{yyyymmdd}.dat"
          format: positional
          copybook: "schemas/${s.vendor}/deposits-v8.cpy"
        - path: "/loans/EOD_${'$'}{yyyymmdd}.dat"
          format: positional
          copybook: "schemas/${s.vendor}/loans-v8.cpy"
    - kind: cdc
      engine: debezium
      topic: ${s.vendor.toLowerCase()}.cdc.oracle
  ebcdic:
    decoder: precisely-connect
    audit: lossless
landing:
  bucket: s3://infinize-bronze
  prefix: core/${s.vendor.toLowerCase()}/
  object_lock: COMPLIANCE
  retention: 7y
  encryption: KMS (cmk-per-tenant)`,
    };
  }
  if (s.category === 'Card Processor') {
    return {
      lang: 'python',
      code: `# webhook · ${s.vendor} auth tap (PCI-DSS scope)
@app.post("/webhook/${s.vendor.toLowerCase()}")
def auth_webhook(req: Request):
    verify_hmac(req.headers["x-${s.vendor.toLowerCase()}-signature"], req.body)
    evt = json.loads(req.body)

    # Decision path (sub-100ms) — never blocks on Bronze persistence
    decision = score_and_decide(evt)         # feature lookup + ONNX model
    response = {"decision": decision.action, "score": decision.score}

    # Async write-behind to Bronze (preserves ISO 8583 + JSON envelope)
    kinesis.put_record(
        StreamName="bronze-cards-${s.vendor.toLowerCase()}",
        Data=encode_envelope(evt, decision),
        PartitionKey=evt["token_transaction_id"],
    )
    return response

# Bronze writer (Kinesis Firehose target) preserves raw ISO 8583
# bytes alongside the JSON envelope; PAN stays tokenized end-to-end.`,
    };
  }
  if (s.category === 'Payment Rail' && s.protocol.includes('ISO 20022')) {
    return {
      lang: 'python',
      code: `# ISO 20022 (${s.protocol}) streaming consumer
consumer = kafka.Consumer({
    "bootstrap.servers": MSK_BOOTSTRAP,
    "security.protocol": "SSL",
    "ssl.certificate.location": "/secrets/${s.vendor.toLowerCase()}.crt",
    "group.id": "infinize-${s.id}-prod",
    "enable.auto.commit": False,
})
consumer.subscribe(["${s.vendor.toLowerCase()}.pacs.008", "${s.vendor.toLowerCase()}.pacs.002"])

while True:
    msg = consumer.poll(0.5)
    if msg is None: continue
    msg_id = xpath(msg.value(), "//GrpHdr/MsgId")
    if seen_recently(msg_id):                 # dedupe at ingress
        consumer.commit(msg); continue
    s3_put_object(
        Bucket="infinize-bronze",
        Key=f"${s.landingZone.replace('s3://infinize-bronze/', '')}dt={today}/h={hour}/{msg_id}.xml",
        Body=msg.value(),
        ObjectLockMode="COMPLIANCE",
        ObjectLockRetainUntilDate=now() + timedelta(days=7*365),
    )
    consumer.commit(msg)`,
    };
  }
  if (s.category === 'Payment Rail') {
    return {
      lang: 'yaml',
      code: `# Nacha file consumer · ${s.vendor}
ingest:
  pattern: batch
  schedule: "5 windows daily (0830/1100/1330/1600/1700 ET) + same-day"
  channels:
    - kind: sftp
      host: ach-ingress.${s.vendor.toLowerCase().split(' ')[0]}.partner
      files:
        - path: "/inbound/ACH_${'$'}{window}_${'$'}{yyyymmdd}.txt"
          format: nacha
          decoder: nacha-v2024
return_handling:
  codes: [R01, R02, R03, R04, R05, R06, R07, R10, R20, R29, R51]
  policy: backfill_partition
  watermark: "5d"
landing:
  bucket: s3://infinize-bronze
  prefix: ${s.landingZone.replace('s3://infinize-bronze/', '')}
  object_lock: COMPLIANCE
  retention: 7y`,
    };
  }
  if (s.category === 'OMS' || s.category === 'EMS') {
    return {
      lang: 'java',
      code: `// QuickFIX/J consumer · ${s.vendor} (${s.protocol})
public class ${s.vendor.replace(/ /g, '')}FixApp extends ApplicationAdapter {
  @Override
  public void fromApp(Message msg, SessionID id) throws ... {
    String msgType = msg.getHeader().getString(MsgType.FIELD);

    // Idempotency: (SenderCompID, TargetCompID, MsgSeqNum) is unique per session/day
    String idemKey = key(id, msg.getHeader().getInt(MsgSeqNum.FIELD));
    if (seenRecently(idemKey)) return;

    // Raw FIX preserved for 17a-4 — bytes faithful, SOH normalized in display only
    bronzeWriter.write("bronze/oms/${s.vendor.toLowerCase()}/" +
                       today() + "/" + idemKey + ".fix", msg.toString());

    // Hot path: parse and forward to Flink for surveillance + best-ex scoring
    TradeEvent ev = FixDecoder.toCanonical(msg);
    silverEmitter.emit(ev);
  }

  @Override
  public void onLogon(SessionID id) {
    // Detect seq gaps; auto-issue ResendRequest on FIX session
    Session.lookupSession(id).logon();
  }
}`,
    };
  }
  if (s.category === 'KYC/IDV' || s.category === 'Sanctions') {
    return {
      lang: 'yaml',
      code: `# ${s.vendor} ${s.category} feed
ingest:
  pattern: ${s.ingestionPattern}
  channels:
    - kind: webhook
      endpoint: /webhook/${s.vendor.toLowerCase()}
      auth: hmac-sha256
      retries: 3 (vendor) · idempotent on event_id
    - kind: rest_pull
      schedule: "${s.frequency}"
      endpoint: https://api.${s.vendor.toLowerCase()}.com/v1/cases
sensitivity: ${s.sensitivity}
quality:
  - rule: confidence_in_range
    on_fail: quarantine_low_confidence
landing:
  bucket: s3://infinize-bronze
  prefix: ${s.landingZone.replace('s3://infinize-bronze/', '')}
  retention: 7y`,
    };
  }
  if (s.category === 'Policy Admin' || s.category === 'Claims') {
    return {
      lang: 'python',
      code: `# Guidewire ${s.category} consumer — REST webhooks + JMS
@app.post("/webhook/guidewire/${s.category.toLowerCase().replace(' ', '-')}")
def gw_event(req: Request):
    verify_hmac(req.headers["x-gw-signature"], req.body)
    event = json.loads(req.body)

    # Idempotency · GW eventId + eventVersion
    idem_key = f"{event['eventId']}-{event['eventVersion']}"
    if seen_recently(idem_key): return {"ok": True}

    # ACORD XML body preserved faithful; attachments stored by reference only
    s3.put_object(
        Bucket="infinize-bronze",
        Key=f"{s.landingZone.replace('s3://infinize-bronze/', '')}/dt={today}/{idem_key}.xml",
        Body=event["payload"],
        ObjectLockMode="COMPLIANCE",
    )
    if event.get("attachments"):
        # Photos / docs → separate Object-Lock bucket
        register_attachments(event["attachments"], idem_key)

    return {"ok": True}`,
    };
  }
  if (s.category === 'Market Data') {
    return {
      lang: 'cpp',
      code: `// ${s.vendor} ${s.protocol} subscription (ticker plant)
// Tick volumes require near-zero-copy; we run a dedicated AZ-local pod.
TickPlant plant(KMS_CMK_TENANT);
plant.subscribe({"AAPL US Equity", "MSFT US Equity", /* ... */});
plant.on_tick([](const Tick& t) {
  // Persist downsampled snapshots to Bronze; full ticks to a separate
  // tick-store for surveillance look-back.
  bronze_snapshot.write(t);
  surveillance_tape.append(t);
});
// MNPI handling: this feed is non-MNPI by license; MNPI trade flow is on the
// Charles River OMS feed which lives behind information barriers.`,
    };
  }
  if (s.category === 'Custody' || s.category === 'Fund Admin') {
    return {
      lang: 'yaml',
      code: `# ${s.vendor} custody · SFTP + SWIFT seev streaming
ingest:
  pattern: ${s.ingestionPattern}
  channels:
    - kind: sftp
      host: sftp.${s.vendor.toLowerCase().split(' ')[0]}.custody
      files:
        - path: "/positions/SOD_${'$'}{yyyymmdd}.dat"
          format: positional
        - path: "/cash/CASH_${'$'}{yyyymmdd}.dat"
          format: positional
    - kind: swift_seev
      messages: ["seev.031","seev.032","seev.033","seev.039"]
      use: corporate_actions
landing:
  bucket: s3://infinize-bronze
  prefix: ${s.landingZone.replace('s3://infinize-bronze/', '')}
  retention: 7y
  integrity: per_row_sha256 + vendor_manifest_md5`,
    };
  }
  if (s.category === 'Aggregation') {
    return {
      lang: 'python',
      code: `# ${s.vendor} aggregation · API pull + item-disconnect webhook
def hourly_sync():
    for item in items.list(active=True):
        try:
            txns = plaid.transactions_sync(access_token=item.access_token, cursor=item.cursor)
            bronze.write(f"aggregation/${s.vendor.toLowerCase()}/items/{item.id}/", txns)
            item.update(cursor=txns.next_cursor)
        except plaid.ItemError as e:
            # ITEM_LOGIN_REQUIRED → re-auth funnel
            if e.code == "ITEM_LOGIN_REQUIRED":
                queue_reauth(item.user_mcr_id, item.id)

@app.post("/webhook/${s.vendor.toLowerCase()}")
def plaid_webhook(req: Request):
    # New transactions / pending updates / disconnect events
    enqueue_sync(req.json()["item_id"])`,
    };
  }
  if (s.category === 'Wealth Platform') {
    return {
      lang: 'yaml',
      code: `# ${s.vendor} wealth · API + nightly SFTP reconciliation
ingest:
  pattern: ${s.ingestionPattern}
  channels:
    - kind: rest_pull
      endpoint: https://api.${s.vendor.toLowerCase()}.com/v3
      auth: oauth2.1
      paths: ["/households","/accounts","/positions","/transactions","/performance"]
      schedule: "${s.frequency}"
    - kind: sftp
      host: sftp.${s.vendor.toLowerCase()}.partner
      files:
        - path: "/eod_recon/positions_${'$'}{yyyymmdd}.csv"
          purpose: nightly_recon_vs_custodian
landing:
  bucket: s3://infinize-bronze
  prefix: ${s.landingZone.replace('s3://infinize-bronze/', '')}`,
    };
  }
  if (s.category === 'CRM' || s.category === 'ERP') {
    return {
      lang: 'yaml',
      code: `# ${s.vendor} ${s.category} · ${s.protocol}
ingest:
  pattern: ${s.ingestionPattern}
  channels:
    - kind: rest_pull
      mode: bulk_api_2
      auth: oauth2.1
      schedule: "nightly bulk + intraday CDC events"
    - kind: streaming_events
      topics: ["AccountChangeEvent","ContactChangeEvent","OpportunityChangeEvent"]
landing:
  bucket: s3://infinize-bronze
  prefix: ${s.landingZone.replace('s3://infinize-bronze/', '')}`,
    };
  }
  // Default
  return {
    lang: 'yaml',
    code: `# Pipeline-as-code · ${s.id}
ingest:
  pattern: ${s.ingestionPattern}
  protocol: ${s.protocol}
  schedule: "${s.frequency}"
landing:
  bucket: s3://infinize-bronze
  prefix: ${s.landingZone.replace('s3://infinize-bronze/', '')}
  object_lock: COMPLIANCE
  retention: 7y`,
  };
}

export function SourceCatalog() {
  const { subSector, setScreen } = useApp();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Source | null>(null);

  const filtered = useMemo(() => sources.filter((s) => matches(s, q, subSector)), [q, subSector]);

  // Aggregate by category for a quick health sweep
  const byCategory = useMemo(() => {
    const map: Record<string, { count: number; healthy: number; warn: number; failed: number }> = {};
    filtered.forEach((s) => {
      const c = s.category;
      if (!map[c]) map[c] = { count: 0, healthy: 0, warn: 0, failed: 0 };
      map[c].count += 1;
      if (s.status === 'healthy') map[c].healthy += 1;
      if (s.status === 'warning') map[c].warn += 1;
      if (s.status === 'failed') map[c].failed += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [filtered]);

  const downstreamPipelinesFor = (s: Source) => pipelines.filter((p) => p.source === s.id);
  const flowFor = (s: Source) => medallionFlows.find((f) => f.source === s.id);

  return (
    <div>
      <PageHeader
        title="Source Catalog"
        subtitle="Every connected source — owner, technical steward, sensitivity tier, regulator tag, ingestion pattern. Click a source for the full flow into Bronze and the canonical FinServ medallion mapping."
        actions={
          <button className="btn-primary" onClick={() => setScreen('add-source')}>
            <PlusCircle size={14} /> Add source
          </button>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md flex items-center gap-2 input">
          <Search size={14} className="text-ink-dim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, vendor, category, steward…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="text-xs text-ink-dim">
          {filtered.length} of {sources.length} sources · sub-sector: {subSector}
        </div>
      </div>

      {/* Category health sweep */}
      <Card title="Health sweep by category" subtitle="Where the Hub is meeting SLA today" padded={false} className="mb-4">
        <table className="table-grid">
          <thead><tr><th>Category</th><th className="num">Sources</th><th className="num">Healthy</th><th className="num">Warning</th><th className="num">Failed</th></tr></thead>
          <tbody>
            {byCategory.map(([cat, m]) => (
              <tr key={cat}>
                <td>{cat}</td>
                <td className="num">{m.count}</td>
                <td className="num text-ok">{m.healthy}</td>
                <td className={`num ${m.warn > 0 ? 'text-warn' : ''}`}>{m.warn}</td>
                <td className={`num ${m.failed > 0 ? 'text-danger' : ''}`}>{m.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card padded={false}>
        <table className="table-grid">
          <thead>
            <tr>
              <th>Name</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Sub-sector</th>
              <th>Protocol</th>
              <th>Sensitivity</th>
              <th>Frequency</th>
              <th>Health</th>
              <th>Last run</th>
              <th>Steward</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="cursor-pointer" onClick={() => setSelected(s)}>
                <td>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-[11px] text-ink-dim">{s.id}</div>
                </td>
                <td>{s.vendor}</td>
                <td>{s.category}</td>
                <td><span className="chip">{s.subSector}</span></td>
                <td className="text-xs text-ink-dim">{s.protocol}</td>
                <td><StatusChip status={s.sensitivity} /></td>
                <td className="text-xs text-ink-dim">{s.frequency}</td>
                <td><HealthScore value={s.healthScore} /></td>
                <td className="text-xs text-ink-dim">{s.lastRun}</td>
                <td>{s.steward}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? 'Source'} width="w-[760px]">
        {selected && (() => {
          const snippet = ingestionSnippet(selected);
          const dpipes = downstreamPipelinesFor(selected);
          const flow = flowFor(selected);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-[11px] text-ink-dim">Vendor</div><div>{selected.vendor}</div></div>
                <div><div className="text-[11px] text-ink-dim">Schema version</div><div className="id-mono">{selected.schemaVersion}</div></div>
                <div><div className="text-[11px] text-ink-dim">Owner</div><div>{selected.owner}</div></div>
                <div><div className="text-[11px] text-ink-dim">Steward</div><div>{selected.steward}</div></div>
                <div><div className="text-[11px] text-ink-dim">Ingestion pattern</div><div>{selected.ingestionPattern}</div></div>
                <div><div className="text-[11px] text-ink-dim">Volume / day</div><div>{selected.volumePerDay}</div></div>
                <div><div className="text-[11px] text-ink-dim">Sensitivity</div><div><StatusChip status={selected.sensitivity} /></div></div>
                <div><div className="text-[11px] text-ink-dim">Health score</div><div><HealthScore value={selected.healthScore} /></div></div>
              </div>

              <div>
                <div className="text-[11px] text-ink-dim mb-1">Bronze landing zone (S3 Object Lock Compliance Mode)</div>
                <div className="id-mono p-2 rounded-input bg-canvas-light dark:bg-canvas-dark border border-line-light dark:border-line-dark text-xs break-all">
                  {selected.landingZone}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-ink-dim mb-1">Common pitfalls — Hub-handled</div>
                <div className="text-sm">{selected.pitfalls}</div>
              </div>

              <div>
                <div className="text-[11px] text-ink-dim mb-1">Regulator tags</div>
                <div className="flex flex-wrap gap-1">
                  {selected.regulatorTags.length > 0 ? (
                    selected.regulatorTags.map((t) => <span key={t} className="chip">{t}</span>)
                  ) : <span className="text-xs text-ink-dim">None directly</span>}
                </div>
              </div>

              <div>
                <div className="section-title mb-2">Ingestion code (pipeline-as-code)</div>
                <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto whitespace-pre">
                  {snippet.code}
                </pre>
                <div className="text-[10px] text-ink-dim mt-1">
                  Stored in source control · semver-versioned · breaking-change-blocked at CI · signed by {selected.steward}
                </div>
              </div>

              {flow && (
                <div>
                  <div className="section-title mb-2">Medallion flow this source feeds</div>
                  <div className="card p-3">
                    <div className="text-sm font-medium mb-2">{flow.name}</div>
                    <div className="overflow-x-auto pb-1">
                      <div className="flex items-center gap-1.5 min-w-max">
                        {flow.stages.map((s, i) => (
                          <div key={s.id} className="flex items-center gap-1.5">
                            <div className="w-[110px] p-1.5 rounded-input border border-line-light dark:border-line-dark bg-canvas-light dark:bg-canvas-dark">
                              <div className="flex items-center gap-1 mb-1">
                                <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-chip ${tierMeta[s.tier].bg} ${tierMeta[s.tier].color}`}>{s.tier}</span>
                                <span className={`text-[9px] px-1 py-0.5 rounded-chip ${stageKindColor[s.kind]}`}>{s.kind}</span>
                              </div>
                              <div className="text-[10px] font-medium leading-tight line-clamp-2">{s.title}</div>
                            </div>
                            {i < flow.stages.length - 1 && <ArrowRight size={11} className="text-ink-dim flex-shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dpipes.length > 0 && (
                <div>
                  <div className="section-title mb-2">Downstream pipelines ({dpipes.length})</div>
                  <div className="space-y-1">
                    {dpipes.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setScreen('pipelines', { pipelineId: p.id })}
                        className="w-full text-left p-2 rounded-input border border-line-light dark:border-line-dark hover:border-accent flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-medium">{p.name}</div>
                          <div className="text-[11px] text-ink-dim">{p.pattern} · {p.tier} · {p.p95Latency} · DLQ {p.dlq}</div>
                        </div>
                        <StatusChip status={p.status} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button className="btn-ghost" onClick={() => setScreen('pipelines', { source: selected.id })}>
                  Open pipelines
                </button>
                <button className="btn-ghost" onClick={() => setScreen('medallion')}>
                  Open medallion flow
                </button>
                <button className="btn-primary" onClick={() => setScreen('quality')}>
                  Quality rules
                </button>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
}
