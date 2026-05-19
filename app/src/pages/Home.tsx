import { useMemo } from 'react';
import { useApp } from '../AppContext';
import { Card, Kpi, PageHeader, SimpleChart, StatusChip, Section } from '../components/ui';
import {
  amlAlerts,
  claims,
  customers,
  fraudCases,
  medallionFlows,
  pipelines,
  regReports,
  sources,
  stageKindColor,
  surveillanceAlerts,
  tierMeta,
  trades,
  transactions,
  underwritingSubs,
} from '../data';
import { ArrowRight, Network, Sparkles } from 'lucide-react';
import type { SubSector } from '../types';

function filterBySector<T extends { subSector?: string; subSectors?: string[] }>(arr: T[], sector: SubSector): T[] {
  if (sector === 'All') return arr;
  return arr.filter((x) => x.subSector === sector || x.subSector === 'Cross' || x.subSectors?.includes(sector));
}

export function Home() {
  const { subSector, setScreen, tenant } = useApp();

  const filteredSources = useMemo(() => filterBySector(sources, subSector), [subSector]);
  const filteredPipelines = useMemo(() => filterBySector(pipelines, subSector), [subSector]);
  const filteredCustomers = useMemo(() => filterBySector(customers, subSector), [subSector]);
  const filteredFlows = useMemo(
    () => medallionFlows.filter((f) => subSector === 'All' || f.subSector === subSector || f.subSector === 'Cross'),
    [subSector],
  );

  const customerCount = filteredCustomers.length;
  const accountsCount = filteredCustomers.reduce((s, c) => s + c.accounts.length, 0);
  const policiesInForce = filteredCustomers.reduce((s, c) => s + c.policies.filter((p) => p.status === 'In-Force').length, 0);
  const aum = filteredCustomers.reduce(
    (s, c) => s + c.accounts.filter((a) => ['Brokerage', 'IRA', '401(k)'].includes(a.type)).reduce((x, a) => x + a.balance, 0),
    0,
  );
  const txnsToday = transactions.length;
  const tradesToday = trades.length;
  const sourcesHealthy = filteredSources.filter((s) => s.status === 'healthy').length;
  const freshness = '< 8 min P95 across Silver';
  const openAml = amlAlerts.filter((a) => ['open', 'investigating', 'sar-drafted'].includes(a.status)).length;
  const openFraud = fraudCases.filter((f) => ['open', 'reviewing'].includes(f.status)).length;
  const openSurveillance = surveillanceAlerts.filter((s) => ['open', 'reviewing', 'escalated'].includes(s.status)).length;
  const openClaimsSiu = claims.filter((c) => c.siuReferred && c.status !== 'Closed').length;
  const openUw = underwritingSubs.filter((u) => ['New', 'In Review', 'Quoted'].includes(u.status)).length;
  const repDue7d = regReports.filter((r) => r.status !== 'Filed').length;

  const sparkline = (seed: number) => Array.from({ length: 16 }, (_, i) => 40 + ((Math.sin(i + seed) + 1) * 14) + i);

  const txnMix = [
    { name: 'ACH', value: transactions.filter((t) => t.rail === 'ACH').length },
    { name: 'Wire', value: transactions.filter((t) => t.rail === 'Wire').length },
    { name: 'RTP', value: transactions.filter((t) => t.rail === 'RTP').length },
    { name: 'FedNow', value: transactions.filter((t) => t.rail === 'FedNow').length },
    { name: 'Card', value: transactions.filter((t) => t.rail === 'Card').length },
    { name: 'Other', value: transactions.filter((t) => !['ACH', 'Wire', 'RTP', 'FedNow', 'Card'].includes(t.rail)).length },
  ];

  // Medallion-at-a-glance — per-tier health derived from pipeline status
  const tierHealth = (['Bronze', 'Silver', 'Gold', 'Platinum'] as const).map((tier) => {
    const tierPipes = filteredPipelines.filter((p) => p.tier === tier);
    return {
      tier,
      total: tierPipes.length,
      healthy: tierPipes.filter((p) => p.status === 'healthy').length,
      warn: tierPipes.filter((p) => p.status === 'warning').length,
      failed: tierPipes.filter((p) => p.status === 'failed').length,
      dlq: tierPipes.reduce((s, p) => s + p.dlq, 0),
    };
  });

  // Live use cases — sub-sector aware
  const useCases = useMemo(() => {
    const banking = [
      { title: 'AML on FedNow', metric: '184K screened today · 12 alerts · 3 SAR drafts', screen: 'aml' as const },
      { title: 'Card fraud (sub-100ms)', metric: '8.2M auth · 0.018% block rate · 42ms p95', screen: 'fraud' as const },
      { title: 'Section 1033 outbound', metric: '12K active consents · FDX 6.x · 4 revocations honored today', screen: 'access' as const },
      { title: 'Call Report assembly', metric: 'RCFD2170 +$182M QoQ · lineage to 184,272 source rows', screen: 'reporting' as const },
    ];
    const capmkts = [
      { title: 'Trade surveillance · MAR', metric: '612K execs · 8 alerts · 2 escalated', screen: 'surveillance' as const },
      { title: 'CAT submission T+1', metric: '612K reportable events · 100% coverage', screen: 'reporting' as const },
      { title: 'Pre-trade Rule 15c3-5', metric: '184K orders · 36 breaches MTD · 22 overrides', screen: 'surveillance' as const },
      { title: 'Best-ex (consolidated tape)', metric: 'Avg score 91 · 4 outliers flagged', screen: 'transaction-360' as const },
    ];
    const insurance = [
      { title: 'Claims SIU referral', metric: '10 SIU referrals · 4 fraud-score ≥ 78', screen: 'claims' as const },
      { title: 'Reserving IBNR', metric: 'TX Auto Hail loss-ratio 118% · reinsurance review', screen: 'underwriting' as const },
      { title: 'IFRS-17 cohort cube', metric: '84 cohorts · 1 in steward review', screen: 'reporting' as const },
      { title: 'Reinsurance bordereau recon', metric: 'Munich Re 12 · Swiss Re 18 · 12 breaks open', screen: 'claims' as const },
    ];
    const wealth = [
      { title: 'BNY custody recon', metric: '420K positions · 188 breaks · 1 hour SLA', screen: 'portfolio' as const },
      { title: 'Reg BI suitability', metric: '2.4M positions scanned · 14 suitability flags', screen: 'portfolio' as const },
      { title: 'Section 1033 NBA', metric: '73 HNW outreach candidates · alpha +0.9% YTD', screen: 'nl' as const },
      { title: 'Performance attribution', metric: 'YTD alpha +0.9% blended · US Mega-Cap overweight', screen: 'portfolio' as const },
    ];
    if (subSector === 'Banking') return banking;
    if (subSector === 'Capital Markets') return capmkts;
    if (subSector === 'Insurance') return insurance;
    if (subSector === 'Wealth') return wealth;
    return [...banking.slice(0, 1), ...capmkts.slice(0, 1), ...insurance.slice(0, 1), ...wealth.slice(0, 1)];
  }, [subSector]);

  return (
    <div>
      <PageHeader
        title="Executive Home"
        subtitle={`${tenant} · ${subSector} view · trusted financial data fabric, AI-native, regulator-ready`}
        actions={
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              onClick={() => setScreen('architecture')}
              aria-label="View architecture"
            >
              <Network size={14} /> Architecture
            </button>
            <button
              className="btn-primary"
              onClick={() => setScreen('nl')}
              aria-label="Open NL Insights"
            >
              <Sparkles size={14} /> Ask NL Insights
            </button>
          </div>
        }
      />

      <Section title="Operating signals" subtitle="Cross-sub-sector data hub vitals, 24h">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <Kpi label="Customers / households" value={customerCount.toLocaleString()} delta="+218 7d" tone="positive" series={sparkline(1)} />
          <Kpi label="Active accounts" value={accountsCount.toLocaleString()} hint="Across deposit, lending, brokerage" series={sparkline(2)} />
          <Kpi label="Policies in force" value={policiesInForce.toLocaleString()} hint="Auto · Home · Life · Commercial" series={sparkline(3)} />
          <Kpi label="AUM (custody + advisory)" value={`$${(aum / 1e6).toFixed(0)}M`} delta="+1.4% MTD" tone="positive" series={sparkline(4)} seriesTone="gold" />
          <Kpi label="Transactions today" value={txnsToday.toLocaleString()} hint="ACH · Wire · RTP · FedNow · Card" series={sparkline(5)} />
          <Kpi label="Trades today" value={tradesToday.toLocaleString()} hint="Cross-asset, T+1 ready" series={sparkline(6)} />
          <Kpi label="Sources healthy" value={`${sourcesHealthy}/${filteredSources.length}`} delta="98.4% SLO" tone="positive" series={sparkline(7)} seriesTone="ok" />
          <Kpi label="Data freshness" value={freshness} hint="BCBS 239 aligned" series={sparkline(8)} />
          <Kpi label="Open AML alerts" value={openAml.toString()} delta="3 SAR drafts" tone="warn" series={sparkline(9)} seriesTone="danger" />
          <Kpi label="Open fraud cases" value={openFraud.toString()} delta="2 ATO" tone="warn" series={sparkline(10)} seriesTone="danger" />
          <Kpi label="Open surveillance alerts" value={openSurveillance.toString()} delta="1 insider" tone="warn" series={sparkline(11)} />
          <Kpi label="SIU claim referrals" value={openClaimsSiu.toString()} hint="Carla Rodriguez team" series={sparkline(12)} />
          <Kpi label="UW submissions" value={openUw.toString()} hint="Commercial / specialty" series={sparkline(13)} />
          <Kpi label="Reg reports due / late" value={repDue7d.toString()} delta="Next: HMDA LAR" tone="warn" series={sparkline(14)} />
          <Kpi label="NL queries today" value="184" delta="+22 vs. yesterday" tone="positive" series={sparkline(15)} seriesTone="accent" />
          <Kpi label="DORA ICT incidents open" value="1" hint="dora_001 · Significant" tone="warn" series={sparkline(16)} />
        </div>
      </Section>

      {/* Medallion at a glance — the headline architecture panel */}
      <Section
        title="Medallion at a glance"
        subtitle="Per-tier pipeline health · the fabric that makes everything else trustworthy"
        right={
          <button className="text-xs text-accent underline" onClick={() => setScreen('medallion')}>
            Open Medallion Explorer →
          </button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {tierHealth.map((t) => (
            <button
              key={t.tier}
              onClick={() => setScreen('pipelines')}
              className="text-left card p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${tierMeta[t.tier].bg.split(' ')[0]} ring-2 ${tierMeta[t.tier].ring}`} />
                  <span className={`text-[11px] font-semibold ${tierMeta[t.tier].color}`}>{t.tier}</span>
                </div>
                <span className="text-[10px] text-ink-dim">{t.total} pipelines</span>
              </div>
              <div className="text-[11px] text-ink-dim leading-snug mb-2 line-clamp-3">{tierMeta[t.tier].description}</div>
              <div className="flex items-center gap-3 text-xs tabular">
                <span className="text-ok">✓ {t.healthy}</span>
                <span className="text-warn">! {t.warn}</span>
                <span className="text-danger">× {t.failed}</span>
                <span className="ml-auto text-ink-dim">DLQ {t.dlq}</span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Live FinServ use cases */}
      <Section
        title="Live use cases"
        subtitle={subSector === 'All' ? 'One headline use case per sub-sector. Click to open the workspace.' : `${subSector} use cases — what the Hub is doing right now.`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {useCases.map((u) => (
            <button
              key={u.title}
              onClick={() => setScreen(u.screen)}
              className="card p-4 text-left hover:shadow-card transition-shadow"
            >
              <div className="text-[11px] text-ink-dim">Use case</div>
              <div className="text-sm font-semibold mt-0.5">{u.title}</div>
              <div className="text-xs text-ink-dim mt-2 leading-snug">{u.metric}</div>
              <div className="text-[11px] text-accent mt-2 flex items-center gap-1">
                Open workspace <ArrowRight size={11} />
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Canonical flows powered by the Hub */}
      <Section
        title="Canonical FinServ flows"
        subtitle="Source → Bronze → Silver → Gold → Platinum. Each is contract-backed, lineage-traced, and time-travelable."
        right={
          <button className="text-xs text-accent underline" onClick={() => setScreen('medallion')}>
            See all flows →
          </button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {filteredFlows.slice(0, 6).map((f) => (
            <button
              key={f.id}
              onClick={() => setScreen('medallion')}
              className="card p-4 text-left hover:shadow-card transition-shadow"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="chip">{f.subSector}</span>
                <span className="text-[10px] text-ink-dim">{f.endToEndSla}</span>
              </div>
              <div className="text-sm font-semibold leading-snug">{f.name}</div>
              <div className="text-[11px] text-ink-dim mt-1">{f.volume}</div>
              <div className="flex items-center gap-1 mt-2 overflow-x-auto">
                {f.stages.slice(0, 6).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-chip ${tierMeta[s.tier].bg} ${tierMeta[s.tier].color}`}>
                      {s.tier[0]}
                    </span>
                    <span className={`text-[9px] px-1 py-0.5 rounded-chip ${stageKindColor[s.kind]}`}>
                      {s.kind[0]}
                    </span>
                    {i < Math.min(f.stages.length, 6) - 1 && <span className="text-ink-dim text-[10px]">→</span>}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Cross-rail payments mix (today)" subtitle="Demonstrates the unified Transaction 360 mart">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Rail mix">
            <SimpleChart kind="donut" data={txnMix} height={220} />
          </Card>
          <Card title="What changes if I switch sub-sector">
            <ul className="text-sm space-y-2 leading-snug">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" /> KPI tiles reshape (e.g. AUM hides for pure Insurance)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" /> Source catalog filters to cores or OMS or policy admin
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" /> Customer 360 tabs change (deposits ↔ policies)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" /> Reg-reporting library swaps (Call Report vs. NAIC)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" /> Information barriers enforced for MNPI in CapMkts
              </li>
            </ul>
          </Card>
          <Card title="What's on fire" subtitle="Resolve direct from here">
            <div className="space-y-1.5">
              {filteredPipelines
                .filter((p) => p.status !== 'healthy')
                .slice(0, 4)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setScreen('pipelines', { pipelineId: p.id })}
                    className="w-full flex items-center gap-2 p-2 rounded-input border border-line-light dark:border-line-dark hover:border-accent"
                  >
                    <span className={`w-1 h-6 rounded-full ${p.status === 'failed' ? 'bg-danger' : p.status === 'warning' ? 'bg-warn' : 'bg-accent'}`} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-xs font-medium truncate">{p.name}</div>
                      <div className="text-[10px] text-ink-dim">DLQ {p.dlq} · {p.lastRun}</div>
                    </div>
                    <StatusChip status={p.status} />
                  </button>
                ))}
              {amlAlerts.slice(0, 1).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setScreen('aml', { alertId: a.id })}
                  className="w-full flex items-center gap-2 p-2 rounded-input border border-line-light dark:border-line-dark hover:border-accent"
                >
                  <span className="w-1 h-6 rounded-full bg-danger" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-medium truncate">AML · {a.typology} · {a.id}</div>
                    <div className="text-[10px] text-ink-dim">score {a.score} · ${a.amount.toLocaleString()}</div>
                  </div>
                  <StatusChip status={a.status} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}

