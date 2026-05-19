import { Card, PageHeader, StatusChip } from '../components/ui';
import { customers } from '../data';

const matrix = [
  { role: 'Analyst',     deposits: 'read', cards: 'read-masked', trades: 'denied (MNPI)', policies: 'read',          claims: 'read',          mnpi: 'denied' },
  { role: 'Steward',     deposits: 'admin', cards: 'admin', trades: 'denied (MNPI)',   policies: 'admin',         claims: 'admin',         mnpi: 'denied' },
  { role: 'Risk',        deposits: 'read', cards: 'read', trades: 'read (masked)',    policies: 'read',          claims: 'read',          mnpi: 'read (info-barrier)' },
  { role: 'Compliance',  deposits: 'read', cards: 'read', trades: 'read',             policies: 'read',          claims: 'read',          mnpi: 'read' },
  { role: 'Underwriter', deposits: 'denied', cards: 'denied', trades: 'denied (MNPI)', policies: 'admin',        claims: 'read',          mnpi: 'denied' },
  { role: 'Advisor',     deposits: 'read', cards: 'read-masked', trades: 'read (own clients)', policies: 'denied', claims: 'denied',      mnpi: 'denied' },
  { role: 'Admin',       deposits: 'admin', cards: 'admin', trades: 'admin (audited)', policies: 'admin',        claims: 'admin',         mnpi: 'admin (audited)' },
];

const breakGlass = [
  { ts: '2026-05-16 14:22 ET', user: 'M. Wright', purpose: 'AML investigation aml_002', dataset: 'silver.payments.unified', approved: 'J. Cruz (BSA Officer)' },
  { ts: '2026-05-15 09:18 ET', user: 'H. Vasquez', purpose: 'Surveillance review sv_001', dataset: 'silver.trades.equities', approved: 'CISO' },
  { ts: '2026-05-13 11:30 ET', user: 'P. Raman', purpose: 'PCI incident post-mortem', dataset: 'bronze.cards.marqeta_auth', approved: 'Tech Risk' },
];

export function Access() {
  const sample = customers[0];
  return (
    <div>
      <PageHeader
        title="Access & Policies"
        subtitle="RBAC + ABAC + PBAC · purpose-of-use · break-glass · Section 1033 consent · HIPAA · MNPI information barriers"
      />

      <Card title="Role × Domain matrix" subtitle="Default scope before row-level filters" padded={false} className="mb-4">
        <table className="table-grid">
          <thead>
            <tr>
              <th>Role</th>
              <th>Deposits</th>
              <th>Cards (PCI)</th>
              <th>Trades (MNPI)</th>
              <th>Policies</th>
              <th>Claims</th>
              <th>MNPI overall</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((r) => (
              <tr key={r.role}>
                <td className="font-medium">{r.role}</td>
                <td className="text-xs">{r.deposits}</td>
                <td className="text-xs">{r.cards}</td>
                <td className="text-xs">{r.trades}</td>
                <td className="text-xs">{r.policies}</td>
                <td className="text-xs">{r.claims}</td>
                <td className="text-xs">{r.mnpi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card title={`Consent ledger · ${sample.firstName} ${sample.lastName}`} subtitle="Honored at query time, immutable log">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div>Section 1033 third-party share</div>
                <div className="text-[11px] text-ink-dim">FDX 6.x · revocable in real time</div>
              </div>
              <StatusChip status={sample.consent.section1033 ? 'Active' : 'Closed'} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div>Share with affiliates (Reg P)</div>
                <div className="text-[11px] text-ink-dim">Granted at account open</div>
              </div>
              <StatusChip status={sample.consent.affiliates ? 'Active' : 'Closed'} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div>Marketing communications</div>
                <div className="text-[11px] text-ink-dim">CCPA / CPRA aware</div>
              </div>
              <StatusChip status={sample.consent.marketing ? 'Active' : 'Closed'} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div>HIPAA (insurance health)</div>
                <div className="text-[11px] text-ink-dim">Required if PHI present</div>
              </div>
              <StatusChip status={sample.consent.hipaa ? 'Active' : 'Internal'} />
            </div>
          </div>
        </Card>

        <Card title="Break-glass log" subtitle="Append-only, S3 Object Lock Compliance Mode, BCBS-239 evidence-grade">
          <div className="space-y-2 text-sm">
            {breakGlass.map((b) => (
              <div key={b.ts} className="p-2 rounded-input border border-line-light dark:border-line-dark">
                <div className="text-xs id-mono">{b.ts}</div>
                <div className="text-sm">{b.user} — {b.purpose}</div>
                <div className="text-[11px] text-ink-dim">{b.dataset} · approved by {b.approved}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Information barriers (Chinese walls)">
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-input border border-line-light dark:border-line-dark">
            <div className="font-medium">Capital Markets (Sell-side)</div>
            <div className="text-xs text-ink-dim mt-1">MNPI desks only; query-time blocks for Wealth + Advisor roles</div>
          </div>
          <div className="p-3 rounded-input border border-line-light dark:border-line-dark">
            <div className="font-medium">Wealth Advisory</div>
            <div className="text-xs text-ink-dim mt-1">No trading-floor MNPI exposure; suitability data only</div>
          </div>
          <div className="p-3 rounded-input border border-line-light dark:border-line-dark">
            <div className="font-medium">Research / Banking</div>
            <div className="text-xs text-ink-dim mt-1">Reg FD safe-harbor copilot mode</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
