import {
  Home,
  Network,
  Database,
  PlusCircle,
  Workflow,
  Layers,
  ShieldCheck,
  Activity,
  BookOpen,
  Lock,
  UserCircle,
  ArrowLeftRight,
  Repeat,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  LineChart,
  ClipboardList,
  FileBarChart,
  Sparkles,
  FileText,
  Shield,
  GitBranch,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../AppContext';
import type { ScreenKey } from '../types';

type IconType = React.ComponentType<{ className?: string; size?: number | string }>;

interface NavItem {
  id: ScreenKey;
  label: string;
  icon: IconType;
  group: string;
}

const nav: NavItem[] = [
  { id: 'home', label: 'Executive Home', icon: Home, group: 'Overview' },
  { id: 'architecture', label: 'Ingestion Architecture', icon: Network, group: 'Overview' },

  { id: 'sources', label: 'Source Catalog', icon: Database, group: 'Data Operations' },
  { id: 'add-source', label: 'Add Source', icon: PlusCircle, group: 'Data Operations' },
  { id: 'trade-ingestion', label: 'Trade Ingestion · FNSV-184', icon: Repeat, group: 'Data Operations' },
  { id: 'pipelines', label: 'Pipelines', icon: Workflow, group: 'Data Operations' },
  { id: 'medallion', label: 'Medallion Explorer', icon: Layers, group: 'Data Operations' },
  { id: 'quality', label: 'Data Quality', icon: ShieldCheck, group: 'Data Operations' },
  { id: 'observability', label: 'Observability', icon: Activity, group: 'Data Operations' },

  { id: 'governance', label: 'Governance / Catalog', icon: BookOpen, group: 'Trust' },
  { id: 'access', label: 'Access & Policies', icon: Lock, group: 'Trust' },

  { id: 'customer-360', label: 'Customer 360', icon: UserCircle, group: 'Insights & 360' },
  { id: 'transaction-360', label: 'Transaction & Trade 360', icon: ArrowLeftRight, group: 'Insights & 360' },
  { id: 'portfolio', label: 'Portfolio & Positions', icon: TrendingUp, group: 'Insights & 360' },
  { id: 'nl', label: 'NL Insights', icon: Sparkles, group: 'Insights & 360' },

  { id: 'aml', label: 'AML Investigations', icon: AlertTriangle, group: 'Risk & Compliance' },
  { id: 'fraud', label: 'Fraud Operations', icon: ShieldAlert, group: 'Risk & Compliance' },
  { id: 'surveillance', label: 'Trade Surveillance', icon: LineChart, group: 'Risk & Compliance' },
  { id: 'claims', label: 'Claims Operations', icon: ClipboardList, group: 'Risk & Compliance' },
  { id: 'underwriting', label: 'Underwriting', icon: FileBarChart, group: 'Risk & Compliance' },

  { id: 'reporting', label: 'Regulatory Reporting', icon: FileText, group: 'Reporting' },
  { id: 'compliance', label: 'Compliance Center', icon: Shield, group: 'Reporting' },
  { id: 'model-governance', label: 'Model Governance', icon: GitBranch, group: 'Reporting' },
  { id: 'dora', label: 'DORA Center', icon: Radio, group: 'Reporting' },

  { id: 'admin', label: 'Admin Console', icon: Settings, group: 'Admin' },
];

export function Sidebar() {
  const { screen, setScreen, sidebarCollapsed, setSidebarCollapsed } = useApp();

  const groups = nav.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <aside
      className={`bg-sidebar text-sidebar-text flex flex-col flex-shrink-0 transition-all duration-150 ease-out-soft ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Primary navigation"
    >
      <div className="h-14 flex items-center justify-between px-3 border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path d="M9 22V10h2.4l5 7.3V10h2.4v12h-2.4l-5-7.3V22H9z" fill="#fff" />
              <circle cx="23" cy="22" r="1.5" fill="#D6AB4A" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-white font-semibold text-sm tracking-tight truncate">Infinize</div>
              <div className="text-sidebar-muted text-[11px] truncate">FinServ Data Hub</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-sidebar-muted hover:text-white"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-2">
            {!sidebarCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-sidebar-muted">
                {group}
              </div>
            )}
            {items.map((item) => {
              const Icon = item.icon;
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-150 ease-out-soft ${
                    active
                      ? 'bg-accent/15 text-white border-l-2 border-accent'
                      : 'text-sidebar-text hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={16} className={active ? 'text-accent-dark' : ''} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      {!sidebarCollapsed && (
        <div className="border-t border-white/5 p-3 text-[11px] text-sidebar-muted leading-relaxed">
          <div>Env: Demo · us-east-1</div>
          <div className="font-mono text-[10px]">v0.1.0-poc · tenant-isolated</div>
        </div>
      )}
    </aside>
  );
}
