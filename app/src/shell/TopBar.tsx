import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Moon, Search, Sun } from 'lucide-react';
import { useApp } from '../AppContext';
import type { Density, Role, SubSector } from '../types';

const roles: Role[] = ['Analyst', 'Steward', 'Risk', 'Compliance', 'Underwriter', 'Advisor', 'Admin'];
const subSectors: SubSector[] = ['All', 'Banking', 'Capital Markets', 'Insurance', 'Wealth'];

export function TopBar() {
  const {
    role,
    setRole,
    subSector,
    setSubSector,
    theme,
    setTheme,
    density,
    setDensity,
    tenant,
    setPaletteOpen,
    setNotificationsOpen,
  } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="h-14 flex-shrink-0 border-b border-line-light dark:border-line-dark bg-card-light dark:bg-card-dark flex items-center gap-3 px-4 min-w-0 relative">
      <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-ok flex-shrink-0" title="Tenant data plane healthy" />
        <span className="text-sm font-semibold truncate max-w-[220px]" title={tenant}>{tenant}</span>
      </div>

      {/* Sub-sector switcher — first-class because the data hub spans 4 domains */}
      <div className="hidden lg:flex items-center gap-1 text-xs flex-shrink-0">
        <div className="flex rounded-input border border-line-light dark:border-line-dark overflow-hidden">
          {subSectors.map((s) => (
            <button
              key={s}
              onClick={() => setSubSector(s)}
              className={`px-2.5 py-1 text-xs transition-colors ${
                subSector === s
                  ? 'bg-accent text-white dark:bg-accent-dark'
                  : 'hover:bg-canvas-light dark:hover:bg-white/5 text-ink-dim'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        className="flex-1 min-w-0 max-w-md h-9 flex items-center gap-2 px-3 rounded-input border border-line-light dark:border-line-dark bg-canvas-light dark:bg-canvas-dark text-left text-sm text-ink-dim hover:border-accent dark:hover:border-accent-dark transition-colors overflow-hidden"
        onClick={() => setPaletteOpen(true)}
        aria-label="Open command palette"
      >
        <Search size={14} className="flex-shrink-0" />
        <span className="truncate hidden sm:inline">
          Search customers, trades, policies, datasets…
        </span>
        <kbd className="ml-auto id-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-card-dark border border-line-light dark:border-line-dark flex-shrink-0">
          ⌘K
        </kbd>
      </button>

      <div className="hidden xl:flex items-center gap-1 text-xs flex-shrink-0">
        <span className="text-ink-dim">Role</span>
        <div className="flex rounded-input border border-line-light dark:border-line-dark overflow-hidden">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-2 py-1 text-xs transition-colors ${
                role === r
                  ? 'bg-accent text-white dark:bg-accent-dark'
                  : 'hover:bg-canvas-light dark:hover:bg-white/5 text-ink-dim'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden 2xl:flex items-center gap-1 text-xs flex-shrink-0">
        <span className="text-ink-dim">Density</span>
        <div className="flex rounded-input border border-line-light dark:border-line-dark overflow-hidden">
          {(['Compact', 'Comfortable'] as Density[]).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`px-2 py-1 transition-colors ${
                density === d
                  ? 'bg-accent/10 text-accent dark:bg-accent-dark/15 dark:text-accent-dark'
                  : 'text-ink-dim'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn-ghost flex-shrink-0"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
      </button>

      <button
        className="relative btn-ghost flex-shrink-0"
        onClick={() => setNotificationsOpen(true)}
        aria-label="Notifications"
      >
        <Bell size={14} />
        <span className="absolute -top-1 -right-1 text-[10px] bg-danger text-white rounded-full px-1.5 py-[1px] tabular">
          7
        </span>
      </button>

      <div className="relative flex-shrink-0" ref={userMenuRef}>
        <button
          className="flex items-center gap-1 pl-1 pr-1 py-1 rounded-input hover:bg-canvas-light dark:hover:bg-white/5"
          onClick={() => setUserMenuOpen((v) => !v)}
          aria-label="User menu"
        >
          <div className="w-7 h-7 bg-accent dark:bg-accent-dark rounded-full flex items-center justify-center text-white text-xs font-semibold">
            KK
          </div>
          <ChevronDown size={14} className="text-ink-dim" />
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 mt-1 w-60 card overflow-hidden z-50">
            <div className="px-3 py-3 border-b border-line-light/70 dark:border-line-dark/70">
              <div className="text-sm font-medium">Data Hub user</div>
              <div className="text-[10px] text-ink-dim mt-1">Role · {role}</div>
            </div>
            <div className="px-3 py-2 text-[11px] text-ink-dim">
              Tenant · {tenant}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
