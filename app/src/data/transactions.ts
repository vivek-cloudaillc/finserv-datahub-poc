import type { Trade, Transaction } from '../types';
import { customers } from './customers';

const merchants = [
  { name: 'Whole Foods Market', mcc: '5411', country: 'US' },
  { name: 'Amazon.com', mcc: '5942', country: 'US' },
  { name: 'Shell Oil', mcc: '5541', country: 'US' },
  { name: 'United Airlines', mcc: '4511', country: 'US' },
  { name: 'Marriott Hotels', mcc: '7011', country: 'US' },
  { name: 'Apple Inc.', mcc: '5732', country: 'US' },
  { name: 'Stripe Payouts', mcc: '6012', country: 'US' },
  { name: 'AT&T Wireless', mcc: '4814', country: 'US' },
  { name: 'Costco Wholesale', mcc: '5300', country: 'US' },
  { name: 'Walmart Supercenter', mcc: '5411', country: 'US' },
  { name: 'Booking.com', mcc: '7011', country: 'NL' },
  { name: 'Wise Crossborder Ltd', mcc: '6051', country: 'GB' },
];

const counterparties = [
  'Citibank N.A.',
  'JPMorgan Chase N.A.',
  'Bank of America',
  'Wells Fargo',
  'HSBC USA',
  'Deutsche Bank',
  'Barclays',
  'BNP Paribas',
  'Standard Chartered',
  'Santander',
];

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export const transactions: Transaction[] = (() => {
  const rand = seededRand(13571);
  const out: Transaction[] = [];
  for (let i = 0; i < 240; i++) {
    const customer = customers[Math.floor(rand() * customers.length)];
    const rail = pick<Transaction['rail']>(['ACH', 'Wire', 'RTP', 'FedNow', 'Card', 'Internal', 'Check', 'P2P'], rand);
    const direction: Transaction['direction'] = rand() > 0.55 ? 'Debit' : 'Credit';
    const m = pick(merchants, rand);
    const cpty = pick(counterparties, rand);
    const day = Math.floor(rand() * 17);
    const hour = Math.floor(rand() * 24);
    const min = Math.floor(rand() * 60);
    const amt =
      rail === 'Wire'
        ? Math.round(rand() * 480000 + 5000)
        : rail === 'FedNow' || rail === 'RTP'
        ? Math.round(rand() * 4800 + 50)
        : rail === 'Card'
        ? Math.round(rand() * 380 + 5)
        : Math.round(rand() * 1800 + 20);
    const status: Transaction['status'] =
      rand() > 0.95 ? 'Returned' : rand() > 0.93 ? 'Held' : rand() > 0.91 ? 'Disputed' : rand() > 0.88 ? 'Pending' : 'Posted';
    const fraudScore = rail === 'Card' ? Math.round(rand() * 100) : undefined;
    const amlFlags: string[] = [];
    if (amt > 10000 && rail !== 'Card') amlFlags.push('Threshold');
    if (m.country !== 'US' && amt > 5000) amlFlags.push('Cross-border');
    if (status === 'Held') amlFlags.push('OFAC Review');

    out.push({
      id: `txn_${i + 1}`,
      customerId: customer.id,
      account: customer.accounts[0]?.numberMasked ?? '****0000',
      rail,
      amount: direction === 'Debit' ? -amt : amt,
      currency: m.country === 'GB' ? 'GBP' : m.country === 'NL' ? 'EUR' : 'USD',
      direction,
      counterparty: rail === 'Card' ? m.name : cpty,
      counterpartyCountry: m.country,
      mcc: rail === 'Card' ? m.mcc : undefined,
      bic: rail === 'Wire' ? 'CITIUS33' : undefined,
      status,
      timestamp: `2026-05-${String(17 - day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} ET`,
      iso20022Ref: rail === 'Wire' || rail === 'FedNow' || rail === 'RTP' ? `pacs.008.001.10:${Math.floor(rand() * 1e8).toString(16).toUpperCase()}` : undefined,
      iso8583Ref: rail === 'Card' ? `0100/${Math.floor(rand() * 1e7).toString(16).toUpperCase()}` : undefined,
      fraudScore,
      amlFlags,
      geo: { city: customer.city, country: m.country },
    });
  }
  return out;
})();

const symbols = [
  { sym: 'AAPL', cusip: '037833100', figi: 'BBG000B9XRY4' },
  { sym: 'MSFT', cusip: '594918104', figi: 'BBG000BPH459' },
  { sym: 'NVDA', cusip: '67066G104', figi: 'BBG000BBJQV0' },
  { sym: 'AMZN', cusip: '023135106', figi: 'BBG000BVPV84' },
  { sym: 'GOOGL', cusip: '02079K305', figi: 'BBG009S39JX6' },
  { sym: 'JPM', cusip: '46625H100', figi: 'BBG000DMBXR2' },
  { sym: 'TSLA', cusip: '88160R101', figi: 'BBG000N9MNX3' },
  { sym: 'META', cusip: '30303M102', figi: 'BBG000MM2P62' },
];

const venues = ['NASDAQ', 'NYSE', 'ARCA', 'BATS', 'IEX'];
const desks = ['LCM Cash', 'Equity Block', 'Quant', 'PB Synthetics', 'Wealth Solutions'];
const traders = ['H. Vasquez', 'M. Goldberg', 'A. Sato', 'P. Sosa', 'D. Williamson'];

export const trades: Trade[] = (() => {
  const rand = seededRand(24681);
  const out: Trade[] = [];
  for (let i = 0; i < 160; i++) {
    const customer = customers[Math.floor(rand() * customers.length)];
    const s = pick(symbols, rand);
    const qty = Math.round(rand() * 4800 + 100);
    const price = 80 + Math.round(rand() * 360 * 100) / 100;
    const day = Math.floor(rand() * 17);
    const hour = 9 + Math.floor(rand() * 7);
    const min = Math.floor(rand() * 60);
    const surveillanceFlags: string[] = [];
    if (rand() > 0.96) surveillanceFlags.push('Layering candidate');
    if (rand() > 0.97) surveillanceFlags.push('Marking-the-close');
    out.push({
      id: `trd_${i + 1}`,
      customerId: customer.id,
      symbol: s.sym,
      cusip: s.cusip,
      figi: s.figi,
      side: pick<Trade['side']>(['Buy', 'Sell', 'Sell', 'Buy'], rand),
      qty,
      price,
      notional: Math.round(qty * price),
      venue: pick(venues, rand),
      tradeDate: `2026-05-${String(17 - day).padStart(2, '0')}`,
      settleDate: `2026-05-${String(17 - day + 1).padStart(2, '0')}`,
      execTime: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}.${String(Math.floor(rand() * 1000)).padStart(3, '0')}`,
      fixSeq: 200000 + i,
      fixClOrdId: `CLORD-${Math.floor(rand() * 1e6).toString(16).toUpperCase()}`,
      status: rand() > 0.93 ? 'Partial' : rand() > 0.96 ? 'Rejected' : 'Filled',
      desk: pick(desks, rand),
      trader: pick(traders, rand),
      bestExScore: Math.round((85 + rand() * 14) * 10) / 10,
      surveillanceFlags,
    });
  }
  return out;
})();
