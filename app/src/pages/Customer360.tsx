import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, PageHeader, SimpleChart, StatusChip } from '../components/ui';
import { amlAlerts, claims, customers, transactions } from '../data';
import { Search, Sparkles } from 'lucide-react';

export function Customer360() {
  const { consumeScreenParams, setScreen } = useApp();
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string>(customers[0].id);
  const [tab, setTab] = useState<'Overview' | 'Banking' | 'Wealth' | 'Insurance' | 'Capital Markets'>('Overview');

  useEffect(() => {
    const p = consumeScreenParams();
    if (p.customerId) setSelectedId(p.customerId as string);
  }, [consumeScreenParams]);

  const customer = customers.find((c) => c.id === selectedId) ?? customers[0];
  const filtered = useMemo(
    () => (q ? customers.filter((c) => `${c.firstName} ${c.lastName} ${c.city} ${c.state}`.toLowerCase().includes(q.toLowerCase())) : customers).slice(0, 14),
    [q],
  );
  const txnHistory = useMemo(() => transactions.filter((t) => t.customerId === customer.id).slice(0, 12), [customer.id]);
  const myAml = amlAlerts.filter((a) => a.customerId === customer.id);
  const myClaims = claims.filter((c) => c.customerId === customer.id);

  const ltv = customer.ltv;
  const aum = customer.accounts.filter((a) => ['Brokerage', 'IRA', '401(k)'].includes(a.type)).reduce((s, a) => s + a.balance, 0);
  const inForcePolicies = customer.policies.filter((p) => p.status === 'In-Force');

  const balanceTrend = Array.from({ length: 12 }, (_, i) => ({
    name: `M-${11 - i}`,
    value: Math.round(ltv * (0.85 + Math.sin(i / 2) * 0.08) + i * 800),
  }));

  return (
    <div>
      <PageHeader title="Customer 360" subtitle="Household + counterparty 360 — single pane across banking, wealth, insurance, capital markets" />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3">
          <Card>
            <div className="flex items-center gap-2 input mb-3">
              <Search size={14} className="text-ink-dim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search customers…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-2 rounded-input ${
                    c.id === selectedId ? 'bg-accent/10 text-accent' : 'hover:bg-canvas-light dark:hover:bg-white/5'
                  }`}
                >
                  <div className="text-sm font-medium">{c.firstName} {c.lastName}</div>
                  <div className="text-[11px] text-ink-dim flex gap-2">
                    <span>{c.segment}</span>·<span>{c.city}, {c.state}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-9 space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{customer.firstName} {customer.lastName}</div>
                <div className="text-xs text-ink-dim mt-1 flex flex-wrap items-center gap-2">
                  <span className="id-mono">{customer.id}</span>·
                  <span>SSN {customer.ssnMasked}</span>·
                  <span>{customer.city}, {customer.state}</span>·
                  <span>DOB {customer.dob}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusChip status={customer.segment} />
                  <StatusChip status={customer.amlRisk} />
                  {customer.flags.map((f) => <span key={f} className="chip">{f}</span>)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-ink-dim">RM</div>
                <div className="text-sm font-medium">{customer.rm}</div>
                <div className="text-[11px] text-ink-dim mt-2">LTV</div>
                <div className="text-sm font-medium tabular">${ltv.toLocaleString()}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex gap-3 mb-3 border-b border-line-light dark:border-line-dark">
              {(['Overview', 'Banking', 'Wealth', 'Insurance', 'Capital Markets'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-2 pb-2 text-sm border-b-2 -mb-px ${
                    tab === t ? 'border-accent text-accent' : 'border-transparent text-ink-dim'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'Overview' && (
              <div className="grid lg:grid-cols-3 gap-4">
                <div>
                  <div className="section-title mb-2">Balance trend (12mo, tokenized)</div>
                  <SimpleChart kind="area" data={balanceTrend} height={140} />
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="text-ink-dim">AUM</div>
                    <div className="tabular">${aum.toLocaleString()}</div>
                    <div className="text-ink-dim">Active products</div>
                    <div>{customer.productsHeld.length}</div>
                    <div className="text-ink-dim">Policies in force</div>
                    <div>{inForcePolicies.length}</div>
                    <div className="text-ink-dim">Risk score</div>
                    <div>{customer.riskScore}</div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="section-title mb-2 flex items-center gap-2">
                    <Sparkles size={12} className="text-accent" /> AI summary (cited)
                  </div>
                  <div className="text-sm leading-relaxed">
                    Long-tenured {customer.segment} client with cross-domain footprint across {customer.subSectors.join(', ')}. Activity in
                    last 90 days primarily card and ACH; AML risk profile <span className="font-medium">{customer.amlRisk}</span>. {myClaims.length > 0
                      ? `Has ${myClaims.length} open claim activity — auto/home, no SIU referrals.`
                      : 'No claims activity.'}
                    Next-best-action: <span className="font-medium">review HELOC eligibility</span> (mortgage paydown trend) and confirm Reg P
                    affiliate-sharing preference.
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="chip">silver.payments.unified</span>
                    <span className="chip">gold.customer_360</span>
                    <span className="chip">silver.insurance.policies</span>
                    <span className="chip">silver.wealth.positions</span>
                  </div>
                </div>
              </div>
            )}

            {tab === 'Banking' && (
              <table className="table-grid">
                <thead>
                  <tr><th>Type</th><th>Account</th><th className="num">Balance</th><th>Opened</th><th>Status</th><th>Institution</th></tr>
                </thead>
                <tbody>
                  {customer.accounts
                    .filter((a) => ['Checking', 'Savings', 'Credit Card', 'Mortgage', 'Auto Loan', 'HELOC'].includes(a.type))
                    .map((a) => (
                      <tr key={a.id}>
                        <td>{a.type}</td>
                        <td className="id-mono">{a.numberMasked}</td>
                        <td className="num tabular">${a.balance.toLocaleString()}</td>
                        <td className="text-xs text-ink-dim">{a.openedAt}</td>
                        <td><StatusChip status={a.status} /></td>
                        <td>{a.institution}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {tab === 'Wealth' && (
              <div>
                <table className="table-grid">
                  <thead><tr><th>Type</th><th>Account</th><th className="num">Balance</th><th>Custodian</th></tr></thead>
                  <tbody>
                    {customer.accounts
                      .filter((a) => ['Brokerage', 'IRA', '401(k)', 'Annuity'].includes(a.type))
                      .map((a) => (
                        <tr key={a.id}>
                          <td>{a.type}</td>
                          <td className="id-mono">{a.numberMasked}</td>
                          <td className="num tabular">${a.balance.toLocaleString()}</td>
                          <td>{a.institution}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {customer.positions.length > 0 && (
                  <>
                    <div className="section-title mt-4 mb-2">Positions (top 12)</div>
                    <table className="table-grid">
                      <thead><tr><th>Symbol</th><th>CUSIP</th><th>FIGI</th><th className="num">Qty</th><th className="num">MV</th><th>Custodian</th></tr></thead>
                      <tbody>
                        {customer.positions.slice(0, 12).map((p) => (
                          <tr key={p.id}>
                            <td className="font-medium">{p.symbol}</td>
                            <td className="id-mono text-xs">{p.cusip}</td>
                            <td className="id-mono text-xs">{p.figi}</td>
                            <td className="num tabular">{p.qty.toLocaleString()}</td>
                            <td className="num tabular">${p.marketValue.toLocaleString()}</td>
                            <td>{p.custodian}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {tab === 'Insurance' && (
              <table className="table-grid">
                <thead><tr><th>Line</th><th>Policy</th><th className="num">Premium</th><th>Status</th><th>Inception</th><th>Carrier</th><th>Reinsurer</th></tr></thead>
                <tbody>
                  {customer.policies.map((p) => (
                    <tr key={p.id}>
                      <td>{p.line}</td>
                      <td className="id-mono">{p.policyNumberMasked}</td>
                      <td className="num tabular">${p.premium.toLocaleString()}</td>
                      <td><StatusChip status={p.status} /></td>
                      <td className="text-xs text-ink-dim">{p.inceptionDate}</td>
                      <td>{p.carrier}</td>
                      <td className="text-xs">{p.reinsurer ?? '—'}{p.cededPct ? ` (${p.cededPct}%)` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'Capital Markets' && (
              <div>
                {customer.positions.length === 0 ? (
                  <div className="text-sm text-ink-dim">No capital-markets activity for this customer.</div>
                ) : (
                  <table className="table-grid">
                    <thead><tr><th>Symbol</th><th>ISIN</th><th>Asset class</th><th className="num">MV</th><th>FV Lvl</th></tr></thead>
                    <tbody>
                      {customer.positions.map((p) => (
                        <tr key={p.id}>
                          <td className="font-medium">{p.symbol}</td>
                          <td className="id-mono text-xs">{p.isin ?? '—'}</td>
                          <td>{p.assetClass}</td>
                          <td className="num tabular">${p.marketValue.toLocaleString()}</td>
                          <td>L{p.fairValueLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </Card>

          <Card title="Recent transactions (cross-rail)" padded={false}>
            <table className="table-grid">
              <thead>
                <tr><th>Time</th><th>Rail</th><th className="num">Amount</th><th>Counterparty</th><th>MCC</th><th>Status</th></tr>
              </thead>
              <tbody>
                {txnHistory.map((t) => (
                  <tr key={t.id} className="cursor-pointer" onClick={() => setScreen('transaction-360', { txnId: t.id })}>
                    <td className="text-xs text-ink-dim">{t.timestamp}</td>
                    <td><span className="chip">{t.rail}</span></td>
                    <td className="num tabular">{t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()} {t.currency}</td>
                    <td>{t.counterparty}</td>
                    <td className="text-xs">{t.mcc ?? '—'}</td>
                    <td><StatusChip status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {(myAml.length > 0 || myClaims.length > 0) && (
            <div className="grid lg:grid-cols-2 gap-4">
              {myAml.length > 0 && (
                <Card title="AML / sanctions context">
                  {myAml.map((a) => (
                    <div key={a.id} className="p-2 rounded-input border border-line-light dark:border-line-dark mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusChip status={a.status} />
                        <span className="text-sm font-medium">{a.typology}</span>
                        <span className="text-[11px] text-ink-dim">score {a.score}</span>
                      </div>
                      <div className="text-xs text-ink-dim">{a.narrative}</div>
                    </div>
                  ))}
                </Card>
              )}
              {myClaims.length > 0 && (
                <Card title="Claim activity">
                  {myClaims.map((c) => (
                    <div key={c.id} className="p-2 rounded-input border border-line-light dark:border-line-dark mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusChip status={c.status} />
                        <span className="text-sm">{c.line} · {c.id}</span>
                        {c.siuReferred && <span className="chip">SIU</span>}
                      </div>
                      <div className="text-xs text-ink-dim">{c.cause} · reserve ${c.reserve.toLocaleString()}</div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
