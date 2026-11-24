import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Dumbbell, Loader2, Plus, RefreshCw, ShieldAlert, Sparkles, Utensils, Waves } from 'lucide-react';
import { getBlueprint, listBlueprints, type BlueprintSummary, type SavedBlueprint, type User } from '../lib/api';
import { useI18n, type TKey } from '../i18n';
import { Shell } from './dash/Shell';

const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Plan library. It lives inside the same account frame as the dashboard, so
 * moving between "my home" and "my plans" never leaves the app shell.
 */
export const PlansPage = ({
  user,
  onOpen,
  onNew,
  onHome,
  onLogout,
}: {
  user: User;
  onOpen: (plan: SavedBlueprint) => void;
  onNew: () => void;
  onHome: () => void;
  onLogout: () => void;
}) => {
  const [items, setItems] = useState<BlueprintSummary[] | null>(null);
  const [error, setError] = useState<{ raw: string | null } | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { t, tError } = useI18n();
  const goalLabel = (goal: string | null | undefined) => t(goal ? (`goal.${goal}` as TKey) : 'goal.none');

  const load = React.useCallback(() => {
    setError(null);
    setItems(null);
    listBlueprints()
      .then(setItems)
      .catch((err) => setError({ raw: err instanceof Error ? err.message : null }));
  }, []);

  useEffect(load, [load]);

  const open = async (id: number) => {
    setLoadingId(id);
    try {
      onOpen(await getBlueprint(id));
    } catch (err) {
      setError({ raw: err instanceof Error ? err.message : null });
    } finally {
      setLoadingId(null);
    }
  };

  const navigate = (action: 'dashboard' | 'plans' | 'new') => {
    if (action === 'dashboard') onHome();
    else if (action === 'new') onNew();
    // Already here: reload rather than navigate nowhere.
    else load();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Shell
        user={user}
        active="plans"
        onNavigate={navigate}
        onLogout={onLogout}
        title={
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">{t('nav.myPlans')}</h1>
            {!!items?.length && (
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                {t('plans.count', { n: items.length })}
              </span>
            )}
          </div>
        }
      >
        {loadingId !== null && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#F4F5F2]/85 backdrop-blur-sm">
            <Loader2 size={26} className="animate-spin text-[#4D7C0F]" />
            <p className="text-sm text-slate-600">{t('plans.opening')}</p>
          </div>
        )}

        <section className="mb-4 rounded-3xl border border-slate-900/8 bg-white p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#4D7C0F]">{t('plans.eyebrow')}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {t('plans.title1', { name: user.name?.split(' ')[0] || '' })}{' '}
            <span className="text-[#4D7C0F]">{t('plans.title2')}</span>
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-slate-600">{t('plans.sub')}</p>
        </section>

        {items === null && !error && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[196px] animate-pulse rounded-3xl border border-slate-900/8 bg-white" />
            ))}
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

        {items?.length === 0 && (
          <div className="rounded-3xl border border-slate-900/8 bg-white p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-lime-100 text-[#4D7C0F]">
              <Sparkles size={22} />
            </div>
            <p className="mt-3 text-lg font-bold">{t('plans.empty.title')}</p>
            <p className="mt-1 text-sm text-slate-600">{t('plans.empty.sub')}</p>
            <button
              onClick={onNew}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#B6FF3C] px-5 py-2.5 text-sm font-bold text-[#0F172A] hover:shadow-[0_10px_26px_-10px_rgba(101,163,13,0.9)]"
            >
              {t('plans.empty.cta')} <ArrowRight size={15} />
            </button>
          </div>
        )}

        {!!items?.length && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((b, i) => (
              <button
                key={b.id}
                onClick={() => open(b.id)}
                disabled={loadingId !== null}
                className="group flex flex-col rounded-3xl border border-slate-900/8 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-lime-400/70 hover:shadow-[0_16px_36px_-24px_rgba(15,23,42,0.45)] disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4D7C0F]">
                      {goalLabel(b.goal)}
                    </p>
                    <p className="mt-1 truncate text-lg font-bold tracking-tight">
                      {t('plans.card.title', { id: b.id })}
                    </p>
                  </div>
                  <span className="shrink-0 text-slate-300 transition-colors group-hover:text-[#4D7C0F]">
                    {loadingId === b.id ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} /> {when(b.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Dumbbell size={12} /> {b.modelVersion || 'rules'}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  {i === 0 ? (
                    <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4D7C0F]">
                      {t('dash.active')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">{t('plans.card.saved')}</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 group-hover:text-[#4D7C0F]">
                    {t('plans.card.open')} <ArrowRight size={12} />
                  </span>
                </div>
              </button>
            ))}

            {/* Keeps an odd number of cards from leaving a hole, and is the
                obvious next action once you have seen your plans. */}
            <button
              onClick={onNew}
              className="flex min-h-[196px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/40 p-5 text-slate-500 transition-all hover:border-lime-400 hover:text-[#4D7C0F] hover:bg-lime-50/40"
            >
              <Plus size={20} />
              <span className="text-sm font-semibold">{t('plans.card.new')}</span>
              <span className="text-xs">{t('plans.card.newSub')}</span>
            </button>
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-slate-900/8 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{t('plans.engine.title')}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">trainwise-rules-v1</span>
          </div>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{t('plans.engine.sub')}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Waves, title: t('plans.engine.c1'), body: t('plans.engine.c1b') },
              { icon: Dumbbell, title: t('plans.engine.c2'), body: t('plans.engine.c2b') },
              { icon: ShieldAlert, title: t('plans.engine.c3'), body: t('plans.engine.c3b') },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-[#F4F5F2] p-4">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-[#4D7C0F] ring-1 ring-slate-900/5">
                  <Icon size={15} />
                </span>
                <p className="mt-2.5 text-[13px] font-bold text-slate-900">{title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-900/8 bg-white px-4 py-3 text-[11px] text-slate-500">
          <Utensils size={13} className="shrink-0 text-[#4D7C0F]" />
          {t('plans.footer')}
        </p>
      </Shell>
    </motion.div>
  );
};
