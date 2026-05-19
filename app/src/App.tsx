import { AppProvider, useApp } from './AppContext';
import { Sidebar } from './shell/Sidebar';
import { TopBar } from './shell/TopBar';
import { CommandPalette } from './shell/CommandPalette';
import { Notifications } from './shell/Notifications';
import { Toaster } from './components/Toaster';

import { Home } from './pages/Home';
import { Architecture } from './pages/Architecture';
import { SourceCatalog } from './pages/SourceCatalog';
import { AddSourceWizard } from './pages/AddSourceWizard';
import { TradeIngestion } from './pages/TradeIngestion';
import { Pipelines } from './pages/Pipelines';
import { Medallion } from './pages/Medallion';
import { QualityConsole } from './pages/QualityConsole';
import { Observability } from './pages/Observability';
import { Governance } from './pages/Governance';
import { Access } from './pages/Access';
import { Customer360 } from './pages/Customer360';
import { Transaction360 } from './pages/Transaction360';
import { Portfolio } from './pages/Portfolio';
import { Aml } from './pages/Aml';
import { Fraud } from './pages/Fraud';
import { Surveillance } from './pages/Surveillance';
import { Claims } from './pages/Claims';
import { Underwriting } from './pages/Underwriting';
import { NlInsights } from './pages/NlInsights';
import { Reporting } from './pages/Reporting';
import { Compliance } from './pages/Compliance';
import { ModelGovernance } from './pages/ModelGovernance';
import { Dora } from './pages/Dora';
import { Admin } from './pages/Admin';

import type { ScreenKey } from './types';

function ScreenSwitch() {
  const { screen, density } = useApp();
  const map: Record<ScreenKey, React.ComponentType> = {
    home: Home,
    architecture: Architecture,
    sources: SourceCatalog,
    'add-source': AddSourceWizard,
    'trade-ingestion': TradeIngestion,
    pipelines: Pipelines,
    medallion: Medallion,
    quality: QualityConsole,
    observability: Observability,
    governance: Governance,
    access: Access,
    'customer-360': Customer360,
    'transaction-360': Transaction360,
    portfolio: Portfolio,
    aml: Aml,
    fraud: Fraud,
    surveillance: Surveillance,
    claims: Claims,
    underwriting: Underwriting,
    nl: NlInsights,
    reporting: Reporting,
    compliance: Compliance,
    'model-governance': ModelGovernance,
    dora: Dora,
    admin: Admin,
  };
  const Current = map[screen];
  return (
    <main className={`flex-1 overflow-y-auto overflow-x-hidden min-w-0 ${density === 'Compact' ? 'grid-dense' : ''} p-6`}>
      <Current />
    </main>
  );
}

function Shell() {
  return (
    <div className="h-screen flex bg-canvas-light dark:bg-canvas-dark text-ink-light dark:text-ink-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <ScreenSwitch />
      </div>
      <CommandPalette />
      <Notifications />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
