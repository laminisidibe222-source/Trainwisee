import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Dumbbell, Flame, Loader2, LogOut, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { getBlueprint, listBlueprints, type BlueprintSummary, type SavedBlueprint, type User } from '../lib/api';
import { Avatar, Logo } from './Logo';

const GOAL_LABEL: Record<string, string> = {
  lose_fat: 'Fat loss',
  build_muscle: 'Build muscle',
  recomp: 'Recomposition',
  athletic_performance: 'Performance',
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * The signed-in home. Before this existed, logging in dropped you back on the
 * marketing page with nothing to do; now the session has somewhere to land.
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
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const load = React.useCallback(() => {
    setError(null);
    setItems(null);
    listBlueprints()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your plans.'));
  }, []);

  useEffect(load, [load]);

  const open = async (id: number) => {
    setLoadingId(id);
    try {
      onOpen(await getBlueprint(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that plan.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white text-slate-900 overflow-x-clip"
    >
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <button onClick={onHome} className="flex items-center shrink-0" aria-label="TrainWise home">
          <Logo size={22} />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 max-w-[220px]">
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

      {loadingId !== null && (
        <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <Loader2 size={26} className="animate-spin text-lime-700" />
          <p className="text-sm text-slate-600">Opening your blueprint…</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">Your account</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Hi {user.name?.split(' ')[0] || 'there'}, <span className="text-lime-700">your plans</span>
          </h1>
          <p className="mt-2 text-slate-600">
            Every blueprint you generate is stored in your account. Open one to see the full split, macros and
            roadmap.
          </p>
        </header>

        {items === null && !error && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
            ))}
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

        {items?.length === 0 && (
          <div className="rounded-3xl border border-slate-200 p-10 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="font-bold text-lg">No blueprint yet</p>
              <p className="text-sm text-slate-600 mt-1">Four short steps and it lands here, saved to your account.</p>
            </div>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B6FF3C] text-black font-semibold text-sm hover:shadow-[0_8px_24px_rgba(101,163,13,0.35)] transition-all"
            >
              Build my blueprint <ArrowRight size={16} />
            </button>
          </div>
        )}

        {!!items?.length && (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((b) => (
              <button
                key={b.id}
                onClick={() => open(b.id)}
                disabled={loadingId !== null}
                className="group text-left rounded-2xl border border-slate-200 p-5 min-h-[148px] hover:border-lime-500/60 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-lime-700">
                      {GOAL_LABEL[b.goal || ''] || 'Blueprint'}
                    </p>
                    <p className="mt-1.5 text-xl font-bold tracking-tight">Blueprint #{b.id}</p>
                  </div>
                  <span className="text-slate-400 group-hover:text-lime-700 transition-colors">
                    {loadingId === b.id ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} /> {when(b.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Dumbbell size={13} /> {b.modelVersion || 'rules'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Flame size={13} /> saved to Neon
                  </span>
                </div>
              </button>
            ))}

            {/* Keeps an odd number of cards from leaving a hole, and is the
                obvious next action once you have seen your plans. */}
            <button
              onClick={onNew}
              className="rounded-2xl border border-dashed border-slate-300 p-5 min-h-[148px] flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-lime-500/60 hover:text-lime-700 hover:bg-lime-50/40 transition-all"
            >
              <Plus size={20} />
              <span className="font-semibold text-sm">New blueprint</span>
              <span className="text-xs">Four steps, saved to your account</span>
            </button>
          </div>
        )}
      </div>
    </motion.main>
  );
};
