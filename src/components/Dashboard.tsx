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
} from 'lucide-react';
import { getDashboard, type DashboardData, type SavedBlueprint, type User } from '../lib/api';
import { planText, useI18n, type TKey } from '../i18n';
import { Shell } from './dash/Shell';
import { PlanSearch } from './dash/PlanSearch';
import { PerformanceBars } from './dash/PerformanceBars';
import { ShareDonut } from './dash/ShareDonut';
import { WeeklyArea } from './dash/WeeklyArea';
import { SessionTimeline } from './dash/SessionTimeline';
import { dayVolumes, weeklySets } from './dash/planView';
import { C } from './dash/theme';
import type { Plan } from '../types/blueprint';

/**
 * Signed-in home, rebuilt to the reference dashboard: mint canvas, floating
 * white card, three stat cards (one mustard, two deep green), a sessions table
 * with a bar chart beside it, then macro-share donut and week-profile chart.
 * Every number comes from the plan the engine produced.
 */

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-[18px] border border-[#3E5A52]/10 bg-white p-4 sm:p-5 ${className}`}>{children}</section>
);

const CardHead = ({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-[15px] font-extrabold tracking-tight text-[#23352F]">{title}</h2>
      {sub && <p className="mt-0.5 text-[11px] text-[#6B7F78]">{sub}</p>}
    </div>
    {right}
  </div>
);

/** Small line-art marks that sit in the stat cards, echoing the reference. */
const BarbellArt = ({ tone }: { tone: 'dark' | 'light' }) => {
  const stroke = tone === 'dark' ? 'rgba(35,53,47,0.35)' : 'rgba(255,255,255,0.5)';
  const plate = tone === 'dark' ? 'rgba(35,53,47,0.18)' : 'rgba(255,255,255,0.22)';
  return (
    <svg viewBox="0 0 120 72" className="h-[64px] w-[104px]" aria-hidden>
      <g stroke={stroke} strokeWidth="1.2" fill="none">
        <path d="M6 58 C 34 34, 66 30, 114 44" />
        <path d="M6 66 C 40 46, 78 42, 114 54" opacity="0.6" />
      </g>
      <rect x="22" y="42" width="74" height="4" rx="2" fill={stroke} />
      <rect x="34" y="30" width="8" height="28" rx="3" fill={plate} />
      <rect x="45" y="36" width="6" height="16" rx="2" fill={plate} />
      <rect x="76" y="30" width="8" height="28" rx="3" fill={plate} />
      <rect x="68" y="36" width="6" height="16" rx="2" fill={plate} />
    </svg>
  );
};

const GridArt = ({ tone }: { tone: 'dark' | 'light' }) => {
  const dot = tone === 'dark' ? 'rgba(35,53,47,0.22)' : 'rgba(255,255,255,0.28)';
  return (
    <svg viewBox="0 0 96 64" className="h-[56px] w-[84px]" aria-hidden>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <circle key={`${r}-${c}`} cx={10 + c * 19} cy={12 + r * 13} r="1.6" fill={dot} />
        )),
      )}
      <path d="M 10 52 C 40 18, 62 30, 86 16" fill="none" stroke={C.mustard} strokeWidth="1.4" strokeDasharray="3 3" />
    </svg>
  );
};

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
  onOpenPlan: (plan: SavedBlueprint) => void;
  onOpenPlanId: (id: number) => void;
  onNew: () => void;
  onOpenPlans: () => void;
  onHome: () => void;
  onLogout: () => void;
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
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
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
  const today = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });

  const goalLabel = t(goal ? (`goal.${goal}` as TKey) : 'goal.none');
  const weeksIn = latest
    ? Math.min(12, Math.max(1, Math.ceil((Date.now() - new Date(latest.createdAt).getTime()) / (7 * 86_400_000))))
    : 1;

  const days = useMemo(() => (plan ? dayVolumes(plan) : []), [plan]);
  const weekly = weeklySets(days);
  const sessions = plan?.trainingPlan.frequency ?? days.length;
  const weekMinutes = days.reduce((a, d) => a + d.minutes, 0);

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
            ? {
                split: planText(lang, plan.trainingPlan.split),
                goal: goalLabel,
                kcal: plan.nutritionPlan.kcal,
                week: weeksIn,
              }
            : null
        }
      >
        {!data && !error && (
          <div className="space-y-4">
            <div className="h-8 w-56 animate-pulse rounded-full bg-[#E7F0EC]" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[116px] animate-pulse rounded-[18px] bg-[#E7F0EC]" />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
              <div className="h-[280px] animate-pulse rounded-[18px] bg-[#E7F0EC]" />
              <div className="h-[280px] animate-pulse rounded-[18px] bg-[#E7F0EC]" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#B23B2E]/25 bg-[#FBEDEA] p-4">
            <p className="text-sm text-[#8E2F24]">{error.raw ? tError(error.raw) : t('plans.error')}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#B23B2E]/30 px-4 py-2 text-sm font-semibold text-[#8E2F24] hover:bg-white"
            >
              <RefreshCw size={14} /> {t('plans.retry')}
            </button>
          </div>
        )}

        {/* ── empty account ───────────────────────────────────── */}
        {data && !plan && (
          <div className="space-y-4">
            <section className="relative overflow-hidden rounded-[18px] bg-[#3E5A52] p-6 text-white sm:p-8">
              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#E9B93B]/30 blur-3xl" />
              <div className="relative max-w-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#E9B93B]">{today}</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t('dash.greetingEmpty1', { name: firstName })} {t('dash.greetingEmpty2')}
                </h1>
                <p className="mt-2 text-sm text-white/70">{t('dash.subEmpty')}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={onNew}
                    className="inline-flex items-center gap-2 rounded-full bg-[#E9B93B] px-5 py-2.5 text-sm font-extrabold text-[#23352F]"
                  >
                    {t('dash.empty.cta')} <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={onOpenPlans}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {t('nav.myPlans')}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-white/45">{t('dash.empty.note')}</p>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: <Dumbbell size={17} />, title: t('dash.tile1.title'), body: t('dash.tile1.body') },
                { icon: <Flame size={17} />, title: t('dash.tile2.title'), body: t('dash.tile2.body') },
                { icon: <CalendarDays size={17} />, title: t('dash.tile3.title'), body: t('dash.tile3.body') },
              ].map((c) => (
                <Card key={c.title} className="space-y-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7F0EC] text-[#3E5A52]">
                    {c.icon}
                  </span>
                  <p className="text-sm font-bold">{c.title}</p>
                  <p className="text-xs leading-relaxed text-[#6B7F78]">{c.body}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── dashboard ───────────────────────────────────────── */}
        {plan && (
          <div className="space-y-4">
            {/* greeting line */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7F78]">{today}</p>
                <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">
                  {t('hero.hello', { name: firstName })}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F0EC] px-3 py-1.5 text-[11px] font-bold text-[#2F4A42]">
                  <Flame size={12} /> {goalLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F0EC] px-3 py-1.5 text-[11px] font-bold text-[#2F4A42]">
                  <MoonStar size={12} /> {t('dash.sleep', { n: plan.recoveryPlan.sleepTarget })}
                </span>
                <button
                  onClick={openLatest}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#3E5A52] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-[#334B44]"
                >
                  {t('dash.openFull')} <ArrowUpRight size={13} />
                </button>
              </div>
            </div>

            {!!plan.trainingPlan.substitutions?.length && (
              <div className="flex items-start gap-2 rounded-[14px] border border-[#E9B93B]/45 bg-[#FBF3DC] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#7A5A08]">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                <span>
                  <span className="font-bold">{t('dash.adaptedTitle')}</span> ·{' '}
                  {t(plan.trainingPlan.substitutions.length === 1 ? 'dash.adaptedOne' : 'dash.adaptedMany', {
                    n: plan.trainingPlan.substitutions.length,
                  })}
                </span>
              </div>
            )}

            {/* row 1 — stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <section className="relative overflow-hidden rounded-[18px] bg-[#E9B93B] p-4 sm:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#23352F]/70">{t('dash.kcalDay')}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[30px] font-extrabold leading-none tracking-tight text-[#23352F] tabular-nums">
                    {plan.nutritionPlan.kcal}
                  </span>
                  <span className="text-[12px] font-bold text-[#23352F]/60">kcal</span>
                </p>
                <p className="relative mt-1 max-w-[74%] text-[10.5px] font-bold text-[#23352F]/70">
                  {plan.nutritionPlan.proteinG} g {t('dial.protein').toLowerCase()} · {plan.nutritionPlan.carbsG} g{' '}
                  {t('dial.carbs').toLowerCase()}
                </p>
                <div className="pointer-events-none absolute -right-3 bottom-1 opacity-45">
                  <BarbellArt tone="dark" />
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[18px] bg-[#3E5A52] p-4 text-white sm:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">{t('dash.sessionsCard')}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[30px] font-extrabold leading-none tracking-tight tabular-nums">{sessions}</span>
                  <span className="text-[12px] font-bold text-white/50">/ {t('dash.perWeek')}</span>
                </p>
                <p className="mt-1 text-[10.5px] font-semibold text-white/45">
                  {weekMinutes} min · {planText(lang, plan.trainingPlan.split)}
                </p>
                <div className="pointer-events-none absolute -right-1 bottom-0">
                  <GridArt tone="light" />
                </div>
              </section>

              <section className="relative overflow-hidden rounded-[18px] bg-[#334B44] p-4 text-white sm:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">{t('dash.setsWeek')}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[30px] font-extrabold leading-none tracking-tight tabular-nums">{weekly}</span>
                  <span className="text-[12px] font-bold text-white/50">{t('perf.setsShort')}</span>
                </p>
                <p className="mt-1 text-[10.5px] font-semibold text-white/45">
                  {t('nav.weekOf', { n: weeksIn })} / 12
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#E9B93B]"
                    style={{ width: `${Math.min(100, Math.round((weeksIn / 12) * 100))}%` }}
                  />
                </div>
              </section>
            </div>

            {/* row 2 — sessions table + statistics */}
            <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
              <Card>
                <CardHead
                  title={t('week.title')}
                  sub={t('week.sub', { n: days.length })}
                  right={
                    <button
                      onClick={openLatest}
                      className="-my-1 inline-flex min-h-8 shrink-0 items-center gap-1 px-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2F4A42] hover:underline"
                    >
                      {t('perf.all')} <ArrowRight size={12} />
                    </button>
                  }
                />

                <div className="mt-3 hidden grid-cols-[1.5fr_1fr_0.7fr_0.7fr] gap-2 border-b border-dashed border-[#3E5A52]/15 pb-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#6B7F78] sm:grid">
                  <span>{t('dash.col.session')}</span>
                  <span>{t('dash.col.focus')}</span>
                  <span className="text-center">{t('dash.col.sets')}</span>
                  <span className="text-right">{t('dash.col.time')}</span>
                </div>

                <ul className="mt-1">
                  {days.map((d, i) => (
                    <li key={d.day + i}>
                      <button
                        onClick={openLatest}
                        className="grid w-full grid-cols-[1fr_auto] items-center gap-2 border-b border-dashed border-[#3E5A52]/10 py-2.5 text-left transition-colors last:border-0 hover:bg-[#F3F7F5] sm:grid-cols-[1.5fr_1fr_0.7fr_0.7fr]"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${
                              i === 0 ? 'bg-[#E9B93B] text-[#23352F]' : 'bg-[#E7F0EC] text-[#3E5A52]'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[12.5px] font-bold text-[#23352F]">{d.day}</span>
                            <span className="block truncate text-[10px] text-[#6B7F78] sm:hidden">
                              {planText(lang, d.focus)} · {t('dash.exercises', { n: d.exercises })}
                            </span>
                          </span>
                        </span>
                        <span className="hidden truncate text-[11px] font-semibold text-[#6B7F78] sm:block">
                          {planText(lang, d.focus)}
                        </span>
                        <span className="hidden text-center text-[11px] font-extrabold tabular-nums text-[#2F4A42] sm:block">
                          {d.total}
                        </span>
                        <span className="text-right text-[11px] font-semibold tabular-nums text-[#6B7F78]">
                          ~{d.minutes}′
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <CardHead
                  title={t('perf.title')}
                  sub={t('perf.sub', { n: days.length })}
                  right={
                    <span className="shrink-0 rounded-full bg-[#E7F0EC] px-2.5 py-1 text-[10px] font-extrabold text-[#2F4A42]">
                      {weekly} {t('perf.setsShort')}
                    </span>
                  }
                />
                <div className="mt-3">
                  <PerformanceBars days={days} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-dashed border-[#3E5A52]/10 pt-2.5 text-[10.5px] font-semibold text-[#6B7F78]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#3E5A52]" /> {t('perf.primary')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#E9B93B]" /> {t('perf.accessory')}
                  </span>
                </div>
              </Card>
            </div>

            {/* row 3 — macro share + week profile */}
            <div className="grid gap-4 xl:grid-cols-[1fr_1.55fr]">
              <Card>
                <CardHead title={t('share.title')} sub={t('share.sub')} />
                <div className="mt-4">
                  <ShareDonut
                    proteinG={plan.nutritionPlan.proteinG}
                    carbsG={plan.nutritionPlan.carbsG}
                    fatG={plan.nutritionPlan.fatG}
                    kcal={plan.nutritionPlan.kcal}
                  />
                </div>
              </Card>

              <Card>
                <CardHead
                  title={t('area.title')}
                  sub={t('area.sub')}
                  right={
                    <span className="hidden shrink-0 items-center gap-1 rounded-full border border-[#3E5A52]/15 px-2.5 py-1 text-[10px] font-bold text-[#6B7F78] sm:inline-flex">
                      <Timer size={11} /> {t('week.duration', { n: weekMinutes })}
                    </span>
                  }
                />
                <div className="mt-3">
                  <WeeklyArea days={days} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-dashed border-[#3E5A52]/10 pt-2.5 text-[10.5px] font-semibold text-[#6B7F78]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#3E5A52]" /> {t('perf.primary')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#E9B93B]" /> {t('perf.accessory')}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[#E9B93B]" /> {t('dash.today')}
                  </span>
                </div>
              </Card>
            </div>

            {/* row 4 — timeline, blocks, meals, history */}
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHead title={t('split.title')} sub={planText(lang, plan.trainingPlan.split)} />
                <SessionTimeline days={days} onOpen={openLatest} />
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHead
                    title={t('blocks.title')}
                    right={
                      <button
                        onClick={openLatest}
                        className="-my-1 inline-flex min-h-8 shrink-0 items-center px-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2F4A42] hover:underline"
                      >
                        {t('blocks.seeAll')}
                      </button>
                    }
                  />
                  <ul className="mt-3 space-y-2">
                    {plan.roadmap.slice(1, 3).map((w) => (
                      <li key={w.weeks}>
                        <button
                          onClick={openLatest}
                          className="w-full rounded-[14px] bg-[#F3F7F5] p-3 text-left transition-colors hover:bg-[#E7F0EC]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#8A6A0A]">
                              {t('blocks.weeks', { range: w.weeks })}
                            </p>
                            <ArrowUpRight size={13} className="text-[#6B7F78]" />
                          </div>
                          <p className="mt-1 text-[13px] font-bold leading-snug text-[#23352F]">
                            {planText(lang, w.focus)}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#6B7F78]">
                            {planText(lang, w.milestone)}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <CardHead
                    title={t('meals.title')}
                    sub={t('meals.sub', { n: plan.nutritionPlan.meals.length })}
                  />
                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {plan.nutritionPlan.meals.slice(0, 4).map((m) => (
                      <li
                        key={m.name}
                        className="flex items-baseline justify-between gap-2 rounded-xl bg-[#F3F7F5] px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-[12px] font-semibold text-[#23352F]">
                          {planText(lang, m.name)}
                        </span>
                        <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#6B7F78]">
                          {m.kcal} kcal · {m.proteinG} g
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>

            {/* row 5 — history + cardio */}
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHead
                  title={t('dash.history')}
                  right={
                    (data?.totals.plans ?? 0) > 1 ? (
                      <button
                        onClick={onOpenPlans}
                        className="-my-1 inline-flex min-h-8 shrink-0 items-center px-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#2F4A42] hover:underline"
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
                      className="flex w-full items-center gap-2.5 rounded-[14px] bg-[#F3F7F5] px-3 py-2.5 text-left hover:bg-[#E7F0EC]"
                    >
                      <CheckCircle2 size={14} className="shrink-0 text-[#2F4A42]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold text-[#23352F]">
                          {t('history.row', { id: latest!.id, goal: goalLabel })}
                        </span>
                        <span className="block text-[10px] text-[#6B7F78]">
                          {t('dash.updated', {
                            date: new Date(latest!.createdAt).toLocaleDateString(locale, {
                              day: 'numeric',
                              month: 'short',
                            }),
                          })}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-[#E9B93B] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#23352F]">
                        {t('dash.active')}
                      </span>
                    </button>
                  </li>
                  {(data?.recent ?? []).map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => onOpenPlanId(b.id)}
                        className="flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left hover:bg-[#F3F7F5]"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9DED4]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-[#23352F]">
                            {t('history.row', {
                              id: b.id,
                              goal: t(b.goal ? (`goal.${b.goal}` as TKey) : 'goal.none'),
                            })}
                          </span>
                          <span className="block text-[10px] text-[#6B7F78]">
                            {new Date(b.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                          </span>
                        </span>
                        <ArrowRight size={13} className="shrink-0 text-[#C9DED4]" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              <section className="relative overflow-hidden rounded-[18px] bg-[#3E5A52] p-5 text-white">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#E9B93B]/25 blur-2xl" />
                <p className="relative inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#E9B93B]">
                  <Sparkles size={11} /> {t('side.tipTitle')}
                </p>
                <p className="relative mt-2 text-sm leading-relaxed text-white/75">
                  {planText(lang, plan.recoveryPlan.cardio)}
                </p>
                <div className="relative mt-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white">
                    <MoonStar size={10} /> {t('dash.sleep', { n: plan.recoveryPlan.sleepTarget })}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white">
                    <Timer size={10} /> {t('dash.deload', { n: plan.recoveryPlan.deloadEveryWeeks })}
                  </span>
                </div>
                <button
                  onClick={onNew}
                  className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#E9B93B] px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#23352F]"
                >
                  {t('nav.newPlan')} <ArrowRight size={13} />
                </button>
              </section>
            </div>
          </div>
        )}
      </Shell>
    </motion.div>
  );
};
