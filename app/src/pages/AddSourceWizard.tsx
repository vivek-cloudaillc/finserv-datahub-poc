import { useState } from 'react';
import { useApp } from '../AppContext';
import { Card, PageHeader, StatusChip } from '../components/ui';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const steps = [
  'Type',
  'Sub-Sector',
  'Protocol',
  'Credentials',
  'Schema Map',
  'Sensitivity',
  'Quality Rules',
  'Lineage Tags',
  'Review',
];

const sourceTypes = [
  { id: 'core', label: 'Core Banking', examples: 'Fiserv DNA · Jack Henry · FIS · Finastra · Temenos' },
  { id: 'cards', label: 'Card Processor', examples: 'Marqeta · Stripe Issuing · Fiserv · Galileo' },
  { id: 'rails', label: 'Payment Rail', examples: 'ACH · Wire · RTP · FedNow · SEPA · UPI' },
  { id: 'kyc', label: 'KYC / IDV', examples: 'Persona · Alloy · Socure · Jumio · Onfido' },
  { id: 'sanc', label: 'Sanctions / PEP / Adverse Media', examples: 'OFAC · Dow Jones · LexisNexis · ComplyAdvantage' },
  { id: 'agg', label: 'Open Banking Aggregation', examples: 'Plaid · MX · Finicity · Akoya · Yodlee' },
  { id: 'oms', label: 'OMS / EMS / FIX', examples: 'Charles River · Bloomberg AIM · EMSX · FlexTrade' },
  { id: 'mkt', label: 'Market Data', examples: 'Bloomberg B-PIPE · Refinitiv RDP · ICE · CME MDP' },
  { id: 'cust', label: 'Custody / Fund Admin', examples: 'BNY · State Street · Northern Trust · Pershing' },
  { id: 'pol', label: 'Policy / Claims Admin', examples: 'Guidewire · Duck Creek · Majesco · Insurity · Sapiens' },
  { id: 'uw', label: 'Underwriting / Cat-Modeling', examples: 'Verisk · RMS · AIR · Cape Analytics' },
  { id: 'wlt', label: 'Wealth Platform', examples: 'Envestnet · Orion · Addepar · Black Diamond' },
  { id: 'crm', label: 'CRM / ERP / Analytics', examples: 'Salesforce FSC · Workday · D365 · Amplitude' },
];

const protocols = [
  'SFTP file drop',
  'JDBC pull',
  'REST API',
  'Webhook (EventBridge)',
  'Streaming (Kinesis / Confluent)',
  'CDC (Debezium / GoldenGate / DMS)',
  'FIX 4.2 / 4.4 / 5.0 SP2',
  'ISO 20022 message bus',
  'ISO 8583 listener',
  'ACORD XML / AL3',
  'HL7 FHIR (R4/R5)',
  'Mainframe (z/OS · IBM CDC / Precisely Connect)',
];

const sensitivityTiers = [
  { id: 'NPI', label: 'NPI · GLBA-scoped' },
  { id: 'PCI', label: 'PCI · cardholder data' },
  { id: 'PHI', label: 'PHI · HIPAA-scoped (insurance health)' },
  { id: 'MNPI', label: 'MNPI · sell-side / IB advisory' },
  { id: 'Confidential', label: 'Confidential' },
  { id: 'Internal', label: 'Internal' },
  { id: 'Public', label: 'Public' },
];

interface QualityRule {
  id: string;
  label: string;
}
const qrLibrary: QualityRule[] = [
  { id: 'bic', label: 'BIC valid against SWIFTRef' },
  { id: 'aba', label: 'ABA routing checksum' },
  { id: 'lei', label: 'LEI checksum (ISO 17442)' },
  { id: 'isin', label: 'ISIN check digit' },
  { id: 'cusip', label: 'CUSIP check digit' },
  { id: 'acord', label: 'ACORD ActionCd enum valid' },
  { id: 'mcc', label: 'MCC populated for cleared auths' },
  { id: 'nacha', label: 'Amount within Nacha PPD/CCD/IAT limits' },
  { id: 'fix-seq', label: 'FIX session sequence integrity' },
  { id: 'ofac', label: 'OFAC FP rate within band 3–6%' },
  { id: 'mcr', label: 'MCR collisions resolved within 1h' },
];

export function AddSourceWizard() {
  const { toast } = useApp();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [subSector, setSubSector] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState<string>('NPI');
  const [selectedRules, setSelectedRules] = useState<string[]>(['ofac', 'mcr']);
  const [tags, setTags] = useState<string>('BSA, GLBA');
  const [credentialsKind, setCredentialsKind] = useState('OAuth 2.1');

  const canNext = () => {
    if (step === 0) return !!type;
    if (step === 1) return !!subSector;
    if (step === 2) return !!protocol;
    return true;
  };

  return (
    <div>
      <PageHeader title="Add Source" subtitle="9-step onboarding wizard — every step has a data contract by the end." />

      <div className="card p-4 mb-5">
        {/* Header row · current step label + counter + progress bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {step + 1}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{steps[step]}</div>
              <div className="text-[11px] text-ink-dim">Step {step + 1} of {steps.length}</div>
            </div>
          </div>
          <div className="text-[11px] text-ink-dim hidden sm:block">
            {Math.round(((step + 1) / steps.length) * 100)}% complete
          </div>
        </div>

        {/* Progress bar (always fits, never clips) */}
        <div className="h-1.5 rounded-full bg-line-light dark:bg-line-dark overflow-hidden mb-3">
          <div
            className="h-full bg-accent transition-all duration-200 ease-out-soft"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step pills — wrap to multiple rows on narrow widths */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <button
                key={s}
                type="button"
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-input border text-[11px] transition-colors ${
                  active
                    ? 'border-accent bg-accent text-white font-medium'
                    : done
                    ? 'border-ok/40 bg-ok/10 text-ok hover:bg-ok/15'
                    : 'border-line-light dark:border-line-dark text-ink-dim opacity-70'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 ${
                    active ? 'bg-white text-accent' : done ? 'bg-ok text-white' : 'bg-canvas-light dark:bg-canvas-dark border border-current'
                  }`}
                >
                  {done ? <Check size={9} /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{s}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Card>
        {step === 0 && (
          <div>
            <div className="text-sm font-medium mb-3">Pick a source type</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sourceTypes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setType(st.id)}
                  className={`text-left p-3 rounded-input border transition-colors ${
                    type === st.id
                      ? 'border-accent bg-accent/5'
                      : 'border-line-light dark:border-line-dark hover:border-accent'
                  }`}
                >
                  <div className="font-medium text-sm">{st.label}</div>
                  <div className="text-[11px] text-ink-dim mt-1">{st.examples}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="text-sm font-medium mb-3">Which sub-sector does this source serve?</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {['Banking', 'Capital Markets', 'Insurance', 'Wealth', 'Cross'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSubSector(s)}
                  className={`p-3 rounded-input border ${
                    subSector === s ? 'border-accent bg-accent/5' : 'border-line-light dark:border-line-dark hover:border-accent'
                  }`}
                >
                  <div className="text-sm font-medium">{s}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-sm font-medium mb-3">Pick a protocol</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {protocols.map((p) => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  className={`text-left p-3 rounded-input border ${
                    protocol === p
                      ? 'border-accent bg-accent/5'
                      : 'border-line-light dark:border-line-dark hover:border-accent'
                  }`}
                >
                  <div className="text-sm">{p}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Credentials</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['OAuth 2.1', 'mTLS', 'API Key', 'AWS IAM Roles Anywhere', 'SFTP key', 'JWT (signed)'].map((k) => (
                <button
                  key={k}
                  onClick={() => setCredentialsKind(k)}
                  className={`p-3 rounded-input border ${
                    credentialsKind === k
                      ? 'border-accent bg-accent/5'
                      : 'border-line-light dark:border-line-dark hover:border-accent'
                  }`}
                >
                  <div className="text-sm font-medium">{k}</div>
                </button>
              ))}
            </div>
            <div className="text-[11px] text-ink-dim">
              All secrets persisted in HashiCorp Vault Transit · KMS CMK per tenant · rotation policy 90d
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Schema map · canonical model</div>
            <div className="card p-3">
              <table className="table-grid">
                <thead>
                  <tr>
                    <th>Source field</th>
                    <th>Type</th>
                    <th>Maps to (IFCM)</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="id-mono">customerId</td>
                    <td>string</td>
                    <td className="id-mono">mcr_id</td>
                    <td className="text-xs text-ink-dim">Entity-resolved to Master Customer Record</td>
                  </tr>
                  <tr>
                    <td className="id-mono">txnAmount</td>
                    <td>decimal</td>
                    <td className="id-mono">amount_usd</td>
                    <td className="text-xs text-ink-dim">FX-normalized at posting time</td>
                  </tr>
                  <tr>
                    <td className="id-mono">postedAt</td>
                    <td>timestamp</td>
                    <td className="id-mono">posted_at</td>
                    <td className="text-xs text-ink-dim">Bi-temporal: valid + system time</td>
                  </tr>
                  <tr>
                    <td className="id-mono">counterpartyBic</td>
                    <td>string</td>
                    <td className="id-mono">counterparty_bic</td>
                    <td className="text-xs text-ink-dim">Validated against SWIFTRef</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="text-sm font-medium mb-3">Sensitivity classification</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sensitivityTiers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSensitivity(t.id)}
                  className={`text-left p-3 rounded-input border ${
                    sensitivity === t.id
                      ? 'border-accent bg-accent/5'
                      : 'border-line-light dark:border-line-dark hover:border-accent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusChip status={t.id} />
                    <div className="text-sm font-medium">{t.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <div className="text-sm font-medium mb-3">Quality rules to attach</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {qrLibrary.map((r) => {
                const on = selectedRules.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() =>
                      setSelectedRules((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))
                    }
                    className={`text-left p-3 rounded-input border flex items-start gap-2 ${
                      on
                        ? 'border-accent bg-accent/5'
                        : 'border-line-light dark:border-line-dark hover:border-accent'
                    }`}
                  >
                    <div
                      className={`mt-1 w-3.5 h-3.5 rounded-sm border flex-shrink-0 ${
                        on
                          ? 'bg-accent border-accent'
                          : 'border-line-light dark:border-line-dark'
                      }`}
                    />
                    <div className="text-sm">{r.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Lineage / regulator tags</div>
            <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
            <div className="text-[11px] text-ink-dim">
              Examples · BSA · GLBA · PCI · MNPI · MiFID-Reportable · ACORD-line-Auto · CAT · Section 1033
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Review</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="text-ink-dim">Type:</span> {type}</div>
              <div><span className="text-ink-dim">Sub-sector:</span> {subSector}</div>
              <div><span className="text-ink-dim">Protocol:</span> {protocol}</div>
              <div><span className="text-ink-dim">Credentials:</span> {credentialsKind}</div>
              <div><span className="text-ink-dim">Sensitivity:</span> <StatusChip status={sensitivity} /></div>
              <div><span className="text-ink-dim">Rules:</span> {selectedRules.length} attached</div>
              <div className="md:col-span-2"><span className="text-ink-dim">Tags:</span> {tags}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-5 mt-4 border-t border-line-light dark:border-line-dark">
          <button
            className="btn-ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft size={14} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button
              className="btn-primary disabled:opacity-50"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => toast('Source contract draft saved — pending steward approval', 'success')}
            >
              <Check size={14} /> Submit for approval
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
