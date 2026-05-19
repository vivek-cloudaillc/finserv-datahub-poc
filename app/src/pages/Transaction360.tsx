import { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { Card, Drawer, PageHeader, StatusChip } from '../components/ui';
import { customers, trades, transactions } from '../data';
import { Search } from 'lucide-react';
import type { Trade, Transaction } from '../types';

export function Transaction360() {
  const { subSector, setScreen } = useApp();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'Payments' | 'Trades'>('Payments');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const txns = useMemo(() => {
    return transactions
      .filter((t) => !q || `${t.counterparty} ${t.rail} ${t.mcc ?? ''}`.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 60);
  }, [q]);

  const tradesFiltered = useMemo(() => {
    return trades.filter((t) => !q || `${t.symbol} ${t.trader} ${t.venue} ${t.desk}`.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  }, [q]);

  const showPayments = subSector === 'All' || subSector === 'Banking';
  const showTrades = subSector === 'All' || subSector === 'Capital Markets' || subSector === 'Wealth';

  return (
    <div>
      <PageHeader
        title="Transaction & Trade 360"
        subtitle="Unified view across ACH · Wire · RTP · FedNow · Card · Equities · Fixed Income · Derivatives"
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 input max-w-md flex-1">
          <Search size={14} className="text-ink-dim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search counterparty, MCC, symbol, trader, venue…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <div className="flex rounded-input border border-line-light dark:border-line-dark overflow-hidden">
          {showPayments && (
            <button
              className={`px-3 py-1.5 text-xs ${tab === 'Payments' ? 'bg-accent text-white' : 'text-ink-dim'}`}
              onClick={() => setTab('Payments')}
            >
              Payments
            </button>
          )}
          {showTrades && (
            <button
              className={`px-3 py-1.5 text-xs ${tab === 'Trades' ? 'bg-accent text-white' : 'text-ink-dim'}`}
              onClick={() => setTab('Trades')}
            >
              Trades
            </button>
          )}
        </div>
      </div>

      {tab === 'Payments' && showPayments && (
        <Card padded={false}>
          <table className="table-grid">
            <thead>
              <tr>
                <th>Time</th>
                <th>Rail</th>
                <th>Customer</th>
                <th className="num">Amount</th>
                <th>Counterparty</th>
                <th>MCC</th>
                <th>BIC</th>
                <th>Status</th>
                <th className="num">Fraud</th>
                <th>AML flags</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => {
                const cust = customers.find((c) => c.id === t.customerId);
                return (
                  <tr key={t.id} className="cursor-pointer" onClick={() => setSelectedTxn(t)}>
                    <td className="text-xs text-ink-dim">{t.timestamp}</td>
                    <td><span className="chip">{t.rail}</span></td>
                    <td className="text-sm">{cust ? `${cust.firstName} ${cust.lastName}` : t.customerId}</td>
                    <td className="num tabular">{t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()} {t.currency}</td>
                    <td className="text-sm">{t.counterparty}</td>
                    <td className="text-xs">{t.mcc ?? '—'}</td>
                    <td className="text-xs id-mono">{t.bic ?? '—'}</td>
                    <td><StatusChip status={t.status} /></td>
                    <td className="num">{t.fraudScore ?? '—'}</td>
                    <td className="text-xs">{(t.amlFlags ?? []).map((f) => <span key={f} className="chip">{f}</span>)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'Trades' && showTrades && (
        <Card padded={false}>
          <table className="table-grid">
            <thead>
              <tr>
                <th>Trade ID</th>
                <th>Symbol</th>
                <th>CUSIP / FIGI</th>
                <th>Side</th>
                <th className="num">Qty</th>
                <th className="num">Price</th>
                <th className="num">Notional</th>
                <th>Venue</th>
                <th>Desk · Trader</th>
                <th>Status</th>
                <th>Surv.</th>
              </tr>
            </thead>
            <tbody>
              {tradesFiltered.map((t) => (
                <tr key={t.id} className="cursor-pointer" onClick={() => setSelectedTrade(t)}>
                  <td className="id-mono text-xs">{t.id}</td>
                  <td className="font-medium">{t.symbol}</td>
                  <td className="id-mono text-xs">{t.cusip} / {t.figi}</td>
                  <td>{t.side}</td>
                  <td className="num tabular">{t.qty.toLocaleString()}</td>
                  <td className="num tabular">${t.price.toFixed(2)}</td>
                  <td className="num tabular">${t.notional.toLocaleString()}</td>
                  <td>{t.venue}</td>
                  <td className="text-xs">{t.desk} · {t.trader}</td>
                  <td><StatusChip status={t.status} /></td>
                  <td className="text-xs">
                    {t.surveillanceFlags && t.surveillanceFlags.length > 0 ? (
                      t.surveillanceFlags.map((f) => <span key={f} className="chip-accent">{f}</span>)
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={!!selectedTxn} onClose={() => setSelectedTxn(null)} title={selectedTxn?.id ?? ''}>
        {selectedTxn && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-[11px] text-ink-dim">Rail</div><div>{selectedTxn.rail}</div></div>
              <div><div className="text-[11px] text-ink-dim">Amount</div><div className="tabular">${Math.abs(selectedTxn.amount).toLocaleString()} {selectedTxn.currency}</div></div>
              <div><div className="text-[11px] text-ink-dim">Counterparty</div><div>{selectedTxn.counterparty}</div></div>
              <div><div className="text-[11px] text-ink-dim">Status</div><StatusChip status={selectedTxn.status} /></div>
              <div><div className="text-[11px] text-ink-dim">ISO 20022 ref</div><div className="id-mono text-xs">{selectedTxn.iso20022Ref ?? '—'}</div></div>
              <div><div className="text-[11px] text-ink-dim">ISO 8583 ref</div><div className="id-mono text-xs">{selectedTxn.iso8583Ref ?? '—'}</div></div>
            </div>
            <div>
              <div className="section-title mb-1">Related</div>
              <ul className="text-xs space-y-1">
                <li>Customer · <button className="underline" onClick={() => { setScreen('customer-360', { customerId: selectedTxn.customerId }); setSelectedTxn(null); }}>{selectedTxn.customerId}</button></li>
                {(selectedTxn.amlFlags ?? []).map((f) => (<li key={f}>AML flag · {f}</li>))}
                {selectedTxn.fraudScore !== undefined && <li>Fraud score · {selectedTxn.fraudScore}</li>}
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer open={!!selectedTrade} onClose={() => setSelectedTrade(null)} title={selectedTrade?.id ?? ''}>
        {selectedTrade && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-[11px] text-ink-dim">Symbol · CUSIP · FIGI</div><div className="id-mono text-xs">{selectedTrade.symbol} · {selectedTrade.cusip} · {selectedTrade.figi}</div></div>
              <div><div className="text-[11px] text-ink-dim">Side / Qty</div><div className="tabular">{selectedTrade.side} {selectedTrade.qty.toLocaleString()}</div></div>
              <div><div className="text-[11px] text-ink-dim">Price / Notional</div><div className="tabular">${selectedTrade.price.toFixed(2)} / ${selectedTrade.notional.toLocaleString()}</div></div>
              <div><div className="text-[11px] text-ink-dim">Trade / Settle</div><div>{selectedTrade.tradeDate} / {selectedTrade.settleDate}</div></div>
              <div><div className="text-[11px] text-ink-dim">Venue (MIC)</div><div>{selectedTrade.venue}</div></div>
              <div><div className="text-[11px] text-ink-dim">FIX</div><div className="id-mono text-xs">seq {selectedTrade.fixSeq} · {selectedTrade.fixClOrdId}</div></div>
              <div><div className="text-[11px] text-ink-dim">Desk / Trader</div><div>{selectedTrade.desk} · {selectedTrade.trader}</div></div>
              <div><div className="text-[11px] text-ink-dim">Best-Ex score</div><div>{selectedTrade.bestExScore}</div></div>
            </div>
            {selectedTrade.surveillanceFlags && selectedTrade.surveillanceFlags.length > 0 && (
              <div>
                <div className="section-title mb-1">Surveillance flags</div>
                {selectedTrade.surveillanceFlags.map((f) => <span key={f} className="chip-accent mr-1">{f}</span>)}
              </div>
            )}
            <button className="btn-ghost" onClick={() => { setScreen('surveillance'); setSelectedTrade(null); }}>Open Surveillance</button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
