import type { Account, Customer, Policy, Position } from '../types';

const firstNames = [
  'Aiden', 'Maya', 'Marcus', 'Priya', 'Daniel', 'Sofia', 'James', 'Emma', 'Liam', 'Olivia',
  'Noah', 'Ava', 'Ethan', 'Isabella', 'Lucas', 'Mia', 'Logan', 'Charlotte', 'Mason', 'Amelia',
  'Henry', 'Harper', 'Sebastian', 'Evelyn', 'Caleb', 'Abigail', 'Owen', 'Emily', 'Wyatt', 'Elizabeth',
  'Jack', 'Sofia', 'Luke', 'Avery', 'Carter', 'Ella', 'Hudson', 'Scarlett', 'Levi', 'Grace',
  'Julian', 'Chloe', 'Ezra', 'Camila', 'Diego', 'Aria', 'Maverick', 'Layla', 'Aaron', 'Lily',
  'Theo', 'Riley', 'Adrian', 'Zoe', 'Anthony', 'Penelope', 'Cameron', 'Nora', 'Asher', 'Hazel',
  'Cooper', 'Aurora', 'Easton', 'Stella', 'Brayden', 'Violet', 'Hunter', 'Hannah', 'Roman', 'Ellie',
  'Greyson', 'Paisley', 'Ezekiel', 'Leah', 'Xavier', 'Lillian', 'Christian', 'Addison', 'Jaxon', 'Eliana',
];

const lastNames = [
  'Patel', 'Chen', 'Rodriguez', 'Okonkwo', 'Vasquez', 'Tanaka', 'Cruz', 'Wright', 'Park', 'Raman',
  'Nguyen', 'Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright',
  'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell',
  'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart',
  'Sanchez', 'Morris', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper',
  'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson',
];

const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN'];
const cities: Record<string, string[]> = {
  NY: ['New York', 'Buffalo', 'Rochester'],
  CA: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
  TX: ['Houston', 'Dallas', 'Austin', 'San Antonio'],
  FL: ['Miami', 'Tampa', 'Orlando', 'Jacksonville'],
  IL: ['Chicago', 'Aurora', 'Naperville'],
  PA: ['Philadelphia', 'Pittsburgh'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati'],
  GA: ['Atlanta', 'Savannah'],
  NC: ['Charlotte', 'Raleigh'],
  MI: ['Detroit', 'Grand Rapids'],
  NJ: ['Newark', 'Jersey City', 'Princeton'],
  VA: ['Richmond', 'Arlington'],
  WA: ['Seattle', 'Spokane'],
  AZ: ['Phoenix', 'Tucson'],
  MA: ['Boston', 'Cambridge'],
  TN: ['Nashville', 'Memphis'],
};

const rms = ['Marcus Wright', 'Aisha Patel', 'Yuki Tanaka', 'Carla Rodriguez', 'Henry Vasquez', 'Priya Raman'];
const segments: Customer['segment'][] = ['Mass', 'Mass', 'Mass', 'Affluent', 'Affluent', 'HNW', 'HNW', 'UHNW', 'Commercial', 'Institutional'];

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

function maskSsn(rand: () => number) {
  return `***-**-${String(Math.floor(rand() * 9000) + 1000)}`;
}

function maskAccount(rand: () => number, len = 4) {
  return `****${String(Math.floor(rand() * 9000) + 1000)}`.padStart(4 + len, '*');
}

function maskPolicy(rand: () => number) {
  return `POL-****-${String(Math.floor(rand() * 9000) + 1000)}`;
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildAccounts(rand: () => number, segment: Customer['segment']): Account[] {
  const list: Account[] = [];
  const hasChecking = rand() > 0.05;
  const hasSavings = rand() > 0.3;
  const hasCard = rand() > 0.15;
  const hasMortgage = rand() > 0.6;
  const hasAuto = rand() > 0.7;
  const hasBrokerage = segment === 'Affluent' || segment === 'HNW' || segment === 'UHNW' || rand() > 0.6;
  const hasIra = rand() > 0.5;

  let idx = 1;
  if (hasChecking) {
    list.push({
      id: `a${idx++}`,
      type: 'Checking',
      numberMasked: maskAccount(rand, 4),
      balance: Math.round(rand() * (segment === 'UHNW' ? 850000 : segment === 'HNW' ? 220000 : 18000)),
      openedAt: ymd(2018 + Math.floor(rand() * 6), 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      status: 'Active',
      institution: 'Meridian Bank',
    });
  }
  if (hasSavings) {
    list.push({
      id: `a${idx++}`,
      type: 'Savings',
      numberMasked: maskAccount(rand, 4),
      balance: Math.round(rand() * (segment === 'UHNW' ? 1800000 : segment === 'HNW' ? 480000 : 42000)),
      openedAt: ymd(2018 + Math.floor(rand() * 6), 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      status: 'Active',
      institution: 'Meridian Bank',
    });
  }
  if (hasCard) {
    list.push({
      id: `a${idx++}`,
      type: 'Credit Card',
      numberMasked: `4111 **** **** ${String(Math.floor(rand() * 9000) + 1000)}`,
      balance: -Math.round(rand() * 18000),
      openedAt: ymd(2019 + Math.floor(rand() * 5), 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      status: rand() > 0.95 ? 'Delinquent' : 'Active',
      institution: 'Meridian Card (Marqeta-issued)',
    });
  }
  if (hasMortgage) {
    list.push({
      id: `a${idx++}`,
      type: 'Mortgage',
      numberMasked: maskAccount(rand, 6),
      balance: -Math.round(rand() * 850000),
      openedAt: ymd(2015 + Math.floor(rand() * 8), 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      status: 'Active',
      institution: 'Meridian Mortgage',
    });
  }
  if (hasAuto) {
    list.push({
      id: `a${idx++}`,
      type: 'Auto Loan',
      numberMasked: maskAccount(rand, 6),
      balance: -Math.round(rand() * 48000),
      openedAt: ymd(2020 + Math.floor(rand() * 5), 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      status: 'Active',
      institution: 'Meridian Auto',
    });
  }
  if (hasBrokerage) {
    list.push({
      id: `a${idx++}`,
      type: 'Brokerage',
      numberMasked: maskAccount(rand, 6),
      balance: Math.round(rand() * (segment === 'UHNW' ? 4800000 : segment === 'HNW' ? 1200000 : 180000)),
      openedAt: ymd(2017 + Math.floor(rand() * 6), 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      status: 'Active',
      institution: 'Aspen Wealth (BNY custody)',
    });
  }
  if (hasIra) {
    list.push({
      id: `a${idx++}`,
      type: 'IRA',
      numberMasked: maskAccount(rand, 6),
      balance: Math.round(rand() * 480000),
      openedAt: ymd(2014 + Math.floor(rand() * 8), 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      status: 'Active',
      institution: 'Aspen Wealth',
    });
  }
  return list;
}

function buildPolicies(rand: () => number, segment: Customer['segment']): Policy[] {
  const list: Policy[] = [];
  const hasAuto = rand() > 0.3;
  const hasHome = rand() > 0.5;
  const hasLife = rand() > 0.7;
  const hasUmbrella = (segment === 'HNW' || segment === 'UHNW') && rand() > 0.4;
  let idx = 1;
  if (hasAuto) {
    list.push({
      id: `p${idx++}`,
      policyNumberMasked: maskPolicy(rand),
      line: 'Auto',
      premium: Math.round(rand() * 1800 + 600),
      status: 'In-Force',
      inceptionDate: ymd(2024, 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      expirationDate: '2026-08-15',
      carrier: 'Northwind P&C',
      reinsurer: 'Munich Re',
      cededPct: 12,
    });
  }
  if (hasHome) {
    list.push({
      id: `p${idx++}`,
      policyNumberMasked: maskPolicy(rand),
      line: 'Home',
      premium: Math.round(rand() * 4800 + 1200),
      status: 'In-Force',
      inceptionDate: ymd(2024, 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      expirationDate: '2026-09-30',
      carrier: 'Northwind P&C',
      reinsurer: 'Swiss Re',
      cededPct: 18,
    });
  }
  if (hasLife) {
    list.push({
      id: `p${idx++}`,
      policyNumberMasked: maskPolicy(rand),
      line: 'Life',
      premium: Math.round(rand() * 8400 + 2000),
      status: 'In-Force',
      inceptionDate: ymd(2022, 1 + Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
      expirationDate: '2042-12-31',
      carrier: 'Northwind Life',
    });
  }
  if (hasUmbrella) {
    list.push({
      id: `p${idx++}`,
      policyNumberMasked: maskPolicy(rand),
      line: 'Umbrella',
      premium: Math.round(rand() * 1600 + 400),
      status: 'In-Force',
      inceptionDate: ymd(2024, 6, 1),
      expirationDate: '2026-06-30',
      carrier: 'Northwind P&C',
    });
  }
  return list;
}

const symbols = [
  { sym: 'AAPL', cusip: '037833100', figi: 'BBG000B9XRY4', isin: 'US0378331005' },
  { sym: 'MSFT', cusip: '594918104', figi: 'BBG000BPH459', isin: 'US5949181045' },
  { sym: 'NVDA', cusip: '67066G104', figi: 'BBG000BBJQV0', isin: 'US67066G1040' },
  { sym: 'AMZN', cusip: '023135106', figi: 'BBG000BVPV84', isin: 'US0231351067' },
  { sym: 'GOOGL', cusip: '02079K305', figi: 'BBG009S39JX6', isin: 'US02079K3059' },
  { sym: 'JPM', cusip: '46625H100', figi: 'BBG000DMBXR2', isin: 'US46625H1005' },
  { sym: 'BRK.B', cusip: '084670702', figi: 'BBG000DWG505', isin: 'US0846707026' },
  { sym: 'V', cusip: '92826C839', figi: 'BBG000PSKYX7', isin: 'US92826C8394' },
  { sym: 'VTI', cusip: '922908769', figi: 'BBG000B9XRT5', isin: 'US9229087690' },
  { sym: 'AGG', cusip: '464287226', figi: 'BBG000BHQDV2', isin: 'US4642872265' },
  { sym: 'TLT', cusip: '464287432', figi: 'BBG000C2N2X5', isin: 'US4642874329' },
  { sym: 'BTC', cusip: '—', figi: 'BBG-CRYPTO-BTC', isin: undefined },
];

function buildPositions(rand: () => number, segment: Customer['segment']): Position[] {
  const list: Position[] = [];
  if (segment === 'Mass' || segment === 'Commercial') return list;
  const count = segment === 'UHNW' ? 12 : segment === 'HNW' ? 8 : segment === 'Affluent' ? 5 : 3;
  for (let i = 0; i < count; i++) {
    const s = symbols[Math.floor(rand() * symbols.length)];
    const qty = Math.round(rand() * (segment === 'UHNW' ? 8000 : 1200) + 10);
    const price = 80 + Math.round(rand() * 360);
    list.push({
      id: `pos${i + 1}`,
      symbol: s.sym,
      cusip: s.cusip,
      figi: s.figi,
      isin: s.isin,
      qty,
      costBasis: qty * (price - Math.round(rand() * 40)),
      marketValue: qty * price,
      asOf: '2026-05-16',
      custodian: 'BNY Mellon',
      account: '****' + String(Math.floor(rand() * 9000) + 1000),
      assetClass: s.sym === 'BTC' ? 'Crypto' : s.sym === 'AGG' || s.sym === 'TLT' ? 'Fixed Income' : 'Equity',
      fairValueLevel: 1,
    });
  }
  return list;
}

export const customers: Customer[] = (() => {
  const rand = seededRand(98765);
  const list: Customer[] = [];
  for (let i = 0; i < 80; i++) {
    const firstName = pick(firstNames, rand);
    const lastName = pick(lastNames, rand);
    const state = pick(states, rand);
    const city = pick(cities[state], rand);
    const segment = pick(segments, rand);
    const dobY = 1948 + Math.floor(rand() * 56);
    const dobM = 1 + Math.floor(rand() * 12);
    const dobD = 1 + Math.floor(rand() * 28);
    const amlRiskRoll = rand();
    const amlRisk: Customer['amlRisk'] = amlRiskRoll > 0.9 ? 'High' : amlRiskRoll > 0.7 ? 'Medium' : 'Low';
    const accounts = buildAccounts(rand, segment);
    const policies = buildPolicies(rand, segment);
    const positions = buildPositions(rand, segment);
    const subSectors: Customer['subSectors'] = [];
    if (accounts.some((a) => ['Checking', 'Savings', 'Credit Card', 'Mortgage', 'Auto Loan'].includes(a.type))) subSectors.push('Banking');
    if (accounts.some((a) => ['Brokerage'].includes(a.type)) || positions.length > 0) subSectors.push('Capital Markets');
    if (accounts.some((a) => ['IRA', '401(k)', 'Annuity'].includes(a.type))) subSectors.push('Wealth');
    if (policies.length > 0) subSectors.push('Insurance');
    if (subSectors.length === 0) subSectors.push('Banking');

    const productsHeld: string[] = [];
    if (accounts.find((a) => a.type === 'Checking')) productsHeld.push('Checking');
    if (accounts.find((a) => a.type === 'Credit Card')) productsHeld.push('Card');
    if (accounts.find((a) => a.type === 'Mortgage')) productsHeld.push('Mortgage');
    if (accounts.find((a) => a.type === 'Auto Loan')) productsHeld.push('Auto Loan');
    if (accounts.find((a) => a.type === 'Brokerage')) productsHeld.push('Brokerage');
    if (accounts.find((a) => a.type === 'IRA')) productsHeld.push('IRA');
    if (policies.find((p) => p.line === 'Auto')) productsHeld.push('Auto Policy');
    if (policies.find((p) => p.line === 'Home')) productsHeld.push('Home Policy');
    if (policies.find((p) => p.line === 'Life')) productsHeld.push('Life Policy');

    const flags: string[] = [];
    if (segment === 'HNW' || segment === 'UHNW') flags.push('HNW');
    if (amlRisk === 'High') flags.push('AML-HIGH');
    if (accounts.some((a) => a.status === 'Delinquent')) flags.push('Delinquent');
    if (rand() > 0.93) flags.push('Section 1033 Active');

    list.push({
      id: `cust_${String(i + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      household: `HH-${1000 + i}`,
      dob: ymd(dobY, dobM, dobD),
      ssnMasked: maskSsn(rand),
      einMasked: segment === 'Commercial' ? `**-***${String(Math.floor(rand() * 9000) + 1000)}` : undefined,
      segment,
      state,
      city,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `(***) ***-${String(Math.floor(rand() * 9000) + 1000)}`,
      rm: pick(rms, rand),
      riskScore: Math.round(rand() * 100),
      amlRisk,
      ltv: Math.round(rand() * (segment === 'UHNW' ? 850000 : segment === 'HNW' ? 280000 : 18000) + 1200),
      productsHeld,
      flags,
      consent: {
        section1033: rand() > 0.6,
        affiliates: rand() > 0.4,
        marketing: rand() > 0.3,
      },
      subSectors,
      accounts,
      policies,
      positions,
    });
  }
  return list;
})();
