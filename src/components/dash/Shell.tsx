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

/**
 * Sidebar content — rendered twice: anchored on desktop, inside the left-hand
 * drawer below `lg`. Dark forest panel, lime active marker, user block pinned
 * to the bottom, exactly like the reference.
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
  onGo: (a: Action) => void;
  onLogout: () => void;
  onClose?: () => void;
}) => {
  const { t } = useI18n();
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Logo size={19} tone="light" />
          <span
            className="grid h-5 w-5 place-items-center rounded-md text-[13px] font-black"
            style={{ background: C.lime, color: C.panel }}
            aria-hidden
          >
            ✳
          </span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={17} />
          </button>
        )}
      </div>

      <p className="mt-7 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/35">{t('nav.menu')}</p>

      <nav className="mt-2 flex flex-col gap-0.5" aria-label={t('nav.menu')}>
        {LINKS.map(({ id, icon: Icon, key }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onGo(id)}
              aria-current={on ? 'page' : undefined}
              className={`relative flex min-h-10 items-center gap-2.5 rounded-lg pl-4 pr-3 py-2 text-left text-[12.5px] font-semibold transition-colors ${
                on ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              {on && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                  style={{ background: C.lime }}
                  aria-hidden
                />
              )}
              <Icon size={16} style={{ color: on ? C.lime : 'rgba(255,255,255,0.45)' }} />
              {t(key)}
            </button>
          );
        })}
      </nav>

      {summary && (
        <div className="mt-4 rounded-xl bg-white/[0.05] p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: C.lime }}>
            {t('nav.currentPlan')}
          </p>
          <p className="mt-1 truncate text-[12px] font-bold text-white">{summary.split}</p>
          <p className="truncate text-[10px] text-white/45">
            {summary.goal} · {summary.kcal} kcal
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full"
              style={{ background: C.lime, width: `${Math.min(100, Math.round((summary.week / 12) * 100))}%` }}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between text-[9px] font-semibold text-white/40">
            <span>{t('nav.weekOf', { n: summary.week })}</span>
            <span>12</span>
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/35">GENERAL</p>
        <button
          onClick={onLogout}
          className="mt-2 flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut size={16} className="text-white/45" />
          {t('nav.logout')}
        </button>
      </div>

      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-extrabold"
            style={{ background: C.lime, color: C.panel }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold text-white">{user.name || user.email.split('@')[0]}</p>
            <p className="truncate text-[10px] text-white/40">{user.email}</p>
          </div>
          <CreditCard size={14} className="shrink-0 text-white/25" />
        </div>
      </div>
    </>
  );
};

/**
 * Account frame: grey canvas, one rounded white app card, dark sidebar and a
 * bordered header row. Below `lg` the sidebar is an off-canvas drawer that
 * opens from the left, and the menu button sits on that same side.
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

  return (
    <div className="min-h-screen bg-[#E8E9E3] text-[#1B241C]">
      {/* ── Mobile bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-black/5 bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label={t('nav.openMenu')}
          aria-expanded={open}
          aria-controls="tw-sidebar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"
          style={{ background: C.panel }}
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
            className="inline-flex items-center gap-1 rounded-full bg-[#16181A] px-3 py-2 text-[11px] font-bold text-white"
          >
            <Plus size={13} /> {t('nav.newShort')}
          </button>
        </div>
      </header>

      {/* ── Drawer ───────────────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-[#0B140D]/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
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
        style={{ background: C.panel }}
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

      {/* ── App card ─────────────────────────────────────────── */}
      <div className="lg:p-5">
        <div className="mx-auto flex w-full max-w-[1480px] overflow-hidden bg-white lg:min-h-[calc(100vh-40px)] lg:rounded-[22px] lg:shadow-[0_30px_70px_-50px_rgba(20,30,20,0.55)]">
          <aside
            className="sticky top-0 hidden h-screen w-[212px] shrink-0 flex-col px-4 py-5 text-white lg:flex lg:h-[calc(100vh-40px)]"
            style={{ background: C.panel }}
          >
            <Panel user={user} active={active} summary={planSummary ?? null} onGo={go} onLogout={onLogout} />
          </aside>

          <div className="min-w-0 flex-1">
            <header className="flex h-[58px] items-center gap-3 border-b border-black/[0.07] px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-[14px] font-extrabold tracking-tight">{title ?? t(section)}</span>
                <ChevronDown size={14} className="shrink-0 text-[#6E7A6B]" />
              </div>
              <div className="ml-auto hidden min-w-0 flex-1 justify-end md:flex md:max-w-[340px]">{search}</div>
              <div className="hidden md:block">
                <LanguageToggle />
              </div>
              <button
                onClick={() => go('new')}
                className="hidden shrink-0 items-center gap-2 rounded-full bg-[#16181A] py-1.5 pl-4 pr-1.5 text-[12px] font-bold text-white transition-transform hover:scale-[1.02] sm:inline-flex"
              >
                {t('nav.newShort')}
                <span
                  className="grid h-7 w-7 place-items-center rounded-full"
                  style={{ background: C.lime, color: C.panel }}
                >
                  <Plus size={14} />
                </span>
              </button>
            </header>

            <div className="px-4 pb-8 pt-4 sm:px-6 sm:pt-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
