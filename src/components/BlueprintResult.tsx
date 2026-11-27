import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Dumbbell, Moon, Map, Database, ShieldAlert } from 'lucide-react';
import type { Plan } from '../types/blueprint';
import type { User } from '../lib/api';
import { planText, useI18n, type TKey } from '../i18n';
import { Shell } from './dash/Shell';

const Cell = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="glass-card rounded-2xl border border-slate-200 p-5">
    <div className="flex items-center gap-2 text-[#2952FF] text-xs font-semibold uppercase tracking-wider">
      {icon} {label}
    </div>
    <p className="mt-3 text-3xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</p>
    {sub && <p className="mt-1 text-xs text-slate-600">{sub}</p>}
  </div>
);

export const BlueprintResult = ({
  plan,
  id,
  user,
  onRestart,
  onBack,
  onDashboard,
  onPlans,
  onLogout,
}: {
  plan: Plan;
  id: number;
  user: User;
  onRestart: () => void;
  onBack: () => void;
  onDashboard: () => void;
  onPlans: () => void;
  onLogout: () => void;
}) => {
  const { nutritionPlan: n, trainingPlan: tp, recoveryPlan: r, roadmap } = plan;
  const { t, lang } = useI18n();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Shell
        user={user}
        active="plans"
        onLogout={onLogout}
        onNavigate={(a) => (a === 'dashboard' ? onDashboard() : a === 'plans' ? onPlans() : onRestart())}
        title={
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              aria-label={t('result.back')}
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft size={15} />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {t('plans.card.title', { id })}
            </h1>
          </div>
        }
      >
        <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-700">
              <Database size={14} /> {t('result.saved')}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
              {t('result.title1')} <span className="text-[#2952FF]">{t('result.title2')}</span>
            </h1>
            <p className="mt-3 text-slate-600 max-w-xl">
              {t('result.meta', { split: planText(lang, tp.split), n: tp.frequency, version: plan.modelVersion })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRestart}
              className="rounded-full bg-[#E9B93B] px-5 py-2.5 text-sm font-bold text-[#23352F] hover:shadow-[0_10px_26px_-10px_rgba(101,163,13,0.9)]"
            >
              {t('result.startOver')}
            </button>
          </div>
        </header>

        {/* nutrition */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600">
            <Flame size={15} /> {t('result.nutrition')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Cell icon={null} label={t('result.intake')} value={`${n.kcal}`} sub={t('result.intakeSub')} />
            <Cell
              icon={null}
              label={t('result.protein')}
              value={`${n.proteinG} g`}
              sub={t('result.proteinSub', { pct: ((n.proteinG / (n.kcal / 4)) * 100).toFixed(0) })}
            />
            <Cell icon={null} label={t('result.carbs')} value={`${n.carbsG} g`} sub={t('result.carbsSub')} />
            <Cell icon={null} label={t('result.fat')} value={`${n.fatG} g`} sub={t('result.fatSub')} />
          </div>
          <p className="text-xs text-slate-500">
            {t('result.math', { bmr: n.bmr, tdee: n.tdee })}
          </p>
        </section>

        {/* training */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600">
            <Dumbbell size={15} /> {t('result.training')} — {tp.split}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tp.days.map((d) => (
              <div key={d.day} className="glass-card rounded-2xl border border-slate-200 p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-bold text-slate-900">{planText(lang, d.day)}</p>
                  <span className="text-[10px] uppercase tracking-wider text-[#2952FF]">{planText(lang, d.focus)}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {d.exercises.map((e) => (
                    <li key={e.name} className="flex justify-between text-sm text-slate-700">
                      <span>{planText(lang, e.name)}</span>
                      <span className="font-mono text-xs text-slate-600">
                        {e.sets} × {e.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">{planText(lang, tp.progression)}</p>
        </section>

        {/* injury adaptations */}
        {!!tp.substitutions?.length && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-900">
              <ShieldAlert size={15} /> {t('result.adapted')}
            </h2>
            <p className="text-xs text-amber-900/80">{t('result.adaptedSub')}</p>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {tp.substitutions.map((sub) => (
                <li key={`${sub.from}-${sub.to}`} className="text-sm">
                  <span className="text-slate-500 line-through">{sub.from}</span>
                  <span className="mx-1.5 text-amber-700">→</span>
                  <span className="font-semibold text-slate-900">{sub.to}</span>
                  <span className="block text-[11px] text-slate-600 mt-0.5">
                    {t(`injury.reason.${sub.injury}` as TKey)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* recovery + roadmap */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600">
              <Moon size={15} /> {t('result.recovery')}
            </h2>
            <p className="text-sm text-slate-700">{t('result.sleepDeload', { sleep: r.sleepTarget, weeks: r.deloadEveryWeeks })}</p>
            <p className="text-sm text-slate-600">{planText(lang, r.cardio)}</p>
            <p className="text-xs text-slate-500">{planText(lang, r.readinessCheck)}</p>
          </div>
          <div className="glass-card rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600">
              <Map size={15} /> {t('result.roadmap')}
            </h2>
            <ul className="space-y-3">
              {roadmap.map((w) => (
                <li key={w.weeks} className="text-sm">
                  <span className="font-mono text-xs text-[#2952FF] mr-2">W{w.weeks}</span>
                  <span className="text-slate-900 font-semibold">{planText(lang, w.focus)}</span>
                  <span className="text-slate-600"> — {planText(lang, w.milestone)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        </div>
      </Shell>
    </motion.div>
  );
};
