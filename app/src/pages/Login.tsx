import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useApp } from '../AppContext';
import type { Role } from '../types';

interface DemoUser {
  initials: string;
  name: string;
  title: string;
  role: Role;
  email: string;
}

const demoGroups: { label: string; users: DemoUser[] }[] = [
  {
    label: 'ANALYSTS',
    users: [
      { initials: 'DV', name: 'D. Vargas', title: 'Customer Insights', role: 'Analyst', email: 'd.vargas@meridian.example' },
      { initials: 'DR', name: 'D. Reyes', title: 'Lending Platform', role: 'Analyst', email: 'd.reyes@meridian.example' },
    ],
  },
  {
    label: 'STEWARDS',
    users: [
      { initials: 'MP', name: 'M. Patel', title: 'Payments Engineering', role: 'Steward', email: 'm.patel@meridian.example' },
      { initials: 'FA', name: 'F. Al-Hassan', title: 'Risk Operations', role: 'Steward', email: 'f.alhassan@meridian.example' },
    ],
  },
  {
    label: 'RISK OFFICERS',
    users: [
      { initials: 'KT', name: 'K. Thompson', title: 'Market Risk', role: 'Risk', email: 'k.thompson@meridian.example' },
      { initials: 'LN', name: 'L. Nakamura', title: 'Credit Risk', role: 'Risk', email: 'l.nakamura@meridian.example' },
    ],
  },
  {
    label: 'COMPLIANCE',
    users: [
      { initials: 'RH', name: 'R. Hernandez', title: 'AML & Sanctions', role: 'Compliance', email: 'r.hernandez@meridian.example' },
      { initials: 'SP', name: 'S. Park', title: 'Reg Reporting', role: 'Compliance', email: 's.park@meridian.example' },
    ],
  },
  {
    label: 'UNDERWRITERS & ADVISORS',
    users: [
      { initials: 'AC', name: 'A. Cohen', title: 'Commercial Lines', role: 'Underwriter', email: 'a.cohen@meridian.example' },
      { initials: 'GR', name: 'G. Rossi', title: 'Private Wealth', role: 'Advisor', email: 'g.rossi@meridian.example' },
    ],
  },
  {
    label: 'ADMIN',
    users: [
      { initials: 'OS', name: 'O. Singh', title: 'Platform Admin', role: 'Admin', email: 'o.singh@meridian.example' },
    ],
  },
];

export function Login() {
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const initials = email
      .split('@')[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || email.slice(0, 2).toUpperCase();
    signIn({
      name: email.split('@')[0] || 'User',
      title: 'Signed in',
      initials,
      role: 'Analyst',
      email,
    });
  };

  const pickDemo = (u: DemoUser) => {
    signIn({
      name: u.name,
      title: u.title,
      initials: u.initials,
      role: u.role,
      email: u.email,
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      {/* Left — brand */}
      <div className="lg:w-1/2 bg-sidebar text-sidebar-text flex flex-col justify-between px-8 sm:px-12 lg:px-16 py-10 lg:py-14">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-elev flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="text-sm font-semibold tracking-[0.18em] text-white/90">INFINIZE</span>
        </div>

        <div className="max-w-lg mt-12 lg:mt-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-white">
            Unified FinServ
            <br />
            Data Hub
          </h1>
          <p className="mt-6 text-base text-sidebar-muted leading-relaxed">
            Bronze → Silver → Gold medallion lakehouse for core banking, card,
            ACH, wire, KYC, sanctions, and fraud data — with grounded
            natural-language insights and full lineage to source.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              'Connect every source — Fiserv, Marqeta, Plaid, Persona, OFAC, ComplyAdvantage',
              'Column-aware cleaning with auditable lineage to source',
              'Plain-language queries with cited tables and guardrails',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="text-[11px] font-semibold text-sidebar-muted tabular pt-1 min-w-[1.5rem]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-sidebar-text leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[11px] text-sidebar-muted mt-12 lg:mt-0">
          © Infinize Technologies · finserv-datahub-poc
        </div>
      </div>

      {/* Right — sign-in */}
      <div className="lg:w-1/2 bg-[#FAF7F0] text-ink-light flex flex-col px-8 sm:px-12 lg:px-16 py-10 lg:py-14 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-ink-dim">Sign in to access the platform.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="eyebrow block mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourbank.com"
                  className="input pl-10 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="eyebrow block mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink-light"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-input bg-sidebar text-white text-sm font-medium py-3 hover:bg-sidebar-elev transition-colors"
            >
              Sign in
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-line-light" />
            <span className="text-[11px] font-medium tracking-[0.18em] text-ink-dim">
              OR PICK A DEMO ACCOUNT
            </span>
            <div className="flex-1 h-px bg-line-light" />
          </div>

          <div className="mt-6 space-y-6 pb-8">
            {demoGroups.map((group) => (
              <div key={group.label}>
                <div className="eyebrow mb-2">{group.label}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.users.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => pickDemo(u)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-input border border-line-light bg-white hover:border-accent hover:shadow-card transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-semibold text-accent flex-shrink-0">
                        {u.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-[11px] text-ink-dim truncate">{u.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
