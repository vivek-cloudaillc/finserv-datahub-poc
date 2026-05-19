import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Density, Pipeline, Role, ScreenKey, SubSector, Theme } from './types';

export interface ToastMsg {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warn' | 'danger';
}

export type ScreenParams = Record<string, unknown>;

export interface SignedInUser {
  name: string;
  title: string;
  initials: string;
  role: Role;
  email: string;
}

interface AppState {
  signedInUser: SignedInUser | null;
  isAuthenticated: boolean;
  signIn: (u: SignedInUser) => void;
  signOut: () => void;
  screen: ScreenKey;
  screenParams: ScreenParams;
  setScreen: (s: ScreenKey, params?: ScreenParams) => void;
  consumeScreenParams: () => ScreenParams;
  role: Role;
  setRole: (r: Role) => void;
  subSector: SubSector;
  setSubSector: (s: SubSector) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  density: Density;
  setDensity: (d: Density) => void;
  tenant: string;
  setTenant: (t: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (b: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (b: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (b: boolean) => void;
  toasts: ToastMsg[];
  toast: (text: string, tone?: ToastMsg['tone']) => void;
  dismissToast: (id: string) => void;
  /** Pipelines created by the user during this session (kept in memory only). */
  userPipelines: Pipeline[];
  addUserPipeline: (p: Pipeline) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);
  const [screen, _setScreen] = useState<ScreenKey>('home');
  const [screenParams, setScreenParams] = useState<ScreenParams>({});
  const setScreen = useCallback((s: ScreenKey, params: ScreenParams = {}) => {
    setScreenParams(params);
    _setScreen(s);
  }, []);
  const consumeScreenParams = useCallback(() => {
    const p = screenParams;
    if (Object.keys(p).length > 0) setScreenParams({});
    return p;
  }, [screenParams]);
  const [role, setRole] = useState<Role>('Analyst');
  const signIn = useCallback((u: SignedInUser) => {
    setSignedInUser(u);
    setRole(u.role);
  }, []);
  const signOut = useCallback(() => {
    setSignedInUser(null);
  }, []);
  const [subSector, setSubSector] = useState<SubSector>('All');
  const [theme, setTheme] = useState<Theme>('light');
  const [density, setDensity] = useState<Density>('Comfortable');
  const [tenant, setTenant] = useState<string>('Meridian Financial Group');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [userPipelines, setUserPipelines] = useState<Pipeline[]>([]);
  const addUserPipeline = useCallback((p: Pipeline) => {
    setUserPipelines((arr) => [p, ...arr]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((text: string, tone: ToastMsg['tone'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      signedInUser,
      isAuthenticated: signedInUser !== null,
      signIn,
      signOut,
      screen,
      screenParams,
      setScreen,
      consumeScreenParams,
      role,
      setRole,
      subSector,
      setSubSector,
      theme,
      setTheme,
      density,
      setDensity,
      tenant,
      setTenant,
      sidebarCollapsed,
      setSidebarCollapsed,
      paletteOpen,
      setPaletteOpen,
      notificationsOpen,
      setNotificationsOpen,
      toasts,
      toast,
      dismissToast,
      userPipelines,
      addUserPipeline,
    }),
    [
      signedInUser,
      signIn,
      signOut,
      screen,
      screenParams,
      setScreen,
      consumeScreenParams,
      role,
      subSector,
      theme,
      density,
      tenant,
      sidebarCollapsed,
      paletteOpen,
      notificationsOpen,
      toasts,
      toast,
      dismissToast,
      userPipelines,
      addUserPipeline,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
