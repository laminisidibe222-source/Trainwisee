import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Flame,
  HeartPulse,
  Layers,
  MoonStar,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Sparkles,
  Timer,
  Utensils,
} from 'lucide-react';
import { getDashboard, startCheckout, type DashboardData, type SavedBlueprint, type User } from '../lib/api';
import { planText, useI18n, type TKey } from '../i18n';
import { Shell } from './dash/Shell';
import { PlanSearch } from './dash/PlanSearch';
import { PerformanceBars } from './dash/PerformanceBars';
import { ShareDonut } from './dash/ShareDonut';
import { dayVolumes, weeklySets } from './dash/planView';
import { C } from './dash/theme';
import { PLANS, isPlanId, money, planAmount, type PlanId } from '../lib/plans';
import type { Plan } from '../types/blueprint';

/**
 * Signed-in home, rebuilt from the blue "command palette" reference: a royal
 * blue sidebar, a white rail of session cards and a light canvas holding the
 * search row, quick suggestions and a tabbed grid of plan cards.
 */

type Tab = 'sessions' | 'nutrition' | 'recovery' | 'plan';

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-[12px] border border-black/[0.05] bg-white p-4 shadow-[0_10px_30px_-26px_rgba(20,28,60,0.5)] ${className}`}>
    {children}
  </section>
);

const Head = ({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-[13.5px] font-bold" style={{ color: C.ink }}>
        {title}
      </h2>
      {sub && <p className="mt-0.5 text-[10.5px] text-[#8A94A6]">{sub}</p>}
    </div>
    {right}
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
  onOpenPlan: (plan: SavedBlueprint) => void;
  onOpenPlanId: (id: number) => void;
  onNew: () => void;
  onOpenPlans: () => void;
  onHome: () => void;
  onLogout: () => void;
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<{ raw: string | null } | null>(null);
  const [tab, setTab] = useState<Tab>('sessions');
  const [railOpen, setRailOpen] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(false);
  const [choice, setChoice] = useState<PlanId>('pro');
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

  const sub = data?.subscription ?? null;
  const activePlan = sub?.status === 'active' && isPlanId(sub.plan) ? sub.plan : null;

  useEffect(() => {
    if (activePlan) setChoice(activePlan);
  }, [activePlan]);

  const openLatest = useCallback(() => {
    if (!latest || !plan) return;
    onOpenPlan({ id: latest.id, createdAt: latest.createdAt, modelVersion: latest.modelVersion, plan });
  }, [latest, plan, onOpenPlan]);

  const checkout = async (id: PlanId) => {
    setPayError(false);
    setPaying(true);
    const res = await startCheckout(id);
    setPaying(false);
    if (res.url) window.location.href = res.url;
    else setPayError(true);
  };

  const navigate = (action: 'dashboard' | 'plans' | 'new') => {
    if (action === 'dashboard') onHome();
    else if (action === 'plans') onOpenPlans();
    else onNew();
  };

  const loading = !data && !error;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'sessions', label: t('dash.tab.sessions'), count: days.length },
    { id: 'nutrition', label: t('dash.tab.nutrition') },
    { id: 'recovery', label: t('dash.tab.recovery') },
    { id: 'plan', label: t('plan.title') },
  ];

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
        {loading && (
          <div className="space-y-3">
            <div className="h-8 w-72 animate-pulse rounded-lg bg-white" />
            <div className="h-11 animate-pulse rounded-[10px] bg-white" />
            <div className="grid gap-3 sm:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[104px] animate-pulse rounded-[12px] bg-white" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#D6455D]/25 bg-[#FDEDF0] p-4">
            <p className="text-sm text-[#A32D44]">{error.raw ? tError(error.raw) : t('plans.error')}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D6455D]/30 px-4 py-2 text-sm font-semibold text-[#A32D44] hover:bg-white"
            >
              <RefreshCw size={14} /> {t('plans.retry')}
            </button>
          </div>
        )}

        {/* ── empty account ───────────────────────────────────── */}
        {data && !plan && (
          <div className="space-y-3">
            <section className="relative overflow-hidden rounded-[14px] p-6 text-white sm:p-8" style={{ background: C.blue }}>
              <div
                className="absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
                style={{ background: '#7FA6FF', opacity: 0.55 }}
                aria-hidden
              />
              <div className="relative max-w-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">{today}</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t('dash.greetingEmpty1', { name: firstName })} {t('dash.greetingEmpty2')}
                </h1>
                <p className="mt-2 text-sm text-white/80">{t('dash.subEmpty')}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={onNew}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold"
                    style={{ color: C.blue }}
                  >
                    {t('dash.empty.cta')} <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={onOpenPlans}
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {t('nav.myPlans')}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-white/60">{t('dash.empty.note')}</p>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: <Dumbbell size={16} />, title: t('dash.tile1.title'), body: t('dash.tile1.body') },
                { icon: <Flame size={16} />, title: t('dash.tile2.title'), body: t('dash.tile2.body') },
                { icon: <CalendarDays size={16} />, title: t('dash.tile3.title'), body: t('dash.tile3.body') },
              ].map((c) => (
                <Panel key={c.title}>
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{ background: C.paleBlue, color: C.blue }}
                  >
                    {c.icon}
                  </span>
                  <p className="mt-2 text-[13px] font-bold">{c.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-[#8A94A6]">{c.body}</p>
                </Panel>
              ))}
            </div>
          </div>
        )}

        {/* ── dashboard ───────────────────────────────────────── */}
        {plan && (
          <div className={`grid gap-3 ${railOpen ? 'lg:grid-cols-[236px_minmax(0,1fr)]' : 'lg:grid-cols-1'}`}>
            {/* white session rail */}
            {railOpen && (
              <aside className="relative">
                <div className="rounded-[12px] border border-black/[0.05] bg-white p-3 shadow-[0_14px_34px_-30px_rgba(20,28,60,0.55)]">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-bold" style={{ color: C.ink }}>
                      {t('dash.manage')}
                    </p>
                    <button
                      onClick={() => setRailOpen(false)}
                      aria-label={t('dash.hideRail')}
                      className="grid h-7 w-7 place-items-center rounded-md text-[#8A94A6] hover:bg-[#F4F5F7] hover:text-[#1A1F36]"
                    >
                      <PanelLeftClose size={14} />
                    </button>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {days.map((d, i) => {
                      const on = i === 0;
                      return (
                        <li key={d.day + i}>
                          <button
                            onClick={openLatest}
                            className="w-full rounded-[10px] p-3 text-left transition-colors"
                            style={
                              on
                                ? { background: C.blue, color: '#fff' }
                                : { background: C.paleBlue, color: C.ink }
                            }
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <Dumbbell size={14} style={{ color: on ? '#C9D6FF' : C.blue }} />
                                <span className="text-[11.5px] font-extrabold">{planText(lang, d.day)}</span>
                              </span>
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                                style={
                                  on
                                    ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
                                    : { background: '#fff', color: C.blue }
                                }
                              >
                                {d.total}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] leading-snug" style={{ color: on ? 'rgba(255,255,255,0.75)' : '#6B7794' }}>
                              {planText(lang, d.focus)} · ~{d.minutes}′
                            </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    onClick={openLatest}
                    className="mt-3 flex w-full items-center justify-between rounded-[10px] px-2 py-2 text-[11px] font-bold"
                    style={{ color: C.blue, background: '#F5F7FF' }}
                  >
                    {t('dash.volumeShort')}
                    <ChevronRight size={13} />
                  </button>
                </div>
              </aside>
            )}

            {/* main canvas */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-[20px] font-extrabold leading-tight tracking-tight sm:text-[23px]" style={{ color: C.ink }}>
                    {t('hero.hello', { name: firstName })}
                  </h1>
                  <p className="mt-0.5 text-[11.5px] text-[#8A94A6]">
                    {goalLabel} · {planText(lang, plan.trainingPlan.split)} · {t('nav.weekOf', { n: weeksIn })} / 12
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!railOpen && (
                    <button
                      onClick={() => setRailOpen(true)}
                      aria-label={t('dash.showRail')}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 bg-white text-[#6B7794] hover:text-[#1A1F36]"
                    >
                      <PanelLeftOpen size={15} />
                    </button>
                  )}
                  <button
                    onClick={openLatest}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11.5px] font-extrabold text-white"
                    style={{ background: C.blue }}
                  >
                    {t('dash.openFull')} <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>

              {!!plan.trainingPlan.substitutions?.length && (
                <div
                  className="mt-3 flex items-start gap-2 rounded-[10px] border px-3 py-2 text-[11px] leading-relaxed"
                  style={{ borderColor: '#C9D6FF', background: '#EEF2FF', color: '#2B3C7A' }}
                >
                  <Sparkles size={13} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="font-bold">{t('dash.adaptedTitle')}</span> ·{' '}
                    {t(plan.trainingPlan.substitutions.length === 1 ? 'dash.adaptedOne' : 'dash.adaptedMany', {
                      n: plan.trainingPlan.substitutions.length,
                    })}
                  </span>
                </div>
              )}

              {/* suggestions */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#6B7794]">{t('dash.suggestions')}</span>
                <span
                  className="rounded-md border px-2 py-0.5 text-[9.5px] font-bold"
                  style={{ borderColor: '#C9D6FF', color: C.blue }}
                >
                  {t('dash.optimize')}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'sessions' as Tab, icon: Dumbbell, label: t('dash.tab.sessions'), value: `${sessions}` },
                  { id: 'nutrition' as Tab, icon: Utensils, label: t('dash.tab.nutrition'), value: `${plan.nutritionPlan.kcal}` },
                  { id: 'recovery' as Tab, icon: HeartPulse, label: t('dash.tab.recovery'), value: `${plan.recoveryPlan.sleepTarget}h` },
                  { id: 'plan' as Tab, icon: Layers, label: t('plan.title'), value: activePlan ? t(`plan.${activePlan}` as TKey) : t('plan.free') },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTab(s.id)}
                    className="rounded-[12px] border bg-white px-2 py-3 text-center transition-shadow hover:shadow-[0_12px_26px_-22px_rgba(20,28,60,0.6)]"
                    style={{ borderColor: tab === s.id ? C.blue : 'rgba(26,31,54,0.06)' }}
                  >
                    <s.icon size={19} className="mx-auto" style={{ color: C.blue }} />
                    <p className="mt-1.5 text-[10.5px] font-bold" style={{ color: C.ink }}>
                      {s.label}
                    </p>
                    <p className="text-[9.5px] text-[#8A94A6]">{s.value}</p>
                  </button>
                ))}
              </div>

              {/* tabs */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {tabs.map((item) => {
                  const on = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className="rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors"
                      style={
                        on
                          ? { background: C.blue, color: '#fff' }
                          : { background: '#fff', color: '#4A5470' }
                      }
                    >
                      {item.label}
                      {typeof item.count === 'number' && (
                        <span
                          className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                          style={on ? { background: 'rgba(255,255,255,0.25)' } : { background: '#F1F2F7', color: '#6B7794' }}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* tab content */}
              {tab === 'sessions' && (
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <Panel>
                    <Head
                      title={t('perf.title')}
                      sub={t('perf.sub', { n: days.length })}
                      right={
                        <span className="rounded-full px-2 py-0.5 text-[9.5px] font-extrabold" style={{ background: C.paleBlue, color: C.blue }}>
                          {weekly} {t('perf.setsShort')}
                        </span>
                      }
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] font-semibold text-[#8A94A6]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-[2px]" style={{ background: C.panel }} />
                        {t('perf.primary')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-[2px]" style={{ background: C.lime }} />
                        {t('perf.accessory')}
                      </span>
                    </div>
                    <div className="mt-1">
                      <PerformanceBars days={days} />
                    </div>
                    <div className="flex items-center justify-between border-t border-dashed border-black/10 pt-2 text-[10.5px] text-[#8A94A6]">
                      <span>{t('week.duration', { n: weekMinutes })}</span>
                      <span className="inline-flex items-center gap-1 font-bold" style={{ color: C.blue }}>
                        <Sparkles size={10} /> {t('dash.today')}
                      </span>
                    </div>
                  </Panel>

                  <Panel>
                    <Head
                      title={t('dash.reportTitle')}
                      sub={t('dash.reportSub', { n: days.length })}
                      right={<span className="text-[10px] font-bold text-[#8A94A6]">{t('perf.setsShort')}</span>}
                    />
                    <ul className="mt-3 space-y-2.5">
                      {days.map((d, i) => (
                        <li key={`row-${d.day}-${i}`} className="flex items-center gap-3">
                          <span className="w-[82px] shrink-0 truncate text-[10.5px] font-semibold text-[#4A5470]">
                            {planText(lang, d.day)}
                          </span>
                          <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[#F1F2F7]">
                            <span
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                width: `${Math.max(6, Math.round((d.total / Math.max(...days.map((x) => x.total), 1)) * 100))}%`,
                                background: i === 0 ? C.blue : '#9FB4FF',
                              }}
                            />
                          </span>
                          <span className="w-8 shrink-0 text-right text-[10.5px] font-extrabold tabular-nums">
                            {d.total}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-dashed border-black/10 pt-2.5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A94A6]">{t('dash.total')}</p>
                        <p className="text-[12.5px] font-extrabold" style={{ color: C.ink }}>
                          {weekly} {t('perf.setsShort')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A94A6]">{t('dash.avgPerSession')}</p>
                        <p className="text-[12.5px] font-extrabold" style={{ color: C.ink }}>
                          {days.length ? Math.round(weekly / days.length) : 0}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={openLatest}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-black/10 py-2 text-[10.5px] font-bold text-[#4A5470] hover:bg-[#F4F5F7]"
                    >
                      {t('perf.all')} <ArrowRight size={12} />
                    </button>
                  </Panel>

                  <Panel className="lg:col-span-2">
                    <Head
                      title={t('dash.nextSession')}
                      sub={planText(lang, plan.trainingPlan.days[0]?.focus ?? '')}
                      right={
                        <button
                          onClick={openLatest}
                          className="inline-flex items-center gap-1 text-[10.5px] font-bold"
                          style={{ color: C.blue }}
                        >
                          {t('perf.all')} <ArrowRight size={12} />
                        </button>
                      }
                    />
                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {(plan.trainingPlan.days[0]?.exercises ?? []).slice(0, 6).map((e) => (
                        <li
                          key={e.name}
                          className="flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-2"
                          style={{ background: '#F7F8FC' }}
                        >
                          <span className="min-w-0 truncate text-[11.5px] font-semibold" style={{ color: C.ink }}>
                            {planText(lang, e.name)}
                          </span>
                          <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#8A94A6]">
                            {e.sets} × {e.reps}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              )}

              {tab === 'nutrition' && (
                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_1fr]">
                  <Panel>
                    <Head title={t('share.title')} sub={t('share.sub')} />
                    <div className="mt-3">
                      <ShareDonut
                        proteinG={plan.nutritionPlan.proteinG}
                        carbsG={plan.nutritionPlan.carbsG}
                        fatG={plan.nutritionPlan.fatG}
                        kcal={plan.nutritionPlan.kcal}
                      />
                    </div>
                  </Panel>

                  <Panel>
                    <Head
                      title={t('dash.kcalDay')}
                      sub={`${plan.nutritionPlan.proteinG} g ${t('dial.protein').toLowerCase()} · ${plan.nutritionPlan.carbsG} g ${t('dial.carbs').toLowerCase()}`}
                      right={<Flame size={15} style={{ color: C.blue }} />}
                    />
                    <ul className="mt-3 grid gap-1.5">
                      {plan.nutritionPlan.meals.slice(0, 4).map((m) => (
                        <li
                          key={m.name}
                          className="flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-2"
                          style={{ background: '#F7F8FC' }}
                        >
                          <span className="min-w-0 truncate text-[11.5px] font-semibold" style={{ color: C.ink }}>
                            {planText(lang, m.name)}
                          </span>
                          <span className="shrink-0 text-[10px] font-bold tabular-nums text-[#8A94A6]">
                            {m.kcal} kcal · {m.proteinG} g
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              )}

              {tab === 'recovery' && (
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <section className="rounded-[12px] p-4" style={{ background: C.paleBlue }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-bold" style={{ color: C.ink }}>
                        {t('side.tipTitle')}
                      </span>
                      <HeartPulse size={16} style={{ color: C.blue }} />
                    </div>
                    <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: '#2B3C7A' }}>
                      {planText(lang, plan.recoveryPlan.cardio)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9.5px] font-bold" style={{ color: '#2B3C7A' }}>
                        <MoonStar size={10} /> {t('dash.sleep', { n: plan.recoveryPlan.sleepTarget })}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9.5px] font-bold" style={{ color: '#2B3C7A' }}>
                        <Timer size={10} /> {t('dash.deload', { n: plan.recoveryPlan.deloadEveryWeeks })}
                      </span>
                    </div>
                  </section>

                  <Panel>
                    <Head title={t('week.title')} sub={t('week.sub', { n: days.length })} />
                    <ul className="mt-2">
                      {days.map((d, i) => (
                        <li key={`rec-${d.day}-${i}`} className="flex items-center gap-2.5 border-b border-dashed border-black/5 py-2 last:border-0">
                          <span
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-extrabold"
                            style={{ background: i === 0 ? C.blue : '#F1F2F7', color: i === 0 ? '#fff' : '#4A5470' }}
                          >
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[11.5px] font-bold" style={{ color: C.ink }}>
                            {planText(lang, d.day)}
                          </span>
                          <span className="text-[10px] font-semibold text-[#8A94A6]">~{d.minutes}′</span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              )}

              {tab === 'plan' && (
                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_1fr]">
                  <Panel>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-[13.5px] font-bold" style={{ color: C.ink }}>
                          {t('plan.title')}
                        </h2>
                        <p className="mt-0.5 text-[10.5px] text-[#8A94A6]">
                          {sub ? t(`plan.status.${sub.status}` as TKey) : t('plan.none')}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                        style={
                          activePlan
                            ? { background: C.paleBlue, color: C.blue }
                            : { background: '#F1F2F7', color: '#6B7794' }
                        }
                      >
                        {activePlan ? t(`plan.${activePlan}` as TKey) : t('plan.free')}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1.5">
                      {PLANS.map((option) => {
                        const selected = choice === option.id;
                        const current = activePlan === option.id;
                        return (
                          <li key={option.id}>
                            <button
                              onClick={() => setChoice(option.id)}
                              aria-pressed={selected}
                              className="flex w-full items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left transition-colors"
                              style={{
                                borderColor: selected ? C.blue : 'rgba(26,31,54,0.10)',
                                background: selected ? '#EEF2FF' : '#fff',
                              }}
                            >
                              <span
                                className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border"
                                style={{ borderColor: selected ? C.blue : 'rgba(26,31,54,0.25)' }}
                              >
                                {selected && <span className="h-2 w-2 rounded-full" style={{ background: C.blue }} />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[11.5px] font-extrabold" style={{ color: C.ink }}>
                                  {t(option.nameKey)}
                                  {current && (
                                    <span className="ml-1.5 rounded-full px-1.5 py-[1px] text-[8.5px] font-bold uppercase tracking-wider text-white" style={{ background: C.blue }}>
                                      {t('plan.current')}
                                    </span>
                                  )}
                                </span>
                                <span className="block text-[10px] text-[#8A94A6]">
                                  {money(option.amount, lang)} {t('landing.pricing.currency')}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      onClick={() => checkout(choice)}
                      disabled={paying}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-extrabold text-white disabled:opacity-60"
                      style={{ background: C.blue }}
                    >
                      {paying
                        ? '…'
                        : t('landing.pricing.pay', {
                            price: `${money(planAmount(choice), lang)} ${t('landing.pricing.currency')}`,
                          })}
                      <ArrowRight size={12} />
                    </button>
                    {payError && (
                      <p className="mt-2 text-[10.5px] font-semibold" style={{ color: C.red }} role="alert">
                        {t('plan.payError')}
                      </p>
                    )}
                  </Panel>

                  <Panel>
                    <Head
                      title={t('dash.history')}
                      right={
                        (data?.totals.plans ?? 0) > 1 ? (
                          <button onClick={onOpenPlans} className="text-[10.5px] font-bold" style={{ color: C.blue }}>
                            {t('dash.viewAll', { n: data?.totals.plans ?? 1 })}
                          </button>
                        ) : undefined
                      }
                    />
                    <ul className="mt-2 space-y-1.5">
                      <li>
                        <button
                          onClick={openLatest}
                          className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left"
                          style={{ background: '#F7F8FC' }}
                        >
                          <CalendarDays size={13} style={{ color: C.blue }} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11.5px] font-bold" style={{ color: C.ink }}>
                              {t('history.row', { id: latest!.id, goal: goalLabel })}
                            </span>
                            <span className="block text-[9.5px] text-[#8A94A6]">
                              {t('dash.updated', {
                                date: new Date(latest!.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
                              })}
                            </span>
                          </span>
                          <span className="rounded-full px-2 py-0.5 text-[8.5px] font-extrabold uppercase" style={{ background: C.paleBlue, color: C.blue }}>
                            {t('dash.active')}
                          </span>
                        </button>
                      </li>
                      {(data?.recent ?? []).map((b) => (
                        <li key={b.id}>
                          <button
                            onClick={() => onOpenPlanId(b.id)}
                            className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left hover:bg-[#F7F8FC]"
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#C9D6FF' }} />
                            <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold" style={{ color: C.ink }}>
                              {t('history.row', { id: b.id, goal: t(b.goal ? (`goal.${b.goal}` as TKey) : 'goal.none') })}
                            </span>
                            <ArrowRight size={12} className="shrink-0 text-[#C9D6FF]" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-dashed border-black/10 pt-2.5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A94A6]">{t('dash.plansMade')}</p>
                        <p className="text-[12.5px] font-extrabold" style={{ color: C.ink }}>{data?.totals.plans ?? 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A94A6]">{t('dash.checkins')}</p>
                        <p className="text-[12.5px] font-extrabold" style={{ color: C.ink }}>{data?.totals.checkins ?? 0}</p>
                      </div>
                    </div>
                    <button
                      onClick={onNew}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-extrabold text-white"
                      style={{ background: C.panel }}
                    >
                      <Plus size={13} /> {t('nav.newPlan')}
                    </button>
                  </Panel>
                </div>
              )}
            </div>
          </div>
        )}
      </Shell>
    </motion.div>
  );
};
