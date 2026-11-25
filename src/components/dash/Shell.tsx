import React from 'react';
import { Folders, LayoutDashboard, LogOut, Menu, Plus, Sparkles, X } from 'lucide-react';
import { Logo } from '../Logo';
import { LanguageToggle, useI18n, type TKey } from '../../i18n';
import type { User } from '../../lib/api';
import { C } from './theme';

type Action = 'dashboard' | 'plans' | 'new';

const LINKS: { id: Action; icon: typeof LayoutDashboard; key: TKey }[] = [
  { id: 'dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { id: 'plans', icon: Folders, key: 'nav.myPlans' },
  { id: 'new', icon: Sparkles, key: 'nav.newPlan' },
];

/** Decorative dotted route map, the reference's nod to a flight map. */
const RouteDots = () => (
  <svg viewBox="0 0 200 90" className="h-[86px] w-full" aria-hidden>
    {Array.from({ length: 7 }).map((_, row) =>
      Array.from({ length: 16 }).map((__, col) => (
        <circle
          key={`${row}-${col}`}
          cx={6 + col * 12.4}
          cy={8 + row * 12.4}
          r="1.15"
          fill="#FFFFFF"
          opacity={0.16 + ((row * 16 + col) % 5) * 0.03}
        />
      )),
    )}
    <path d="M 24 62 C 60 20, 120 26, 168 40" fill="none" stroke={C.mustard} strokeWidth="1.3" strokeDasharray="3 4" opacity="0.85" />
    <circle cx="24" cy="62" r="3.2" fill={C.mustard} />
    <circle cx="168" cy="40" r="3.2" fill={C.mustard} />
  </svg>
);

type Summary = { split: string; goal: string; kcal: number; week: number } | null;

/**
 * The sidebar's contents. Rendered twice: static and sticky on desktop, inside
 * the off-canvas drawer on tablet and phone.
 */
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
  onGo: (action: Action) => void;
  onLogout: () => void;
  onClose?: () => void;
}) => {
  const { t } = useI18n();
  const initials = (user.name || user.email).trim().slice(0, 1).toUpperCase();

  return (
    <>
      {onClose && (
        <button
          onClick={onClose}
          aria-label={t('nav.closeMenu')}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X size={17} />
        </button>
      )}

      <div className="flex flex-col items-center text-center">
        <span className="relative grid h-[76px] w-[76px] place-items-center rounded-full bg-[#334B44] ring-2 ring-[#E9B93B]/70 ring-offset-4 ring-offset-[#3E5A52]">
          <span className="text-2xl font-extrabold text-white">{initials}</span>
        </span>
        <p className="mt-4 max-w-full truncate text-[13px] font-extrabold uppercase tracking-[0.12em]">
          {(user.name || user.email).slice(0, 22)}
        </p>
        <p className="mt-0.5 w-full truncate text-[11px] text-white/45">{user.email}</p>
      </div>

      <nav className="mt-7 flex flex-col gap-1">
        {LINKS.map(({ id, icon: Icon, key }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onGo(id)}
              aria-current={on ? 'page' : undefined}
              className={`flex min-h-10 items-center gap-3 rounded-full px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors ${
                on ? 'bg-white text-[#2F4A42]' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} className={on ? 'text-[#2F4A42]' : 'text-white/50'} />
              {t(key)}
            </button>
          );
        })}
      </nav>

      {summary && (
        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9B93B]">{t('nav.currentPlan')}</p>
          <p className="mt-1.5 truncate text-[13px] font-bold">{summary.split}</p>
          <p className="truncate text-[10.5px] text-white/50">
            {summary.goal} · {summary.kcal} kcal
          </p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#E9B93B]"
              style={{ width: `${Math.min(100, Math.round((summary.week / 12) * 100))}%` }}
            />
          </div>
          <p className="mt-1 flex items-baseline justify-between text-[9.5px] font-semibold text-white/45">
            <span>{t('nav.weekOf', { n: summary.week })}</span>
            <span>12</span>
          </p>
        </div>
      )}

      <div className="mt-auto pt-6">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#E9B93B]">TRAINWISE</p>
        <RouteDots />
        <button
          onClick={onLogout}
          className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-full px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={15} className="text-white/45" />
          {t('nav.logout')}
        </button>
      </div>
    </>
  );
};

/**
 * The account frame: mint canvas, deep-green sidebar and a white content card.
 * Below `lg` the sidebar becomes an off-canvas drawer that slides in from the
 * left, so the menu is always a side panel rather than a dropdown.
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
  /** Header search field — owned by the page, because it searches the plan. */
  search?: React.ReactNode;
  /** Shown instead of the search field on pages that are not the dashboard. */
  title?: React.ReactNode;
  planSummary?: Summary;
  children: React.ReactNode;
}) => {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const drawerRef = React.useRef<HTMLElement | null>(null);

  /* Off-screen links must not be reachable by Tab or screen readers. */
  React.useEffect(() => {
    if (drawerRef.current) drawerRef.current.inert = !open;
  }, [open]);

  /* Drawer conventions: Escape closes, and the page behind it stops scrolling. */
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

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#E7F0EC] text-[#23352F]">
      {/* canvas decoration */}
      <div className="pointer-events-none absolute -left-24 -top-28 h-[320px] w-[320px] rounded-full bg-[#E9B93B]/80" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[300px] w-[300px] rounded-full bg-[#C9DED4]" aria-hidden />
      <div className="pointer-events-none absolute right-[-120px] top-[38%] hidden h-[260px] w-[260px] rounded-full border-[28px] border-white/25 lg:block" aria-hidden />

      {/* ── Mobile bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#3E5A52]/10 bg-[#E7F0EC]/95 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => go('dashboard')} aria-label="TrainWise">
          <Logo size={24} />
        </button>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label={t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="tw-sidebar"
            className="grid h-11 w-11 place-items-center rounded-xl bg-[#3E5A52] text-white"
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      {/* ── Drawer (mobile + tablet) ──────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-[#23352F]/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        ref={drawerRef}
        id="tw-sidebar"
        aria-label={t('nav.menu')}
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[286px] max-w-[86vw] flex-col overflow-y-auto rounded-r-[26px] bg-[#3E5A52] px-5 pb-5 pt-6 text-white shadow-[0_24px_60px_-24px_rgba(35,53,47,0.7)] transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
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

      <div className="relative mx-auto flex max-w-[1560px] gap-5 px-0 pb-6 lg:px-5 lg:py-5">
        {/* ── Sidebar (desktop) ────────────────────────────────── */}
        <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-[268px] shrink-0 flex-col overflow-hidden rounded-[28px] bg-[#3E5A52] px-5 py-6 text-white lg:flex">
          <Panel user={user} active={active} summary={planSummary ?? null} onGo={go} onLogout={onLogout} />
        </aside>

        {/* ── Content card ──────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-40px)] bg-white px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:rounded-[28px] lg:px-7 lg:pb-10 lg:pt-6">
            <header className="mb-5 hidden items-center gap-4 lg:flex">
              <div className="min-w-0 flex-1">{search ?? title}</div>
              <LanguageToggle />
              <button
                onClick={() => go('new')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E9B93B] px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#23352F] transition-shadow hover:shadow-[0_10px_24px_-12px_rgba(233,185,59,0.9)]"
              >
                <Plus size={15} /> {t('nav.newShort')}
              </button>
            </header>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
