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
  Timer,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import { getDashboard, type DashboardData, type SavedBlueprint, type User } from '../lib/api';
import { Avatar, Logo } from './Logo';

const GOAL_LABEL: Record<string, string> = {
  lose_fat: 'Fat loss',
  build_muscle: 'Build muscle',
  recomp: 'Recomposition',
  athletic_performance: 'Performance',
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

const Stat = ({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}) => (
  <div className="rounded-2xl border border-slate-200 p-5 bg-white">
    <div className="flex items-center gap-2 text-slate-500">
      <span className="text-lime-700">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
    <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
      {value}
      {unit && <span className="ml-1 text-sm font-semibold text-slate-500">{unit}</span>}
    </p>
  </div>
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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setData(null);
    getDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your dashboard.'));
  }, []);

  useEffect(load, [load]);

  const latest = data?.latest ?? null;
  const plan = latest?.plan ?? null;
  const goal = latest?.profile?.goal;
  const firstName = user.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

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
        <div className="flex items-center gap-5 min-w-0">
          <button onClick={onHome} className="flex items-center shrink-0" aria-label="TrainWise home">
            <Logo size={22} />
          </button>
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <span className="px-3 py-2 rounded-full bg-lime-50 text-lime-800 border border-lime-200">Dashboard</span>
            <button
              onClick={onOpenPlans}
              className="px-3 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              My plans
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPlans}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all"
          >
            <CalendarDays size={15} />
            <span className="hidden xs:inline">Plans</span>
          </button>
          <span className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 max-w-[200px]">
            <Avatar label={user.name || user.email} size={20} />
            <span className="truncate">{user.name || user.email}</span>
          </span>
          <button
            onClick={onLogout}
            aria-label="Log out"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all whitespace-nowrap"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Log out</span>
          </button>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all whitespace-nowrap"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New blueprint</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">{today}</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
              Hi {firstName}, <span className="text-lime-700">here's your plan</span>
            </h1>
            <p className="mt-2 text-slate-600 max-w-xl">
              {plan
                ? 'Your numbers, this week’s split and the current block — all in one place.'
                : 'Build a blueprint and this page becomes your training home.'}
            </p>
          </div>
          {plan && (
            <button
              onClick={openLatest}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300 text-slate-800 font-semibold text-sm hover:border-lime-500/60 hover:bg-lime-50/50 transition-all"
            >
              Open full blueprint <ArrowRight size={16} />
            </button>
          )}
        </header>

        {!data && !error && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[104px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {data && !plan && (
          <div className="rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
              <Sparkles size={26} />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold">Your dashboard is waiting for a blueprint</p>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Four short steps — goal, training, food, timing — and you get a full split, macro targets and a
                12-week roadmap here.
              </p>
            </div>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all"
            >
              Build my blueprint <ArrowRight size={16} />
            </button>
            <p className="text-xs text-slate-500">About 90 seconds — no card, no equipment list to guess at.</p>
          </div>
        )}

        {data && !plan && (
          <section className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Dumbbell size={18} />,
                title: 'A split you can run',
                body: 'Built from your equipment, experience and days per week — not a template that assumes a full gym.',
              },
              {
                icon: <Utensils size={18} />,
                title: 'Numbers, not guesses',
                body: 'BMR from Mifflin-St Jeor, TDEE from your activity level, then calories and protein for your goal.',
              },
              {
                icon: <CalendarDays size={18} />,
                title: 'A 12-week roadmap',
                body: 'Four blocks with a milestone each, plus sleep, deload and cardio guidance so progress is measurable.',
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 p-5 space-y-2">
                <span className="inline-flex w-9 h-9 rounded-xl bg-lime-50 border border-lime-200 text-lime-700 items-center justify-center">
                  {c.icon}
                </span>
                <p className="font-bold text-sm">{c.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </section>
        )}

        {plan && (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Stat icon={<Flame size={15} />} label="Goal" value={GOAL_LABEL[goal || ''] || 'Your plan'} />
              <Stat icon={<Utensils size={15} />} label="Daily calories" value={plan.nutritionPlan.kcal} unit="kcal" />
              <Stat icon={<TrendingUp size={15} />} label="Protein" value={plan.nutritionPlan.proteinG} unit="g" />
              <Stat icon={<Dumbbell size={15} />} label="Sessions" value={plan.trainingPlan.frequency} unit="/ week" />
            </section>

            <section className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-lg">This week's split</h2>
                  <span className="text-xs font-semibold text-slate-500">{plan.trainingPlan.split}</span>
                </div>
                <ul className="mt-4 divide-y divide-slate-100">
                  {plan.trainingPlan.days.map((d, i) => (
                    <li key={d.day + i} className="py-3 flex items-center gap-3">
                      <span
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-lime-100 text-lime-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{d.focus}</p>
                        <p className="text-xs text-slate-500">
                          {d.day} · {d.exercises.length} exercises
                        </p>
                      </div>
                      {i === 0 && (
                        <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-lime-800 bg-lime-50 border border-lime-200 rounded-full px-2 py-0.5">
                          Start here
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-lime-700">Current block</p>
                  <p className="mt-2 font-bold">
                    {plan.roadmap[0]?.weeks} · {plan.roadmap[0]?.focus}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{plan.roadmap[0]?.milestone}</p>
                </div>
                <div className="space-y-2.5 text-sm">
                  <p className="flex items-center gap-2 text-slate-700">
                    <MoonStar size={14} className="text-lime-700" /> Sleep {plan.recoveryPlan.sleepTarget} h
                  </p>
                  <p className="flex items-center gap-2 text-slate-700">
                    <Timer size={14} className="text-lime-700" /> Deload every {plan.recoveryPlan.deloadEveryWeeks}{' '}
                    weeks
                  </p>
                  <p className="flex items-start gap-2 text-slate-700">
                    <Flame size={14} className="mt-0.5 shrink-0 text-lime-700" />
                    <span className="text-xs leading-relaxed">{plan.recoveryPlan.cardio}</span>
                  </p>
                </div>
                <button
                  onClick={openLatest}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all"
                >
                  Open plan <ArrowRight size={15} />
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Plan history</h2>
                <button onClick={onOpenPlans} className="text-sm font-semibold text-lime-800 hover:underline">
                  View all ({data?.totals.plans})
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100">
                <button onClick={openLatest} className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-lime-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      Blueprint #{latest!.id} · {GOAL_LABEL[goal || ''] || 'Current'}
                    </p>
                    <p className="text-xs text-slate-500">Updated {when(latest!.createdAt)}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-lime-800 bg-lime-50 border border-lime-200 rounded-full px-2 py-0.5">
                    Active
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
                        Blueprint #{b.id} · {GOAL_LABEL[b.goal || ''] || 'Previous'}
                      </p>
                      <p className="text-xs text-slate-500">{when(b.createdAt)}</p>
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
