import { Card, PageHeader, StatusChip } from '../components/ui';
import { doraIncidents, tppRegister } from '../data';
import { Download } from 'lucide-react';
import { useApp } from '../AppContext';

const testCalendar = [
  { date: '2026-06-14', event: 'Tabletop · payment outage scenario', team: 'Payments · Risk · IT' },
  { date: '2026-07-22', event: 'Red team · trading floor MNPI exfil', team: 'CISO · Surveillance' },
  { date: '2026-08-30', event: 'DR · cross-region failover (multi-AZ)', team: 'SRE' },
  { date: '2026-09-12', event: 'Vendor exit test · Bloomberg failover to Refinitiv', team: 'Capital Markets · TPP' },
];

export function Dora() {
  const { toast } = useApp();
  return (
    <div>
      <PageHeader
        title="DORA Center"
        subtitle="ICT third-party register · incident classification + 4hr / 72hr / 1mo timer · resilience testing"
        actions={
          <button
            className="btn-primary"
            onClick={() => toast('Register of Information export queued (ESA template)', 'success')}
          >
            <Download size={14} /> Export Register of Information
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card title="Open ICT incidents" padded={false}>
          <table className="table-grid">
            <thead>
              <tr><th>Incident</th><th>Class.</th><th>Status</th><th>Service</th><th>4hr</th><th>72hr</th><th>1mo</th></tr>
            </thead>
            <tbody>
              {doraIncidents.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="text-sm font-medium">{i.title}</div>
                    <div className="text-[11px] text-ink-dim">{i.id} · opened {i.openedAt}</div>
                  </td>
                  <td><StatusChip status={i.classification} /></td>
                  <td><StatusChip status={i.status} /></td>
                  <td className="text-xs">{i.service}</td>
                  <td className="text-xs text-ink-dim">{i.initialNotificationDue}</td>
                  <td className="text-xs text-ink-dim">{i.intermediateDue}</td>
                  <td className="text-xs text-ink-dim">{i.finalDue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="ICT third-party register (excerpt)" padded={false}>
          <table className="table-grid">
            <thead>
              <tr><th>TPP</th><th>Service</th><th>Tier</th><th>Country</th><th>Attestations</th></tr>
            </thead>
            <tbody>
              {tppRegister.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-xs">{t.service}</td>
                  <td><StatusChip status={t.tier === 'Critical' ? 'Major' : 'Significant'} /></td>
                  <td className="text-xs">{t.country}</td>
                  <td className="text-xs">{t.soc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Resilience testing calendar">
        <table className="table-grid">
          <thead><tr><th>Date</th><th>Event</th><th>Team</th></tr></thead>
          <tbody>
            {testCalendar.map((t) => (
              <tr key={t.date}>
                <td className="text-xs text-ink-dim">{t.date}</td>
                <td>{t.event}</td>
                <td className="text-xs">{t.team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
