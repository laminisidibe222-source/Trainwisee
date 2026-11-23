import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Flame,
  LogOut,
  MoonStar,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Timer,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import { getDashboard, type DashboardData, type SavedBlueprint, type User } from '../lib/api';
import { Avatar, Logo } from './Logo';
import { LanguageToggle, useI18n, type TKey } from '../i18n';

const Stat = ({
  icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
}) => (
  <div className="rounded-2xl border border-slate-200 p-5 bg-white">
    <div className="flex items-center gap-2">
      <span className="w-7 h-7 rounded-lg bg-lime-50 border border-lime-200 text-lime-700 flex items-center justify-center">
        {icon}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
    <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
      {value}
      {unit && <span className="ml-1 text-sm font-semibold text-slate-500">{unit}</span>}
    </p>
    {sub && <p className="mt-1 text-[11px] text-slate-500 leading-snug">{sub}</p>}
  </div>
);

/** Donut for "week 3 of 12" — cheap, and clearer than a percentage in text. */
const WeekDial = ({ week, label, caption }: { week: number; label: string; caption: string }) => {
  const R = 46;
  const C = 2 * Math.PI * R;
  const pct = Math.min(week, 12) / 12;
  return (
    <div className="relative w-[132px] h-[132px] shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#E2E8F0" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="#65A30D"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${C * pct} ${C}`}
        />
        {[1, 2, 3].map((tick) => (
          <circle
            key={tick}
            cx={60 + R * Math.cos((tick / 4) * 2 * Math.PI - Math.PI / 2)}
            cy={60 + R * Math.sin((tick / 4) * 2 * Math.PI - Math.PI / 2)}
            r="2.5"
            fill="#94A3B8"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold tracking-tight tabular-nums">{label}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{caption}</span>
      </div>
    </div>
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
  const { t, tError } = useI18n();

  const load = useCallback(() => {
    setError(null);
    setData(null);
    getDashboard()
      .then(setData)
      .catch((err) => setError({ raw: err instanceof Error ? err.message : null }));
  }, []);

  useEffect(load, [load]);

  const latest = data?.latest ?? null;
  const plan = latest?.plan ?? null;
  const goal = latest?.profile?.goal;
  const firstName = user.name?.split(' ')[0] || '';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const goalLabel = t(goal ? (`goal.${goal}` as TKey) : 'goal.none');
  const weeksIn = latest
    ? Math.min(12, Math.max(1, Math.ceil((Date.now() - new Date(latest.createdAt).getTime()) / (7 * 86_400_000))))
    : 1;

  const openLatest = () => {
    if (!latest || !plan) return;
    onOpenPlan({ id: latest.id, createdAt: latest.createdAt, modelVersion: latest.modelVersion, plan });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white text-slate-900 overflow-x-clip"
    >
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-5 min-w-0 shrink-0">
          <button onClick={onHome} className="flex items-center shrink-0" aria-label="TrainWise home">
            <Logo size={22} />
          </button>
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <span className="px-3 py-2 rounded-full bg-lime-50 text-lime-800 border border-lime-200">
              {t('nav.dashboard')}
            </span>
            <button
              onClick={onOpenPlans}
              className="px-3 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {t('nav.myPlans')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LanguageToggle />
          <span className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 max-w-[190px]">
            <Avatar label={user.name || user.email} size={20} />
            <span className="truncate">{user.name || user.email}</span>
          </span>
          <button
            onClick={onLogout}
            aria-label={t('nav.logout')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all whitespace-nowrap"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">{t('nav.logout')}</span>
          </button>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all whitespace-nowrap"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">{t('nav.new')}</span>
            <span className="sm:hidden">{t('nav.newShort')}</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Spotlight */}
        <section className="relative overflow-hidden rounded-3xl border border-lime-200/70 bg-gradient-to-br from-lime-50 via-white to-cyan-50/50 p-6 sm:p-8 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)]">
          <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-lime-300/20 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col-reverse lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-lime-800">{today}</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                {!data ? (
                  // Do not claim "let's build your plan" while the request is in
                  // flight — this account may already have several.
                  <>{t('dash.greeting1', { name: firstName })}</>
                ) : plan ? (
                  <>
                    {t('dash.greeting1', { name: firstName })} <br className="hidden sm:block" />
                    <span className="text-lime-700">{t('dash.greeting2', { week: weeksIn })}</span>
                  </>
                ) : (
                  <>
                    {t('dash.greetingEmpty1', { name: firstName })} <br className="hidden sm:block" />
                    <span className="text-lime-700">{t('dash.greetingEmpty2')}</span>
                  </>
                )}
              </h1>
              <p className="text-slate-600 max-w-lg text-sm sm:text-base">{plan ? t('dash.sub') : t('dash.subEmpty')}</p>
              {plan && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={openLatest}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all"
                  >
                    {t('dash.openFull')} <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={onNew}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-300 bg-white/70 text-slate-800 font-semibold text-sm hover:bg-white transition-all"
                  >
                    <Plus size={15} /> {t('nav.new')}
                  </button>
                </div>
              )}
            </div>

            {plan && (
              <div className="flex items-center gap-4">
                <WeekDial week={weeksIn} label={t('dash.weekLabel', { n: weeksIn })} caption={t('dash.of12')} />
                <div className="hidden sm:block text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-900">{goalLabel}</p>
                  <p>{plan.trainingPlan.split}</p>
                  <p className="text-lime-800 font-semibold">
                    {plan.nutritionPlan.kcal} kcal · {plan.nutritionPlan.proteinG} g P
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {!data && !error && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[118px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-red-700">{error.raw ? tError(error.raw) : t('plans.error')}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all"
            >
              <RefreshCw size={14} /> {t('plans.retry')}
            </button>
          </div>
        )}

        {data && !plan && (
          <section className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <Dumbbell size={18} />, title: t('dash.tile1.title'), body: t('dash.tile1.body') },
              { icon: <Utensils size={18} />, title: t('dash.tile2.title'), body: t('dash.tile2.body') },
              { icon: <CalendarDays size={18} />, title: t('dash.tile3.title'), body: t('dash.tile3.body') },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 p-5 space-y-2 bg-white">
                <span className="inline-flex w-9 h-9 rounded-xl bg-lime-50 border border-lime-200 text-lime-700 items-center justify-center">
                  {c.icon}
                </span>
                <p className="font-bold text-sm">{c.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
            <div className="sm:col-span-3 rounded-2xl border border-slate-200 p-6 sm:p-8 text-center space-y-4 bg-gradient-to-b from-white to-lime-50/40">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="font-bold text-lg">{t('dash.empty.title')}</p>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">{t('dash.empty.sub')}</p>
              </div>
              <button
                onClick={onNew}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all"
              >
                {t('dash.empty.cta')} <ArrowRight size={16} />
              </button>
              <p className="text-xs text-slate-500">{t('dash.empty.note')}</p>
            </div>
          </section>
        )}

        {plan && (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Stat icon={<Flame size={14} />} label={t('dash.goal')} value={goalLabel} sub={plan.trainingPlan.split} />
              <Stat
                icon={<Utensils size={14} />}
                label={t('dash.kcal')}
                value={plan.nutritionPlan.kcal}
                unit="kcal"
                sub={t('dash.tile.kcalSub', { bmr: plan.nutritionPlan.bmr, tdee: plan.nutritionPlan.tdee })}
              />
              <Stat
                icon={<TrendingUp size={14} />}
                label={t('dash.protein')}
                value={plan.nutritionPlan.proteinG}
                unit="g"
                sub={t('dash.tile.proteinSub', {
                  pct: Math.round((plan.nutritionPlan.proteinG / (plan.nutritionPlan.kcal / 4)) * 100),
                })}
              />
              <Stat
                icon={<Dumbbell size={14} />}
                label={t('dash.sessions')}
                value={plan.trainingPlan.frequency}
                unit={t('dash.perWeek')}
                sub={plan.trainingPlan.split}
              />
            </section>

            <section className="grid lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 rounded-2xl border border-slate-200 p-5 sm:p-6 bg-white">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-lg">{t('dash.split')}</h2>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-500">{plan.trainingPlan.split}</span>
                </div>
                <ul className="mt-4 divide-y divide-slate-100">
                  {plan.trainingPlan.days.map((d, i) => (
                    <li key={d.day + i} className="py-3 flex items-center gap-3">
                      <span
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-lime-100 text-lime-800 border border-lime-200' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{d.focus}</p>
                        <p className="text-xs text-slate-500">
                          {d.day} · {t('dash.exercises', { n: d.exercises.length })}
                        </p>
                      </div>
                      {i === 0 && (
                        <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-lime-800 bg-lime-50 border border-lime-200 rounded-full px-2 py-0.5">
                          {t('dash.startHere')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-slate-200 p-5 sm:p-6 bg-white flex flex-col gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-lime-700">{t('dash.block')}</p>
                  <p className="mt-2 font-bold">
                    {t('dash.weekLabel', { n: weeksIn })} · {plan.roadmap[0]?.focus}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{plan.roadmap[0]?.milestone}</p>
                </div>
                {!!plan.trainingPlan.substitutions?.length && (
                  <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-900">
                    <ShieldAlert size={13} className="mt-0.5 shrink-0" />
                    <span>
                      <span className="font-semibold">{t('dash.adaptedTitle')}</span> ·{' '}
                      {t(
                        plan.trainingPlan.substitutions.length === 1 ? 'dash.adaptedOne' : 'dash.adaptedMany',
                        { n: plan.trainingPlan.substitutions.length }
                      )}
                    </span>
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                    <MoonStar size={13} className="text-lime-700" /> {t('dash.sleep', { n: plan.recoveryPlan.sleepTarget })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                    <Timer size={13} className="text-lime-700" /> {t('dash.deload', { n: plan.recoveryPlan.deloadEveryWeeks })}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {t('dash.nextSession')}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{plan.trainingPlan.days[0]?.focus}</p>
                  <ul className="mt-1.5 space-y-1">
                    {plan.trainingPlan.days[0]?.exercises.slice(0, 3).map((e) => (
                      <li key={e.name} className="flex items-baseline justify-between gap-2 text-[11px] text-slate-600">
                        <span className="truncate">{e.name}</span>
                        <span className="shrink-0 font-mono">
                          {e.sets} × {e.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                  <Flame size={13} className="mt-0.5 shrink-0 text-lime-700" />
                  {plan.recoveryPlan.cardio}
                </p>
                <button
                  onClick={openLatest}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all"
                >
                  {t('dash.openPlan')} <ArrowRight size={15} />
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5 sm:p-6 bg-white">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-bold text-lg">{t('dash.roadmap')}</h2>
                <span className="text-xs text-slate-500">{t('dash.roadmapSub')}</span>
              </div>
              <ol className="mt-5 grid sm:grid-cols-4 gap-3">
                {plan.roadmap.map((w, i) => {
                  const active = i === Math.min(3, Math.floor((weeksIn - 1) / 3));
                  return (
                    <li
                      key={w.weeks}
                      className={`relative rounded-xl border p-4 ${
                        active ? 'border-lime-400 bg-lime-50/60' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">W{w.weeks}</span>
                        {active && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-lime-800 bg-white border border-lime-300 rounded-full px-1.5 py-0.5">
                            {t('dash.blockNow')}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-snug">{w.focus}</p>
                      <p className="mt-1 text-[11px] text-slate-600 leading-snug">{w.milestone}</p>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">{t('dash.history')}</h2>
                <button onClick={onOpenPlans} className="text-sm font-semibold text-lime-800 hover:underline">
                  {t('dash.viewAll', { n: data?.totals.plans ?? 1 })}
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
                <button
                  onClick={openLatest}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-lime-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {t('plans.card.title', { id: latest!.id })} · {goalLabel}
                    </p>
                    <p className="text-xs text-slate-500">{t('dash.updated', { date: new Date(latest!.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) })}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-lime-800 bg-lime-50 border border-lime-200 rounded-full px-2 py-0.5">
                    {t('dash.active')}
                  </span>
                </button>
                {(data?.recent ?? []).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onOpenPlanId(b.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {t('plans.card.title', { id: b.id })} ·{' '}
                        {t(b.goal ? (`goal.${b.goal}` as TKey) : 'goal.none')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(b.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <ArrowRight size={15} className="ml-auto text-slate-400" />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </motion.main>
  );
};
