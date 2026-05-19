import { Card, PageHeader, StatusChip } from '../components/ui';
import { tenants } from '../data';
import { useApp } from '../AppContext';

const users = [
  { id: 'u1', name: 'Marcus Wright', email: 'marcus@meridian.com', role: 'Steward', mfa: true, lastSeen: '2026-05-17 13:42 ET' },
  { id: 'u2', name: 'Janelle Cruz', email: 'janelle@meridian.com', role: 'Compliance', mfa: true, lastSeen: '2026-05-17 13:38 ET' },
  { id: 'u3', name: 'Henry Vasquez', email: 'henry@meridian.com', role: 'Risk', mfa: true, lastSeen: '2026-05-17 13:30 ET' },
  { id: 'u4', name: 'Carla Rodriguez', email: 'carla@meridian.com', role: 'Underwriter', mfa: true, lastSeen: '2026-05-17 13:10 ET' },
  { id: 'u5', name: 'Yuki Tanaka', email: 'yuki@meridian.com', role: 'Advisor', mfa: true, lastSeen: '2026-05-17 12:48 ET' },
  { id: 'u6', name: 'Priya Raman', email: 'priya@meridian.com', role: 'Analyst', mfa: true, lastSeen: '2026-05-17 13:55 ET' },
  { id: 'u7', name: 'Kishore Kristamsetty', email: 'kishore@infinize.ai', role: 'Admin', mfa: true, lastSeen: '2026-05-17 14:00 ET' },
];

const tokens = [
  { id: 't1', name: 'BSA Office API key', scope: 'gold.aml.workspace · read', last: '2026-05-17', expires: '2026-08-15' },
  { id: 't2', name: 'Wealth dashboard token', scope: 'gold.wealth.attribution · read', last: '2026-05-17', expires: '2026-07-30' },
  { id: 't3', name: 'BaaS partner — Lumen Pay', scope: 'gold.transaction_360 · read (filtered)', last: '2026-05-17', expires: '2026-09-01' },
];

export function Admin() {
  const { tenant, setTenant, toast } = useApp();
  return (
    <div>
      <PageHeader title="Admin Console" subtitle="Tenants · users · roles · API tokens · environment switcher · connector SDK" />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card title="Tenant" subtitle="Switch the demo tenant">
          <div className="space-y-2">
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTenant(t.name); toast(`Switched to ${t.name}`, 'info'); }}
                className={`w-full text-left p-2 rounded-input ${
                  tenant === t.name ? 'bg-accent/10 border border-accent' : 'border border-line-light dark:border-line-dark'
                }`}
              >
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-[11px] text-ink-dim">{t.type}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Environments">
          <ul className="text-sm space-y-2">
            <li className="flex items-center justify-between">Dev <StatusChip status="healthy" /></li>
            <li className="flex items-center justify-between">Test <StatusChip status="healthy" /></li>
            <li className="flex items-center justify-between">Stage <StatusChip status="healthy" /></li>
            <li className="flex items-center justify-between">Prod <StatusChip status="healthy" /></li>
            <li className="flex items-center justify-between">Demo <StatusChip status="running" /></li>
            <li className="flex items-center justify-between">PCI-scoped <StatusChip status="healthy" /></li>
            <li className="flex items-center justify-between">MNPI-scoped <StatusChip status="healthy" /></li>
          </ul>
        </Card>

        <Card title="Deployment options">
          <ul className="text-sm space-y-2">
            <li>· Infinize-hosted SaaS (default)</li>
            <li>· Customer-VPC (BYOC)</li>
            <li>· Hybrid with PCI-scoped enclave</li>
            <li>· Fully air-gapped for sovereign customers</li>
            <li>· Cloud parity: AWS · Azure · GCP</li>
          </ul>
        </Card>
      </div>

      <Card title="Users + roles" padded={false} className="mb-4">
        <table className="table-grid">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>MFA</th><th>Last seen</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td className="text-xs text-ink-dim">{u.email}</td>
                <td><span className="chip">{u.role}</span></td>
                <td>{u.mfa ? <StatusChip status="Compliant" /> : <StatusChip status="Gap" />}</td>
                <td className="text-xs text-ink-dim">{u.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="API tokens" padded={false}>
          <table className="table-grid">
            <thead><tr><th>Name</th><th>Scope</th><th>Last used</th><th>Expires</th></tr></thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-xs id-mono">{t.scope}</td>
                  <td className="text-xs text-ink-dim">{t.last}</td>
                  <td className="text-xs text-ink-dim">{t.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Connector SDK">
          <div className="text-sm space-y-2">
            <p>Define a new source in YAML — semver-versioned, breaking-change-blocked at CI, signed by the steward.</p>
            <pre className="id-mono text-[11px] bg-canvas-light dark:bg-canvas-dark p-3 rounded-input border border-line-light dark:border-line-dark overflow-x-auto">
{`source: my_custom_oms
sub_sector: capital-markets
protocol: fix-4.4
contract:
  version: 1.0.0
  schema:
    - cl_ord_id: string (required)
    - symbol: string (required)
    - side: string (1|2|5)
sensitivity: MNPI
quality:
  - fix_seq_integrity: P1
  - lei_checksum: P2
landing: s3://infinize-bronze/oms/my_custom_oms/`}
            </pre>
            <a className="text-accent underline text-xs" href="#">docs.infinize.ai/connectors →</a>
          </div>
        </Card>
      </div>
    </div>
  );
}
