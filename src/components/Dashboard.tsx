import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Flame,
  MoonStar,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Timer,
  Utensils,
} from 'lucide-react';
import { getDashboard, type DashboardData, type SavedBlueprint, type User } from '../lib/api';
import { planText, useI18n, type TKey } from '../i18n';
import { Shell } from './dash/Shell';
import { PlanSearch } from './dash/PlanSearch';
import { PerformanceBars } from './dash/PerformanceBars';
import { DialGrid } from './dash/DialGrid';
import { SessionTimeline } from './dash/SessionTimeline';
import { dayVolumes, planDials, weeklySets } from './dash/planView';
import type { Plan } from '../types/blueprint';

/**
 * Signed-in home. Layout follows the reference dashboard — icon rail, labelled
 * sidebar, greeting card, a performance chart, a grid of gauges, a week
 * timeline and upcoming blocks — rebuilt with the numbers the plan engine
 * actually produced.
 */

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-3xl border border-slate-900/8 bg-white p-4 sm:p-5 ${className}`}>{children}</section>
);

const CardHead = ({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-[15px] font-bold tracking-tight text-slate-900">{title}</h2>
      {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
    </div>
    {right}
  </div>
);

/** Flat spot illustration: a barbell under a lime arc — no stock 3D character. */
const HeroArt = () => (
  <svg viewBox="0 0 180 120" className="h-[104px] w-auto shrink-0 sm:h-[124px]" aria-hidden>
    <defs>
      <linearGradient id="heroArt" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#B6FF3C" />
        <stop offset="100%" stopColor="#65A30D" />
      </linearGradient>
    </defs>
    <circle cx="120" cy="34" r="40" fill="url(#heroArt)" fillOpacity="0.28" />
    <circle cx="38" cy="86" r="24" fill="#0F172A" fillOpacity="0.06" />
    <g stroke="#0F172A" strokeOpacity="0.12" strokeWidth="1">
      <line x1="6" y1="96" x2="174" y2="96" />
      <line x1="6" y1="104" x2="174" y2="104" />
    </g>
    {/* bar */}
    <rect x="36" y="70" width="108" height="5" rx="2.5" fill="#0F172A" />
    {/* plates */}
    <rect x="52" y="52" width="11" height="41" rx="4" fill="url(#heroArt)" />
    <rect x="66" y="59" width="8" height="27" rx="3" fill="#0F172A" fillOpacity="0.85" />
    <rect x="117" y="52" width="11" height="41" rx="4" fill="url(#heroArt)" />
    <rect x="106" y="59" width="8" height="27" rx="3" fill="#0F172A" fillOpacity="0.85" />
    {/* floating ticks */}
    <circle cx="150" cy="46" r="3" fill="#65A30D" fillOpacity="0.5" />
    <circle cx="28" cy="44" r="2.4" fill="#0F172A" fillOpacity="0.18" />
    <circle cx="160" cy="76" r="2" fill="#0F172A" fillOpacity="0.14" />
  </svg>
);

export const Dashboard = ({
  user,
  onOpenPlan,
  onOpenPlanId,
  onNew,
  onOpenPlans,
  onHome,
  onLogout,
}: {
  user: User;
  /** The newest plan arrives with the dashboard, so no refetch is needed. */
  onOpenPlan: (plan: SavedBlueprint) => void;
  /** Older rows are summaries only and are fetched on demand. */
  onOpenPlanId: (id: number) => void;
  onNew: () => void;
  onOpenPlans: () => void;
  onHome: () => void;
  onLogout: () => void;
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  // Keep the raw message and translate on render: switching language must not
  // trigger a refetch.
  const [error, setError] = useState<{ raw: string | null } | null>(null);
  const { t, tError, lang } = useI18n();

  const load = useCallback(() => {
    setError(null);
    setData(null);
    getDashboard()
      .then(setData)
      .catch((err) => setError({ raw: err instanceof Error ? err.message : null }));
  }, []);

  useEffect(load, [load]);

  const latest = data?.latest ?? null;
  const plan: Plan | null = latest?.plan ?? null;
  const goal = latest?.profile?.goal;
  const firstName = user.name?.split(' ')[0] || '';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const goalLabel = t(goal ? (`goal.${goal}` as TKey) : 'goal.none');
  const weeksIn = latest
    ? Math.min(12, Math.max(1, Math.ceil((Date.now() - new Date(latest.createdAt).getTime()) / (7 * 86_400_000))))
    : 1;

  const days = useMemo(() => (plan ? dayVolumes(plan) : []), [plan]);
  const dials = useMemo(() => (plan ? planDials(plan, weeksIn) : []), [plan, weeksIn]);
  const weekly = weeklySets(days);
  const bestDay = days.length ? days.reduce((a, b) => (b.total > a.total ? b : a), days[0]) : null;
  const sessions = plan?.trainingPlan.frequency ?? days.length;

  const openLatest = useCallback(() => {
    if (!latest || !plan) return;
    onOpenPlan({ id: latest.id, createdAt: latest.createdAt, modelVersion: latest.modelVersion, plan });
  }, [latest, plan, onOpenPlan]);

  const navigate = (action: 'dashboard' | 'plans' | 'new') => {
    if (action === 'dashboard') onHome();
    else if (action === 'plans') onOpenPlans();
    else onNew();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Shell
        user={user}
        active="dashboard"
        onNavigate={navigate}
        onLogout={onLogout}
        search={<PlanSearch plan={plan} onOpen={openLatest} />}
        planSummary={
          plan
            ? { split: plan.trainingPlan.split, goal: goalLabel, kcal: plan.nutritionPlan.kcal, week: weeksIn }
            : null
        }
      >
        {/* ── loading ─────────────────────────────────────────── */}
        {!data && !error && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_332px]">
            <div className="space-y-4">
              <div className="h-[152px] animate-pulse rounded-3xl border border-slate-900/8 bg-white" />
              <div className="h-[286px] animate-pulse rounded-3xl border border-slate-900/8 bg-white" />
              <div className="h-[188px] animate-pulse rounded-3xl border border-slate-900/8 bg-white" />
            </div>
            <div className="space-y-4">
              <div className="h-[320px] animate-pulse rounded-3xl border border-slate-900/8 bg-white" />
              <div className="h-[180px] animate-pulse rounded-3xl border border-slate-900/8 bg-white" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error.raw ? tError(error.raw) : t('plans.error')}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <RefreshCw size={14} /> {t('plans.retry')}
            </button>
          </div>
        )}

        {/* ── empty account ───────────────────────────────────── */}
        {data && !plan && (
          <div className="space-y-4">
            <section className="relative overflow-hidden rounded-3xl border border-slate-900/8 bg-white p-6 sm:p-8">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#B6FF3C]/25 blur-3xl" />
              <div className="relative flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-lg">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4D7C0F]">{today}</p>
                  <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    {t('dash.greetingEmpty1', { name: firstName })} {t('dash.greetingEmpty2')}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">{t('dash.subEmpty')}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={onNew}
                      className="inline-flex items-center gap-2 rounded-full bg-[#B6FF3C] px-5 py-2.5 text-sm font-bold text-[#0F172A] transition-shadow hover:shadow-[0_10px_26px_-10px_rgba(101,163,13,0.9)]"
                    >
                      {t('dash.empty.cta')} <ArrowRight size={15} />
                    </button>
                    <button
                      onClick={onOpenPlans}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {t('nav.myPlans')}
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">{t('dash.empty.note')}</p>
                </div>
                <HeroArt />
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: <Dumbbell size={17} />, title: t('dash.tile1.title'), body: t('dash.tile1.body') },
                { icon: <Utensils size={17} />, title: t('dash.tile2.title'), body: t('dash.tile2.body') },
                { icon: <CalendarDays size={17} />, title: t('dash.tile3.title'), body: t('dash.tile3.body') },
              ].map((c) => (
                <Card key={c.title} className="space-y-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-[#4D7C0F]">
                    {c.icon}
                  </span>
                  <p className="text-sm font-bold">{c.title}</p>
                  <p className="text-xs leading-relaxed text-slate-600">{c.body}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── dashboard ───────────────────────────────────────── */}
        {plan && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_332px]">
            <div className="min-w-0 space-y-4">
              {/* greeting */}
              <section className="relative overflow-hidden rounded-3xl border border-slate-900/8 bg-[#EDF0E9] p-5 sm:p-6">
                <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#B6FF3C]/30 blur-3xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4D7C0F]">{today}</p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-[32px]">
                      {t('hero.hello', { name: firstName })}
                    </h1>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
                      {t('hero.body', { n: sessions, focus: planText(lang, days[0]?.focus ?? plan.trainingPlan.split) })}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={openLatest}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1B2437]"
                      >
                        {t('dash.openFull')} <ArrowUpRight size={13} />
                      </button>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                        <Flame size={12} className="text-[#4D7C0F]" /> {goalLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                        <MoonStar size={12} className="text-[#4D7C0F]" />
                        {t('dash.sleep', { n: plan.recoveryPlan.sleepTarget })}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <HeroArt />
                  </div>
                </div>
              </section>

              {!!plan.trainingPlan.substitutions?.length && (
                <div className="flex items-start gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-amber-900">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="font-bold">{t('dash.adaptedTitle')}</span> ·{' '}
                    {t(plan.trainingPlan.substitutions.length === 1 ? 'dash.adaptedOne' : 'dash.adaptedMany', {
                      n: plan.trainingPlan.substitutions.length,
                    })}
                  </span>
                </div>
              )}

              {/* performance */}
              <Card>
                <CardHead
                  title={t('perf.title')}
                  sub={t('perf.sub', { n: days.length })}
                  right={
                    <span className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                      {plan.trainingPlan.split}
                    </span>
                  }
                />
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-end gap-2">
                    <span className="text-[42px] font-extrabold leading-none tracking-tight tabular-nums">
                      {weekly}
                    </span>
                    <span className="pb-1 text-xs font-semibold text-slate-500">{t('perf.weekly')}</span>
                  </div>
                  {bestDay && (
                    <p className="text-[11px] text-slate-500">
                      {t('perf.best')} · <span className="font-bold text-slate-800">{bestDay.day}</span> ·{' '}
                      {bestDay.total} {t('perf.setsShort')}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  <PerformanceBars days={days} />
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#0F172A]" /> {t('perf.primary')}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#65A30D]" /> {t('perf.accessory')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                      <span className="h-px w-3 border-t border-dashed border-[#65A30D]" />
                      {t('perf.avg', { n: Math.round(weekly / (days.length || 1)) })}
                    </span>
                  </div>
                  <button
                    onClick={openLatest}
                    className="-my-1 inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap px-1 text-[11px] font-bold text-[#4D7C0F] hover:underline"
                  >
                    {t('perf.all')} <ArrowRight size={12} />
                  </button>
                </div>
              </Card>

              {/* numbers */}
              <Card>
                <CardHead title={t('dial.title')} sub={t('dial.sub')} />
                <div className="mt-3">
                  <DialGrid dials={dials} />
                </div>
              </Card>

              {/* split */}
              <Card>
                <CardHead
                  title={t('split.title')}
                  sub={plan.trainingPlan.split}
                  right={
                    <button
                      onClick={openLatest}
                      className="-my-1 inline-flex min-h-9 shrink-0 items-center px-1 text-[11px] font-bold text-[#4D7C0F] hover:underline"
                    >
                      {t('split.see')}
                    </button>
                  }
                />
                <ul className="mt-3 divide-y divide-slate-100">
                  {days.map((d, i) => (
                    <li key={d.day + i}>
                      <button
                        onClick={openLatest}
                        className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-slate-50/70"
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-extrabold ${
                            i === 0 ? 'bg-[#B6FF3C] text-[#0F172A]' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-900">
                            {d.day} · {planText(lang, d.focus)}
                          </span>
                          <span className="block text-[11px] leading-relaxed text-slate-500">
                            {t('dash.exercises', { n: d.exercises })} · {d.total} {t('perf.setsShort')}
                            <span className="hidden sm:inline"> · ~{d.minutes} min</span>
                          </span>
                        </span>
                        {i === 0 && (
                          <span
                            className="hidden shrink-0 rounded-full border border-lime-300 bg-lime-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4D7C0F] sm:inline"
                            title={t('dash.startHere')}
                          >
                            {t('dash.startHere')}
                          </span>
                        )}
                        <span className="hidden shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 sm:inline">
                          {d.total} {t('perf.setsShort')}
                        </span>
                        <ArrowRight size={14} className="shrink-0 text-slate-300" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* right column */}
            <div className="min-w-0 space-y-4 xl:sticky xl:top-[76px] xl:self-start">
              <Card>
                <CardHead
                  title={t('week.title')}
                  sub={t('week.sub', { n: days.length })}
                  right={
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      <Timer size={11} /> {t('week.duration', { n: days.reduce((a, d) => a + d.minutes, 0) })}
                    </span>
                  }
                />
                <SessionTimeline days={days} onOpen={openLatest} />
              </Card>

              <Card>
                <CardHead
                  title={t('blocks.title')}
                  right={
                    <button onClick={openLatest} className="shrink-0 text-[11px] font-bold text-[#4D7C0F] hover:underline">
                      {t('blocks.seeAll')}
                    </button>
                  }
                />
                <ul className="mt-3 space-y-2">
                  {plan.roadmap.slice(1, 3).map((w) => (
                    <li key={w.weeks}>
                      <button
                        onClick={openLatest}
                        className="w-full rounded-2xl border border-slate-200 bg-[#FAFBF8] p-3 text-left transition-colors hover:border-lime-300"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#4D7C0F]">
                            {t('blocks.weeks', { range: w.weeks })}
                          </p>
                          <ArrowUpRight size={13} className="text-slate-400" />
                        </div>
                        <p className="mt-1 text-[13px] font-bold leading-snug text-slate-900">{w.focus}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">{planText(lang, w.milestone)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 rounded-2xl border border-slate-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('dash.blockNow')}</p>
                  <p className="mt-1 text-[13px] font-bold text-slate-900">
                    {plan.roadmap[0]?.focus ?? plan.trainingPlan.split}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                    {planText(lang, plan.roadmap[0]?.milestone ?? '')}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600">
                      <MoonStar size={10} className="text-[#4D7C0F]" /> {t('dash.sleep', { n: plan.recoveryPlan.sleepTarget })}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600">
                      <Timer size={10} className="text-[#4D7C0F]" /> {t('dash.deload', { n: plan.recoveryPlan.deloadEveryWeeks })}
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHead
                  title={t('dash.history')}
                  right={
                    (data?.totals.plans ?? 0) > 1 ? (
                      <button
                        onClick={onOpenPlans}
                        className="-my-1 inline-flex min-h-9 shrink-0 items-center px-1 text-[11px] font-bold text-[#4D7C0F] hover:underline"
                      >
                        {t('dash.viewAll', { n: data?.totals.plans ?? 1 })}
                      </button>
                    ) : undefined
                  }
                />
                <ul className="mt-3 space-y-1.5">
                  <li>
                    <button
                      onClick={openLatest}
                      className="flex w-full items-center gap-2.5 rounded-2xl bg-[#F4F5F2] px-3 py-2.5 text-left hover:bg-slate-100"
                    >
                      <CheckCircle2 size={14} className="shrink-0 text-[#4D7C0F]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold text-slate-900">
                          {t('history.row', { id: latest!.id, goal: goalLabel })}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {t('dash.updated', {
                            date: new Date(latest!.createdAt).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                            }),
                          })}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-lime-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4D7C0F]">
                        {t('dash.active')}
                      </span>
                    </button>
                  </li>
                  {(data?.recent ?? []).map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => onOpenPlanId(b.id)}
                        className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left hover:bg-[#F4F5F2]"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-slate-700">
                            {t('history.row', {
                              id: b.id,
                              goal: t(b.goal ? (`goal.${b.goal}` as TKey) : 'goal.none'),
                            })}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {new Date(b.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </span>
                        </span>
                        <ArrowRight size={13} className="shrink-0 text-slate-300" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <CardHead
                  title={t('meals.title')}
                  sub={t('meals.sub', { n: plan.nutritionPlan.meals.length })}
                  right={
                    <span className="shrink-0 rounded-full bg-[#F4F5F2] px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {plan.nutritionPlan.kcal} kcal
                    </span>
                  }
                />
                <ul className="mt-3 space-y-1.5">
                  {plan.nutritionPlan.meals.slice(0, 4).map((m) => (
                    <li key={m.name} className="flex items-baseline justify-between gap-2 rounded-xl bg-[#FAFBF8] px-3 py-2">
                      <span className="min-w-0 truncate text-[12px] font-semibold text-slate-800">
                        {planText(lang, m.name)}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] font-bold text-slate-500">
                        {m.kcal} kcal · {m.proteinG} g
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <div className="rounded-3xl bg-[#0F172A] p-4 text-white">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#B6FF3C]">
                  <Sparkles size={11} /> {t('side.tipTitle')}
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/65">{planText(lang, plan.recoveryPlan.cardio)}</p>
                <button
                  onClick={onNew}
                  className="mt-3 w-full rounded-full bg-[#B6FF3C] px-3 py-2 text-xs font-bold text-[#0F172A]"
                >
                  {t('nav.new')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Shell>
    </motion.div>
  );
};
