import { useState } from 'react';
import { Card, PageHeader, StatusChip } from '../components/ui';
import { regReports } from '../data';

export function Reporting() {
  const [selectedId, setSelectedId] = useState(regReports[0].id);
  const item = regReports.find((r) => r.id === selectedId) ?? regReports[0];

  return (
    <div>
      <PageHeader title="Regulatory Reporting" subtitle="Source-to-line-item lineage · period diff · sign-off workflow · e-file connectors" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4">
          <Card title="Report library">
            <div className="space-y-1 max-h-[640px] overflow-y-auto">
              {regReports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    r.id === selectedId ? 'bg-accent/10 border border-accent' : 'border border-transparent hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{r.name}</span>
                    <StatusChip status={r.status} />
                  </div>
                  <div className="text-[11px] text-ink-dim mt-0.5">
                    {r.regulator} · due {r.dueDate} · {r.cadence}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{item.name}</div>
                <div className="text-xs text-ink-dim mt-1">
                  Preparer {item.preparer} · approver {item.approver} · due {item.dueDate}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={item.status} />
                  <span className="chip">{item.cadence}</span>
                  <span className="chip">{item.regulator}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Line items · source-to-line lineage" padded={false}>
            <table className="table-grid">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Label</th>
                  <th className="num">Value</th>
                  <th className="num">Prior</th>
                  <th className="num">Δ</th>
                  <th className="num">Source rows</th>
                </tr>
              </thead>
              <tbody>
                {item.lineItems.map((l) => {
                  const d = l.value - l.priorValue;
                  return (
                    <tr key={l.code}>
                      <td className="id-mono text-xs">{l.code}</td>
                      <td>{l.label}</td>
                      <td className="num tabular">${l.value.toLocaleString()}</td>
                      <td className="num tabular text-ink-dim">${l.priorValue.toLocaleString()}</td>
                      <td className={`num tabular ${d >= 0 ? 'text-ok' : 'text-danger'}`}>
                        {d >= 0 ? '+' : '-'}${Math.abs(d).toLocaleString()}
                      </td>
                      <td className="num tabular">{l.lineageRows.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Sign-off workflow">
              <ul className="text-sm space-y-1">
                <li>· Preparer · {item.preparer}</li>
                <li>· Reviewer · Compliance Ops</li>
                <li>· Approver · {item.approver}</li>
                <li>· Certifier · CFO / CCO</li>
                <li>· Immutable audit log · S3 Object Lock Compliance Mode</li>
              </ul>
            </Card>
            <Card title="E-file connector">
              <ul className="text-sm space-y-1">
                <li>· FFIEC CDR · live</li>
                <li>· FinCEN BSA E-File · live</li>
                <li>· IRS FIRE / IRIS · live</li>
                <li>· NAIC Internet Filing · live</li>
                <li>· EU regulator portals · accredited filing partners</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
