import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import type { DayVolume } from './planView';

/**
 * The week as a vertical timeline. The first session is the active one (that is
 * what "start here" means in the plan), the rest are queued — no invented
 * clock times, just what the session contains.
 */
export const SessionTimeline = ({ days, onOpen }: { days: DayVolume[]; onOpen: () => void }) => {
  const { t } = useI18n();
  return (
    <ol className="relative mt-4 space-y-2.5">
      {days.map((d, i) => {
        const next = i === 0;
        return (
          <li key={d.day + i} className="relative pl-4">
            <span
              className={`absolute left-0 top-3.5 h-2.5 w-2.5 rounded-full ${next ? 'bg-[#65A30D]' : 'bg-slate-300'}`}
              aria-hidden
            />
            {i > 0 && <span className="absolute left-[4.5px] -top-3 h-4 w-px bg-slate-300" aria-hidden />}
            <button
              onClick={onOpen}
              className={`w-full rounded-2xl px-3 py-2.5 text-left transition-colors ${
                next
                  ? 'bg-[#0F172A] text-white hover:bg-[#1B2437]'
                  : 'bg-[#F4F5F2] text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className={`truncate text-[13px] font-bold ${next ? 'text-white' : 'text-slate-900'}`}>{d.day}</p>
                <span className={`shrink-0 text-[10px] font-semibold ${next ? 'text-[#B6FF3C]' : 'text-slate-500'}`}>
                  ~{d.minutes} min
                </span>
              </div>
              <p className={`mt-0.5 truncate text-[11px] ${next ? 'text-white/60' : 'text-slate-500'}`}>
                {d.focus} · {t('dash.exercises', { n: d.exercises })} · {d.total} {t('perf.setsShort')}
              </p>
              {next && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#B6FF3C]">
                  {t('dash.startHere')} <ArrowRight size={11} />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
};
