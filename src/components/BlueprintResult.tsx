import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Moon, Map, Database, LogOut } from 'lucide-react';
import type { Plan } from '../types/blueprint';
import type { User } from '../lib/api';
import { Avatar } from './Logo';
import { LanguageToggle, useI18n } from '../i18n';

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
    <div className="flex items-center gap-2 text-lime-700 text-xs font-semibold uppercase tracking-wider">
      {icon} {label}
    </div>
    <p className="mt-3 text-3xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</p>
    {sub && <p className="mt-1 text-xs text-slate-600">{sub}</p>}
  </div>
);

export const BlueprintResult = ({
  plan,
  id,
  onRestart,
  user,
  onLogout,
  onOpenPlans,
}: {
  plan: Plan;
  id: number;
  onRestart: () => void;
  user?: User | null;
  onLogout?: () => void;
  onOpenPlans?: () => void;
}) => {
  const { nutritionPlan: n, trainingPlan: tp, recoveryPlan: r, roadmap } = plan;
  const { t } = useI18n();

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white text-slate-900 px-6 py-16 overflow-x-clip"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-700">
              <Database size={14} /> {t('result.saved', { n: id })}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
              {t('result.title1')} <span className="text-lime-700">{t('result.title2')}</span>
            </h1>
            <p className="mt-3 text-slate-600 max-w-xl">
              {t('result.meta', { split: tp.split, n: tp.frequency, version: plan.modelVersion })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle className="mr-1" />
            {user && (
              <span className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 max-w-[220px]">
                <Avatar label={user.name || user.email} size={20} />
                <span className="truncate">{user.name || user.email}</span>
              </span>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-all"
              >
                <LogOut size={14} /> {t('nav.logout')}
              </button>
            )}
            {onOpenPlans && (
              <button
                onClick={onOpenPlans}
                className="px-5 py-2.5 rounded-full bg-[#B6FF3C] text-black text-sm font-semibold hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all"
              >
                {t('result.myPlans')}
              </button>
            )}
            <button
              onClick={onRestart}
              className="px-6 py-2.5 rounded-full border border-slate-300 bg-white text-sm font-semibold hover:bg-slate-100 transition-all"
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
                  <p className="font-bold text-slate-900">{d.day}</p>
                  <span className="text-[10px] uppercase tracking-wider text-lime-700">{d.focus}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {d.exercises.map((e) => (
                    <li key={e.name} className="flex justify-between text-sm text-slate-700">
                      <span>{e.name}</span>
                      <span className="font-mono text-xs text-slate-600">
                        {e.sets} × {e.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">{tp.progression}</p>
        </section>

        {/* recovery + roadmap */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600">
              <Moon size={15} /> {t('result.recovery')}
            </h2>
            <p className="text-sm text-slate-700">{t('result.sleepDeload', { sleep: r.sleepTarget, weeks: r.deloadEveryWeeks })}</p>
            <p className="text-sm text-slate-600">{r.cardio}</p>
            <p className="text-xs text-slate-500">{r.readinessCheck}</p>
          </div>
          <div className="glass-card rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600">
              <Map size={15} /> {t('result.roadmap')}
            </h2>
            <ul className="space-y-3">
              {roadmap.map((w) => (
                <li key={w.weeks} className="text-sm">
                  <span className="font-mono text-xs text-lime-700 mr-2">W{w.weeks}</span>
                  <span className="text-slate-900 font-semibold">{w.focus}</span>
                  <span className="text-slate-600"> — {w.milestone}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </motion.main>
  );
};
