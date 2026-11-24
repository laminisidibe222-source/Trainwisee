import React, { useState } from 'react';
import { Folders, LayoutDashboard, LogOut, Menu, Plus, Sparkles, X } from 'lucide-react';
import { Avatar, Logo } from '../Logo';
import { LanguageToggle, useI18n } from '../../i18n';
import type { User } from '../../lib/api';

/**
 * Account frame for the signed-in app: icon rail + labelled sidebar on desktop,
 * a compact bar + sheet on phones. The layout follows the reference dashboard —
 * the active item is a white tab that merges into the content area.
 */

const RAIL = [
  { id: 'dashboard', icon: LayoutDashboard, key: 'nav.dashboard' as const },
  { id: 'plans', icon: Folders, key: 'nav.myPlans' as const },
  { id: 'new', icon: Sparkles, key: 'nav.newPlan' as const },
];

const LINKS = [
  { id: 'dashboard', icon: LayoutDashboard, key: 'nav.dashboard' as const },
  { id: 'plans', icon: Folders, key: 'nav.myPlans' as const },
  { id: 'new', icon: Plus, key: 'nav.newPlan' as const },
];

type Action = 'dashboard' | 'plans' | 'new';

export const Shell = ({
  user,
  active = 'dashboard',
  onNavigate,
  onLogout,
  search,
  title,
  planSummary,
  children,
}: {
  user: User;
  /** Compact view of the live plan for the sidebar; omitted when there is none. */
  planSummary?: { split: string; goal: string; kcal: number; week: number } | null;
  active?: Action;
  onNavigate: (action: Action) => void;
  onLogout: () => void;
  /** Header search field — owned by the page, because it searches the plan. */
  search?: React.ReactNode;
  /** Shown instead of the search field on pages that are not the dashboard. */
  title?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { t } = useI18n();
  const [sheet, setSheet] = useState(false);
  const initials = (user.name || user.email).trim();

  const go = (action: Action) => {
    setSheet(false);
    onNavigate(action);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F2] text-slate-900">
      {/* ── Desktop frame ─────────────────────────────────────── */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40">
        <nav
          aria-label={t('nav.account')}
          className="flex w-[64px] flex-col items-center gap-1 bg-[#0F172A] py-5"
        >
          {RAIL.map(({ id, icon: Icon, key }) => {
            const on = active === id;
            return (
              <button
                key={id}
                onClick={() => go(id as Action)}
                aria-label={t(key)}
                aria-current={on ? 'page' : undefined}
                className={`relative grid h-11 w-11 place-items-center rounded-2xl transition-colors ${
                  on ? 'bg-white text-[#0F172A]' : 'text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                {on && (
                  <span className="absolute -left-5 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#B6FF3C]" />
                )}
                <Icon size={18} />
              </button>
            );
          })}
        </nav>

        <aside className="flex w-[212px] flex-col bg-[#0F172A] pb-5 pr-3 pt-5">
          <button onClick={() => go('dashboard')} aria-label="TrainWise" className="px-3 text-left">
            <Logo size={18} tone="light" />
          </button>
          <p className="mt-3 font-mono px-3 text-[9px] uppercase tracking-[0.22em] text-white/30">
            {t('nav.workspace')}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            {LINKS.map(({ id, icon: Icon, key }) => {
              const on = active === id;
              return (
                <button
                  key={id}
                  onClick={() => go(id as Action)}
                  aria-current={on ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    on
                      ? 'bg-white text-[#0F172A] shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} className={on ? 'text-[#4D7C0F]' : 'text-white/45'} />
                  <span className="truncate">{t(key)}</span>

                </button>
              );
            })}
          </div>

          {planSummary && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">{t('nav.currentPlan')}</p>
              <p className="mt-1 truncate text-[12px] font-bold text-white">{planSummary.split}</p>
              <p className="truncate text-[10px] text-white/45">
                {planSummary.goal} · {planSummary.kcal} kcal
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#B6FF3C]"
                  style={{ width: `${Math.min(100, Math.round((planSummary.week / 12) * 100))}%` }}
                />
              </div>
              <p className="mt-1 flex items-baseline justify-between text-[9px] font-semibold text-white/40">
                <span>{t('nav.weekOf', { n: planSummary.week })}</span>
                <span>12</span>
              </p>
            </div>
          )}

          <button
            onClick={onLogout}
            className="mt-auto flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} className="text-white/40" />
            {t('nav.logout')}
          </button>
        </aside>
      </div>

      {/* ── Mobile bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-900/8 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => go('dashboard')} aria-label="TrainWise">
          <Logo size={22} />
        </button>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => setSheet((v) => !v)}
            aria-label={sheet ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={sheet}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-800"
          >
            {sheet ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {sheet && (
        <div className="fixed inset-x-0 top-[57px] z-40 border-b border-slate-200 bg-white p-3 shadow-xl lg:hidden">
          {LINKS.map(({ id, icon: Icon, key }) => (
            <button
              key={id}
              onClick={() => go(id as Action)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Icon size={16} className="text-slate-400" />
              {t(key)}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> {t('nav.logout')}
          </button>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="lg:pl-[276px]">
        <header className="sticky top-0 z-30 hidden items-center gap-4 border-b border-slate-900/8 bg-[#F4F5F2]/85 px-6 py-3.5 backdrop-blur lg:flex">
          <div className="min-w-0 flex-1">{search ?? title}</div>
          <LanguageToggle />
          <span className="flex max-w-[200px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Avatar label={initials} size={20} />
            <span className="truncate">{user.name || user.email}</span>
          </span>
          <button
            onClick={() => go('new')}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#B6FF3C] px-4 py-2.5 text-sm font-bold text-[#0F172A] transition-shadow hover:shadow-[0_10px_26px_-10px_rgba(101,163,13,0.9)]"
          >
            <Plus size={15} /> {t('nav.newShort')}
          </button>
        </header>

        <div className="mx-auto max-w-[1240px] px-4 pb-16 pt-4 sm:px-6 sm:pt-6">{children}</div>
      </div>
    </div>
  );
};
