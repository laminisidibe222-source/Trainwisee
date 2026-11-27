import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  Flame,
  MoonStar,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Timer,
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
 * Signed-in home, laid out like the reference sales dashboard: a dark sidebar,
 * one rounded white app card, three stat tiles (the first dark), a week list
 * beside a two-tone volume chart, a horizontal breakdown and a right rail with
 * the macro donut and a sage upgrade card.
 */

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-[14px] border border-black/[0.07] bg-white p-4 ${className}`}>{children}</section>
);

const CardHead = ({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-[14px] font-extrabold tracking-tight">{title}</h2>
      {sub && <p className="mt-0.5 text-[11px] text-[#6E7A6B]">{sub}</p>}
    </div>
    {right}
  </div>
);

const Trend = ({ value, label, tone = 'up' }: { value: string; label: string; tone?: 'up' | 'down' }) => (
  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#6E7A6B]">
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold"
      style={
        tone === 'up'
          ? { background: 'rgba(168,224,74,0.22)', color: '#3F5A16' }
          : { background: 'rgba(192,80,60,0.12)', color: '#9E3A28' }
      }
    >
      <ArrowUpRight size={10} className={tone === 'down' ? 'rotate-90' : ''} />
      {value}
    </span>
    {label}
  </p>
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
  const primarySets = days.reduce((a, d) => a + d.primary, 0);
  const accessorySets = days.reduce((a, d) => a + d.accessory, 0);

  const sub = data?.subscription ?? null;
  const activePlan = sub?.status === 'active' && isPlanId(sub.plan) ? sub.plan : null;

  useEffect(() => {
    if (activePlan) setChoice(activePlan);
  }, [activePlan]);
  const planLabel = activePlan
    ? t(`plan.${activePlan}` as TKey)
    : sub
      ? t('plan.free')
      : t('plan.free');
  const statusLabel = sub ? t(`plan.status.${sub.status}` as TKey) : null;

  const checkout = async (plan: PlanId) => {
    setPayError(false);
    setPaying(true);
    const res = await startCheckout(plan);
    setPaying(false);
    if (res.url) window.location.href = res.url;
    else setPayError(true);
  };

  const openLatest = useCallback(() => {
    if (!latest || !plan) return;
    onOpenPlan({ id: latest.id, createdAt: latest.createdAt, modelVersion: latest.modelVersion, plan });
  }, [latest, plan, onOpenPlan]);

  const navigate = (action: 'dashboard' | 'plans' | 'new') => {
    if (action === 'dashboard') onHome();
    else if (action === 'plans') onOpenPlans();
    else onNew();
  };

  const loading = !data && !error;

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
          <div className="space-y-4">
            <div className="h-9 w-64 animate-pulse rounded-full bg-[#EEF0E9]" />
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[118px] animate-pulse rounded-[14px] bg-[#EEF0E9]" />
              ))}
            </div>
            <div className="grid gap-3 xl:grid-cols-[1fr_290px]">
              <div className="h-[320px] animate-pulse rounded-[14px] bg-[#EEF0E9]" />
              <div className="h-[320px] animate-pulse rounded-[14px] bg-[#EEF0E9]" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#B23B2E]/25 bg-[#FBEDEA] p-4">
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
          <div className="space-y-3">
            <section
              className="relative overflow-hidden rounded-[16px] p-6 text-white sm:p-8"
              style={{ background: C.panel }}
            >
              <div
                className="absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
                style={{ background: C.lime, opacity: 0.35 }}
                aria-hidden
              />
              <div className="relative max-w-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: C.lime }}>
                  {today}
                </p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t('dash.greetingEmpty1', { name: firstName })} {t('dash.greetingEmpty2')}
                </h1>
                <p className="mt-2 text-sm text-white/65">{t('dash.subEmpty')}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={onNew}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold"
                    style={{ background: C.lime, color: C.panel }}
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
                <p className="mt-3 text-[11px] text-white/40">{t('dash.empty.note')}</p>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: <Dumbbell size={16} />, title: t('dash.tile1.title'), body: t('dash.tile1.body') },
                { icon: <Flame size={16} />, title: t('dash.tile2.title'), body: t('dash.tile2.body') },
                { icon: <CalendarDays size={16} />, title: t('dash.tile3.title'), body: t('dash.tile3.body') },
              ].map((c) => (
                <Card key={c.title}>
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{ background: 'rgba(168,224,74,0.25)', color: '#3F5A16' }}
                  >
                    {c.icon}
                  </span>
                  <p className="mt-2 text-[13px] font-bold">{c.title}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-[#6E7A6B]">{c.body}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── dashboard ───────────────────────────────────────── */}
        {plan && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
            <div className="min-w-0 space-y-3">
              {/* title row */}
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[22px] font-extrabold leading-tight tracking-tight sm:text-[25px]">
                    {t('hero.hello', { name: firstName })}
                  </h1>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[#6E7A6B]">
                    <span>{goalLabel} · {planText(lang, plan.trainingPlan.split)}</span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                      style={
                        activePlan
                          ? { background: 'rgba(168,224,74,0.28)', color: '#2F4410' }
                          : { background: '#F1F3EC', color: '#4A5A48' }
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: activePlan ? C.panel : '#9AA693' }}
                      />
                      {planLabel}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openLatest}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[11px] font-semibold text-[#4A5A48] hover:border-black/20"
                  >
                    <CalendarDays size={13} /> {t('nav.weekOf', { n: weeksIn })} / 12
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={openLatest}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.06em]"
                    style={{ background: C.panel, color: '#fff' }}
                  >
                    {t('dash.openFull')} <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>

              {!!plan.trainingPlan.substitutions?.length && (
                <div
                  className="flex items-start gap-2 rounded-[12px] border px-3 py-2 text-[11px] leading-relaxed"
                  style={{ borderColor: 'rgba(168,224,74,0.55)', background: 'rgba(168,224,74,0.12)', color: '#3F5A16' }}
                >
                  <ShieldAlert size={13} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="font-bold">{t('dash.adaptedTitle')}</span> ·{' '}
                    {t(plan.trainingPlan.substitutions.length === 1 ? 'dash.adaptedOne' : 'dash.adaptedMany', {
                      n: plan.trainingPlan.substitutions.length,
                    })}
                  </span>
                </div>
              )}

              {/* stat tiles */}
              <div className="grid gap-3 sm:grid-cols-3">
                <section
                  className="relative overflow-hidden rounded-[14px] p-4 text-white"
                  style={{ background: C.panel }}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/70">
                      <Flame size={13} style={{ color: C.lime }} /> {t('dash.kcalDay')}
                    </span>
                    <ArrowUpRight size={14} className="text-white/40" />
                  </div>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="text-[27px] font-extrabold leading-none tabular-nums">{plan.nutritionPlan.kcal}</span>
                    <span className="text-[11px] font-bold text-white/45">{t('share.kcal')}</span>
                  </p>
                  <p className="mt-1 text-[12px] font-bold" style={{ color: C.lime }}>
                    {plan.nutritionPlan.proteinG} g {t('dial.protein').toLowerCase()} ·{' '}
                    {plan.nutritionPlan.carbsG} g {t('dial.carbs').toLowerCase()}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-[10.5px] text-white/40">{today}</span>
                    <button onClick={openLatest} className="text-[10.5px] font-bold text-white/70 hover:text-white">
                      {t('perf.all')} ›
                    </button>
                  </div>
                </section>

                <section className="rounded-[14px] border border-black/[0.07] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6E7A6B]">{t('dash.sessionsCard')}</span>
                    <Timer size={14} className="text-[#B7C2B0]" />
                  </div>
                  <p className="mt-3 flex items-baseline gap-1 text-[27px] font-extrabold leading-none tabular-nums">
                    {sessions}
                    <span className="text-[11px] font-bold text-[#6E7A6B]">/ {t('dash.perWeek')}</span>
                  </p>
                  <Trend value={`${weekMinutes} min`} label={t('perf.title').toLowerCase()} tone="up" />
                </section>

                <section className="rounded-[14px] border border-black/[0.07] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6E7A6B]">{t('dash.setsWeek')}</span>
                    <Dumbbell size={14} className="text-[#B7C2B0]" />
                  </div>
                  <p className="mt-3 flex items-baseline gap-1 text-[27px] font-extrabold leading-none tabular-nums">
                    {weekly}
                    <span className="text-[11px] font-bold text-[#6E7A6B]">{t('perf.setsShort')}</span>
                  </p>
                  <Trend value={`${primarySets} + ${accessorySets}`} label={t('perf.accessory').toLowerCase()} tone="up" />
                </section>
              </div>

              {/* week list + volume chart */}
              <div className="grid gap-3 lg:grid-cols-2">
                <Card>
                  <CardHead
                    title={t('week.title')}
                    sub={t('week.sub', { n: days.length })}
                    right={
                      <button
                        onClick={openLatest}
                        aria-label={t('perf.all')}
                        className="grid h-7 w-7 place-items-center rounded-full border border-black/10 text-[#6E7A6B] hover:text-[#1B241C]"
                      >
                        <ArrowRight size={13} />
                      </button>
                    }
                  />
                  <ul className="mt-2">
                    {days.map((d, i) => (
                      <li key={d.day + i}>
                        <button
                          onClick={openLatest}
                          className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-left transition-colors hover:bg-[#F4F6EF]"
                        >
                          <span
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10.5px] font-extrabold"
                            style={
                              i === 0
                                ? { background: 'rgba(168,224,74,0.35)', color: '#2F4410' }
                                : { background: '#F1F3EC', color: '#4A5A48' }
                            }
                          >
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-bold">{planText(lang, d.day)}</span>
                            <span className="block truncate text-[10px] text-[#6E7A6B]">
                              {planText(lang, d.focus)} · {t('dash.exercises', { n: d.exercises })}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-[11.5px] font-extrabold tabular-nums">{d.total}</span>
                            <span className="block text-[9.5px] font-semibold text-[#6E7A6B]">
                              {t('perf.setsShort')} · ~{d.minutes}′
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[14px] font-extrabold tracking-tight">{t('perf.title')}</h2>
                      <p className="mt-0.5 text-[11px] text-[#6E7A6B]">{t('perf.sub', { n: days.length })}</p>
                    </div>
                    <div className="flex flex-col gap-1 text-[9.5px] font-semibold text-[#6E7A6B]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-[2px]" style={{ background: C.panel }} />
                        {t('perf.primary')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-[2px]" style={{ background: C.lime }} />
                        {t('perf.accessory')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <PerformanceBars days={days} />
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-black/10 pt-2 text-[10.5px] text-[#6E7A6B]">
                    <span>
                      {t('week.duration', { n: weekMinutes })}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#3F5A16]">
                      <Sparkles size={10} /> {t('dash.today')}
                    </span>
                  </div>
                </Card>
              </div>

              <Card>
                <CardHead
                  title={t('dash.reportTitle')}
                  sub={t('dash.reportSub', { n: days.length })}
                  right={
                    <span className="rounded-full bg-[#F1F3EC] px-2 py-0.5 text-[9.5px] font-extrabold text-[#4A5A48]">
                      {weekly} {t('perf.setsShort')}
                    </span>
                  }
                />
                <ul className="mt-3 space-y-2.5">
                  {days.map((d, i) => (
                    <li key={`row-${d.day}-${i}`} className="flex items-center gap-3">
                      <span className="w-[86px] shrink-0 truncate text-[10.5px] font-semibold text-[#4A5A48]">
                        {planText(lang, d.day)}
                      </span>
                      <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-[#F1F3EC]">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${Math.max(6, Math.round((d.total / Math.max(...days.map((x) => x.total), 1)) * 100))}%`,
                            background: i === 0 ? C.lime : 'rgba(168,224,74,0.55)',
                          }}
                        />
                      </span>
                      <span className="w-9 shrink-0 text-right text-[10.5px] font-extrabold tabular-nums">
                        {d.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* right rail */}
            <aside className="space-y-3">
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-[13.5px] font-extrabold">{t('plan.title')}</h2>
                    {statusLabel && <p className="mt-0.5 text-[10.5px] text-[#6E7A6B]">{statusLabel}</p>}
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                    style={
                      activePlan
                        ? { background: 'rgba(168,224,74,0.3)', color: '#2F4410' }
                        : { background: '#F1F3EC', color: '#4A5A48' }
                    }
                  >
                    {planLabel}
                  </span>
                </div>

                {activePlan && sub?.currentPeriodEnd ? (
                  <p className="mt-2 text-[10.5px] text-[#6E7A6B]">
                    {t('plan.renews', {
                      date: new Date(sub.currentPeriodEnd).toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }),
                    })}
                  </p>
                ) : (
                  <p className="mt-2 text-[10.5px] leading-relaxed text-[#6E7A6B]">{t('plan.none')}</p>
                )}

                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E7A6B]">
                  {t('plan.choose')}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {PLANS.map((option) => {
                    const selected = choice === option.id;
                    const current = activePlan === option.id;
                    return (
                      <li key={option.id}>
                        <button
                          onClick={() => setChoice(option.id)}
                          aria-pressed={selected}
                          className="flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors"
                          style={{
                            borderColor: selected ? 'rgba(47,68,16,0.35)' : 'rgba(27,36,28,0.10)',
                            background: selected ? 'rgba(168,224,74,0.16)' : '#fff',
                          }}
                        >
                          <span
                            className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border"
                            style={{ borderColor: selected ? '#2F4410' : 'rgba(27,36,28,0.25)' }}
                          >
                            {selected && <span className="h-2 w-2 rounded-full" style={{ background: '#2F4410' }} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11.5px] font-extrabold">
                              {t(option.nameKey)}
                              {current && (
                                <span className="ml-1.5 rounded-full bg-[#2F4410] px-1.5 py-[1px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                                  {t('plan.current')}
                                </span>
                              )}
                            </span>
                            <span className="block text-[10px] text-[#6E7A6B]">
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
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-extrabold text-white transition-opacity disabled:opacity-60"
                  style={{ background: C.panel }}
                >
                  {paying
                    ? '…'
                    : t('landing.pricing.pay', {
                        price: `${money(planAmount(choice), lang)} ${t('landing.pricing.currency')}`,
                      })}
                  <ArrowRight size={12} />
                </button>
                {payError && (
                  <p className="mt-2 text-[10.5px] font-semibold text-[#9E3A28]" role="alert">
                    {t('plan.payError')}
                  </p>
                )}
              </Card>

              <Card>
                <div className="text-center">
                  <h2 className="text-[13.5px] font-extrabold">{t('share.title')}</h2>
                  <p className="mt-0.5 text-[10.5px] text-[#6E7A6B]">{t('share.sub')}</p>
                </div>
                <div className="mt-3">
                  <ShareDonut
                    proteinG={plan.nutritionPlan.proteinG}
                    carbsG={plan.nutritionPlan.carbsG}
                    fatG={plan.nutritionPlan.fatG}
                    kcal={plan.nutritionPlan.kcal}
                  />
                </div>
                <button
                  onClick={openLatest}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-black/10 py-2 text-[11px] font-bold text-[#2F4410] hover:bg-[#F4F6EF]"
                >
                  {t('blocks.seeAll')} <ArrowRight size={12} />
                </button>
              </Card>

              <section
                className="relative overflow-hidden rounded-[14px] p-4"
                style={{ background: C.sage }}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg text-white"
                    style={{ background: C.panel }}
                  >
                    <Sparkles size={15} />
                  </span>
                  <span
                    className="text-[34px] leading-none"
                    style={{ color: C.lime }}
                    aria-hidden
                  >
                    ✳
                  </span>
                </div>
                <p className="mt-3 text-[15px] font-extrabold leading-snug" style={{ color: C.panel }}>
                  {t('side.tipTitle')}
                </p>
                <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-[#4A5A48]">
                  {planText(lang, plan.recoveryPlan.cardio)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[9.5px] font-bold text-[#2F4410]">
                    <MoonStar size={10} /> {t('dash.sleep', { n: plan.recoveryPlan.sleepTarget })}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[9.5px] font-bold text-[#2F4410]">
                    <Timer size={10} /> {t('dash.deload', { n: plan.recoveryPlan.deloadEveryWeeks })}
                  </span>
                </div>
                <button
                  onClick={onNew}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-extrabold text-white"
                  style={{ background: C.panel }}
                >
                  {t('nav.newPlan')} <ArrowRight size={12} />
                </button>
              </section>
            </aside>
          </div>
        )}
      </Shell>
    </motion.div>
  );
};
