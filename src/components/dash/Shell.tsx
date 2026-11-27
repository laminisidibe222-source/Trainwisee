import React from 'react';
import { ChevronDown, CreditCard, FolderOpen, LayoutDashboard, LogOut, Menu, Plus, Sparkles, X } from 'lucide-react';
import { Logo } from '../Logo';
import { LanguageToggle, useI18n, type TKey } from '../../i18n';
import type { User } from '../../lib/api';
import { C } from './theme';

type Action = 'dashboard' | 'plans' | 'new';

const LINKS: { id: Action; icon: typeof LayoutDashboard; key: TKey }[] = [
  { id: 'dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { id: 'plans', icon: FolderOpen, key: 'nav.myPlans' },
  { id: 'new', icon: Sparkles, key: 'nav.newPlan' },
];

type Summary = { split: string; goal: string; kcal: number; week: number } | null;

/** White hexagon badge with the chevron — the reference's logo tile. */
const HexBadge = () => (
  <span className="relative grid h-9 w-9 shrink-0 place-items-center" aria-hidden>
    <svg viewBox="0 0 40 44" className="absolute inset-0 h-full w-full">
      <path d="M20 1.5 37.5 11.5v21L20 42.5 2.5 32.5v-21z" fill="#fff" />
    </svg>
    <span className="relative text-[17px] font-black leading-none" style={{ color: C.blue }}>
      ›
    </span>
  </span>
);

const Panel = ({
  user,
  active,
  summary,
  onGo,
  onLogout,
  onClose,
}: {
  user: User;
  active: Action;
  summary: Summary;
  onGo: (a: Action) => void;
  onLogout: () => void;
  onClose?: () => void;
}) => {
  const { t } = useI18n();
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2.5">
          <HexBadge />
          <Logo size={16} tone="light" />
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X size={17} />
          </button>
        )}
      </div>

      <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">OVERVIEW</p>

      <nav className="mt-2 flex flex-col gap-0.5" aria-label={t('nav.menu')}>
        {LINKS.map(({ id, icon: Icon, key }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onGo(id)}
              aria-current={on ? 'page' : undefined}
              className={`group flex min-h-10 items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-left text-[12.5px] font-semibold transition-colors ${
                on ? 'bg-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
              style={on ? { color: C.blue, boxShadow: '0 8px 20px -14px rgba(9,20,60,0.7)' } : undefined}
            >
              <Icon size={16} className={on ? '' : 'text-white/60'} style={on ? { color: C.blue } : undefined} />
              {t(key)}
            </button>
          );
        })}
      </nav>

      {summary && (
        <div className="mt-4 rounded-xl bg-white/12 p-3 text-white">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">{t('nav.currentPlan')}</p>
          <p className="mt-1 truncate text-[12px] font-bold">{summary.split}</p>
          <p className="truncate text-[10px] text-white/55">
            {summary.goal} · {summary.kcal} kcal
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${Math.min(100, Math.round((summary.week / 12) * 100))}%` }}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between text-[9px] font-semibold text-white/50">
            <span>{t('nav.weekOf', { n: summary.week })}</span>
            <span>12</span>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-white/15 pt-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">MORE</p>
        <button
          onClick={() => onGo('dashboard')}
          className="mt-2 flex min-h-10 w-full items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-left text-[12.5px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CreditCard size={16} className="text-white/60" />
          {t('plan.title')}
          <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: C.amber }} aria-hidden />
        </button>
        <button
          onClick={onLogout}
          className="flex min-h-10 w-full items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-left text-[12.5px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} className="text-white/60" />
          {t('nav.logout')}
        </button>
      </div>

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5 text-white">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[11px] font-extrabold" style={{ color: C.blue }}>
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-bold">{user.name || user.email.split('@')[0]}</p>
            <p className="truncate text-[9.5px] text-white/55">
              {summary ? `${t('nav.weekOf', { n: summary.week })} / 12` : user.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Account frame: a royal-blue sidebar with a white active pill, a white header
 * bar and a light canvas. Below `lg` the sidebar becomes an off-canvas drawer
 * that opens from the left, with the trigger on that same side.
 */
export const Shell = ({
  user,
  active,
  onNavigate,
  onLogout,
  search,
  title,
  planSummary,
  children,
}: {
  user: User;
  active: Action;
  onNavigate: (action: Action) => void;
  onLogout: () => void;
  search?: React.ReactNode;
  title?: React.ReactNode;
  planSummary?: Summary;
  children: React.ReactNode;
}) => {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const drawerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (drawerRef.current) drawerRef.current.inert = !open;
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (action: Action) => {
    setOpen(false);
    onNavigate(action);
  };

  const section = active === 'plans' ? 'nav.myPlans' : active === 'new' ? 'nav.newPlan' : 'nav.dashboard';
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: C.canvas }}>
      {/* ── Mobile bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-black/5 bg-white px-3 py-2.5 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label={t('nav.openMenu')}
          aria-expanded={open}
          aria-controls="tw-sidebar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"
          style={{ background: C.blue }}
        >
          <Menu size={18} />
        </button>
        <button onClick={() => go('dashboard')} aria-label="TrainWise" className="shrink-0">
          <Logo size={17} />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => go('new')}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-bold text-white"
            style={{ background: C.blue }}
          >
            <Plus size={13} /> {t('nav.newShort')}
          </button>
        </div>
      </header>

      {/* ── Drawer ───────────────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-[#0B1430]/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        ref={drawerRef}
        id="tw-sidebar"
        aria-label={t('nav.menu')}
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto px-4 pb-4 pt-5 text-white transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: C.blue }}
      >
        <Panel
          user={user}
          active={active}
          summary={planSummary ?? null}
          onGo={go}
          onLogout={onLogout}
          onClose={() => setOpen(false)}
        />
      </aside>

      {/* ── Frame ────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside
          className="sticky top-0 hidden h-screen w-[210px] shrink-0 flex-col px-4 py-5 text-white lg:flex"
          style={{ background: C.blue }}
        >
          <Panel user={user} active={active} summary={planSummary ?? null} onGo={go} onLogout={onLogout} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[58px] items-center gap-3 border-b border-black/[0.06] bg-white px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-[13.5px] font-bold" style={{ color: C.ink }}>
                {title ?? t(section)}
              </span>
              <ChevronDown size={14} className="shrink-0 text-[#8A94A6]" />
            </div>
            <div className="ml-auto hidden min-w-0 flex-1 justify-end md:flex md:max-w-[340px]">{search}</div>
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-[12px] font-semibold sm:inline" style={{ color: C.ink }}>
                {user.name || user.email.split('@')[0]}
              </span>
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-[10.5px] font-extrabold text-white"
                style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #7FA6FF 100%)` }}
              >
                {initials}
              </span>
            </div>
          </header>

          <div className="px-4 pb-10 pt-4 sm:px-6 sm:pt-5">{children}</div>
        </div>
      </div>
    </div>
  );
};
