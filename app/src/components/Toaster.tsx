import { CheckCircle2, Info, XCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../AppContext';

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon =
          t.tone === 'success' ? CheckCircle2 : t.tone === 'warn' ? AlertTriangle : t.tone === 'danger' ? XCircle : Info;
        const tone =
          t.tone === 'success'
            ? 'bg-ok/12 text-ok border-ok/30'
            : t.tone === 'warn'
            ? 'bg-warn/12 text-warn border-warn/30'
            : t.tone === 'danger'
            ? 'bg-danger/12 text-danger border-danger/30'
            : 'bg-accent/12 text-accent border-accent/30';
        return (
          <div
            key={t.id}
            className={`card px-3 py-2 flex items-start gap-2 border ${tone} animate-fadein`}
          >
            <Icon size={16} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm flex-1 min-w-0">{t.text}</div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-ink-dim hover:text-ink-light dark:hover:text-ink-dark text-xs"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
