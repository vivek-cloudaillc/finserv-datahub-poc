import type { ReactNode } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../AppContext';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold truncate">{title}</h1>
        {subtitle && <p className="text-sm text-ink-dim mt-1 max-w-3xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  title,
  subtitle,
  actions,
  className = '',
  padded = true,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`card ${className} min-w-0`}>
      {(title || actions) && (
        <div className="flex items-start justify-between px-4 py-3 border-b border-line-light/70 dark:border-line-dark/70 gap-3">
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <div className="font-semibold text-sm truncate">{title}</div>
            ) : (
              title
            )}
            {subtitle && <div className="text-xs text-ink-dim mt-0.5">{subtitle}</div>}
          </div>
          {actions && <div className="flex gap-1 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className={padded ? 'p-4' : 'overflow-x-auto'}>{children}</div>
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  series,
  seriesTone = 'accent',
  tone = 'neutral',
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  series?: number[];
  seriesTone?: 'accent' | 'gold' | 'ok' | 'danger';
  tone?: 'neutral' | 'positive' | 'warn' | 'danger';
  hint?: string;
}) {
  const toneCls =
    tone === 'positive'
      ? 'text-ok'
      : tone === 'warn'
      ? 'text-warn'
      : tone === 'danger'
      ? 'text-danger'
      : 'text-ink-dim';
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-medium text-ink-dim dark:text-ink-dimdark">
          {label}
        </div>
        {delta && <div className={`text-[11px] font-medium ${toneCls}`}>{delta}</div>}
      </div>
      <div className="kpi-num">{value}</div>
      {series && <Sparkline values={series} tone={seriesTone} />}
      {hint && <div className="text-[11px] text-ink-dim">{hint}</div>}
    </div>
  );
}

export function Sparkline({
  values,
  height = 28,
  tone = 'accent',
}: {
  values: number[];
  height?: number;
  tone?: 'accent' | 'gold' | 'ok' | 'danger';
}) {
  const { theme } = useApp();
  const data = values.map((v, i) => ({ x: i, v }));
  const isDark = theme === 'dark';
  const stroke =
    tone === 'gold'
      ? isDark ? '#D6AB4A' : '#B58A2A'
      : tone === 'ok'
      ? '#16A34A'
      : tone === 'danger'
      ? '#DC2626'
      : isDark ? '#60A5FA' : '#1D4ED8';
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const base =
    'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-chip font-medium tabular';
  const map: Record<string, string> = {
    healthy: 'bg-ok/12 text-ok',
    pass: 'bg-ok/12 text-ok',
    Filled: 'bg-ok/12 text-ok',
    Posted: 'bg-ok/12 text-ok',
    'In-Force': 'bg-ok/12 text-ok',
    Active: 'bg-ok/12 text-ok',
    Approved: 'bg-ok/12 text-ok',
    Bound: 'bg-ok/12 text-ok',
    Compliant: 'bg-ok/12 text-ok',
    Filed: 'bg-ok/12 text-ok',
    Closed: 'bg-ok/12 text-ok',
    resolved: 'bg-ok/12 text-ok',
    cleared: 'bg-ok/12 text-ok',
    released: 'bg-ok/12 text-ok',
    Resolved: 'bg-ok/12 text-ok',

    running: 'bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark',
    Pending: 'bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark',
    investigating: 'bg-warn/12 text-warn',
    reviewing: 'bg-warn/12 text-warn',
    'In Review': 'bg-warn/12 text-warn',
    'In Adjudication': 'bg-warn/12 text-warn',
    Quoted: 'bg-accent/10 text-accent',
    Draft: 'bg-accent/10 text-accent',
    'sar-drafted': 'bg-warn/12 text-warn',
    Investigating: 'bg-warn/12 text-warn',
    Mitigated: 'bg-accent/10 text-accent',
    mitigated: 'bg-accent/10 text-accent',

    warning: 'bg-warn/12 text-warn',
    warn: 'bg-warn/12 text-warn',
    Partial: 'bg-warn/12 text-warn',
    'In Progress': 'bg-warn/12 text-warn',
    Lapsed: 'bg-warn/12 text-warn',
    Late: 'bg-warn/12 text-warn',
    Delinquent: 'bg-warn/12 text-warn',
    Held: 'bg-warn/12 text-warn',
    escalated: 'bg-warn/12 text-warn',

    open: 'bg-danger/12 text-danger',
    Open: 'bg-danger/12 text-danger',
    FNOL: 'bg-danger/12 text-danger',
    blocked: 'bg-danger/12 text-danger',
    Returned: 'bg-danger/12 text-danger',
    Disputed: 'bg-danger/12 text-danger',
    Rejected: 'bg-danger/12 text-danger',
    Cancelled: 'bg-danger/12 text-danger',
    Frozen: 'bg-danger/12 text-danger',
    Denied: 'bg-danger/12 text-danger',
    Declined: 'bg-danger/12 text-danger',
    Litigated: 'bg-danger/12 text-danger',
    failed: 'bg-danger/12 text-danger',
    fail: 'bg-danger/12 text-danger',
    'confirmed-fraud': 'bg-danger/12 text-danger',
    Gap: 'bg-danger/12 text-danger',
    'Action Required': 'bg-danger/12 text-danger',
    reported: 'bg-danger/12 text-danger',
    filed: 'bg-danger/12 text-danger',

    paused: 'bg-line-light text-ink-dim dark:bg-white/10 dark:text-ink-dimdark',
    New: 'bg-accent/10 text-accent',
    Production: 'bg-ok/12 text-ok',
    Challenger: 'bg-accent/10 text-accent',
    Retired: 'bg-line-light text-ink-dim dark:bg-white/10',
    Validation: 'bg-warn/12 text-warn',

    P1: 'bg-danger/12 text-danger',
    P2: 'bg-warn/12 text-warn',
    P3: 'bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark',
    P4: 'bg-line-light text-ink-dim dark:bg-white/10 dark:text-ink-dimdark',

    Major: 'bg-danger/12 text-danger',
    Significant: 'bg-warn/12 text-warn',
    'Non-Major': 'bg-accent/10 text-accent',

    Low: 'bg-ok/12 text-ok',
    Medium: 'bg-warn/12 text-warn',
    High: 'bg-danger/12 text-danger',

    NPI: 'bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark',
    PCI: 'bg-danger/12 text-danger',
    PHI: 'bg-warn/12 text-warn',
    MNPI: 'bg-mnpi/12 text-mnpi',
    'Auth Secret': 'bg-danger/12 text-danger',
    Public: 'bg-ok/12 text-ok',
    Internal: 'bg-line-light text-ink-dim dark:bg-white/10',
    Confidential: 'bg-warn/12 text-warn',
  };
  const cls = map[status] ?? 'bg-line-light text-ink-dim dark:bg-white/5';
  return <span className={`${base} ${cls}`}>{status}</span>;
}

export function HealthScore({ value }: { value: number }) {
  const tone = value >= 92 ? 'bg-ok' : value >= 80 ? 'bg-warn' : 'bg-danger';
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 rounded-full bg-line-light dark:bg-white/10 overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular w-8 text-right font-medium">{value}</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      {icon && <div className="mb-3 text-ink-dim">{icon}</div>}
      <div className="font-medium">{title}</div>
      {body && <div className="text-sm text-ink-dim mt-1 max-w-sm">{body}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function SimpleChart({
  kind,
  data,
  height = 200,
  tone = 'accent',
}: {
  kind: 'bar' | 'line' | 'area' | 'donut';
  data: { name: string; value: number; extra?: number }[];
  height?: number;
  tone?: 'accent' | 'gold' | 'ok' | 'danger';
}) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const accentColor = isDark ? '#60A5FA' : '#1D4ED8';
  const goldColor = isDark ? '#D6AB4A' : '#B58A2A';
  const okColor = '#16A34A';
  const dangerColor = '#DC2626';
  const color =
    tone === 'gold' ? goldColor : tone === 'ok' ? okColor : tone === 'danger' ? dangerColor : accentColor;
  const axisColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? '#1F2A44' : '#E2E8F0';
  const tooltipBg = isDark ? '#111B2E' : '#FFFFFF';
  const tooltipStyle = {
    background: tooltipBg,
    border: `1px solid ${gridColor}`,
    borderRadius: 8,
    fontSize: 12,
    color: isDark ? '#E2E8F0' : '#0F172A',
    boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
  };
  if (kind === 'donut') {
    const colors = isDark
      ? ['#60A5FA', '#3B82F6', '#93C5FD', '#D6AB4A', '#E8C97D', '#16A34A']
      : ['#1D4ED8', '#3B82F6', '#60A5FA', '#B58A2A', '#D2B061', '#16A34A'];
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={1}
              stroke={tooltipBg}
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => (typeof v === 'number' ? v.toLocaleString() : String(v))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (kind === 'line') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => (typeof v === 'number' ? v.toLocaleString() : String(v))}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2, fill: color }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (kind === 'area') {
    const gradId = `areaGrad-${tone}-${isDark ? 'd' : 'l'}`;
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.45 : 0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => (typeof v === 'number' ? v.toLocaleString() : String(v))}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradId})`}
              strokeWidth={2}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => (typeof v === 'number' ? v.toLocaleString() : String(v))}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(29,78,216,0.06)' }}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  width = 'w-[640px]',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/40 animate-fadein" onClick={onClose}>
      <div
        className={`absolute top-0 right-0 h-full ${width} bg-card-light dark:bg-card-dark shadow-pop border-l border-line-light dark:border-line-dark flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 px-4 border-b border-line-light dark:border-line-dark flex items-center justify-between">
          <div className="font-semibold text-sm">{title}</div>
          <button
            onClick={onClose}
            className="text-ink-dim hover:text-ink-light dark:hover:text-ink-dark text-sm"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-sm">{children}</div>
      </div>
    </div>
  );
}

export function SensitivityChip({ tier }: { tier: string }) {
  return <StatusChip status={tier} />;
}

export function GuardrailBadge({
  label,
  ok,
}: {
  label: string;
  ok: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-chip font-medium ${
        ok ? 'bg-ok/12 text-ok' : 'bg-danger/12 text-danger'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function Section({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between mb-3 gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-ink-dim mt-0.5">{subtitle}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
