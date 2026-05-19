import { AlertTriangle, ShieldAlert, ShieldCheck, LineChart, ClipboardList, FileText, Radio, Workflow } from 'lucide-react';
import { useApp } from '../AppContext';
import type { ScreenKey } from '../types';

interface Notif {
  id: string;
  text: string;
  hint: string;
  time: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  tone: 'danger' | 'warn' | 'info' | 'ok';
  go: ScreenKey;
}

const items: Notif[] = [
  { id: 'n1', text: 'AML alert aml_002 — SAR drafted, awaiting BSA Officer review', hint: 'Layering · score 92', time: '11m ago', icon: AlertTriangle, tone: 'danger', go: 'aml' },
  { id: 'n2', text: 'Card fraud fr_002 — blocked auth, $8.2K ATO pattern', hint: 'Account Takeover · NG geo', time: '24m ago', icon: ShieldAlert, tone: 'danger', go: 'fraud' },
  { id: 'n3', text: 'Surveillance sv_001 — Insider trading review, AAPL pre-earnings', hint: 'LCM Cash · H. Vasquez', time: '38m ago', icon: LineChart, tone: 'warn', go: 'surveillance' },
  { id: 'n4', text: 'Claims clm_008 — SIU referral, prior-claim correlation', hint: 'Auto · CA · fraud 88', time: '1h ago', icon: ClipboardList, tone: 'warn', go: 'claims' },
  { id: 'n5', text: 'Pipeline Duck Creek nightly extract — FAILED, 412 rows in DLQ', hint: 'Insurance · Bronze', time: '2h ago', icon: Workflow, tone: 'danger', go: 'pipelines' },
  { id: 'n6', text: 'Data quality — Loss-ratio band check, Auto TX hail above 110%', hint: 'gold.insurance.loss_ratio', time: '3h ago', icon: ShieldCheck, tone: 'warn', go: 'quality' },
  { id: 'n7', text: 'MiFID II RTS-22 — 18 records schema-rejected today', hint: 'Capital Markets · Reg', time: '4h ago', icon: FileText, tone: 'warn', go: 'reporting' },
  { id: 'n8', text: 'DORA ICT incident dora_001 — Bloomberg B-PIPE EU degradation', hint: 'Significant · 4hr notification due', time: '5h ago', icon: Radio, tone: 'danger', go: 'dora' },
];

const toneCls = {
  danger: 'bg-danger/12 text-danger',
  warn: 'bg-warn/12 text-warn',
  info: 'bg-accent/12 text-accent',
  ok: 'bg-ok/12 text-ok',
};

export function Notifications() {
  const { notificationsOpen, setNotificationsOpen, setScreen } = useApp();
  if (!notificationsOpen) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/30 animate-fadein" onClick={() => setNotificationsOpen(false)}>
      <div
        className="absolute right-0 top-0 h-full w-[440px] bg-card-light dark:bg-card-dark shadow-pop border-l border-line-light dark:border-line-dark flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 px-4 border-b border-line-light dark:border-line-dark flex items-center justify-between">
          <div className="font-semibold text-sm">Notifications</div>
          <button
            className="text-ink-dim text-sm hover:text-ink-light dark:hover:text-ink-dark"
            onClick={() => setNotificationsOpen(false)}
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => {
                  setScreen(n.go);
                  setNotificationsOpen(false);
                }}
                className="w-full text-left px-4 py-3 flex gap-3 border-b border-line-light/60 dark:border-line-dark/60 hover:bg-canvas-light dark:hover:bg-white/5"
              >
                <div className={`w-8 h-8 rounded-input flex items-center justify-center flex-shrink-0 ${toneCls[n.tone]}`}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-snug">{n.text}</div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-dim mt-0.5">
                    <span>{n.hint}</span>
                    <span>·</span>
                    <span>{n.time}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
