import { ArrowRight } from 'lucide-react';
import { planText, useI18n } from '../../i18n';
import type { DayVolume } from './planView';

/**
 * The week as a vertical timeline. The first session is the active one (that is
 * what "start here" means in the plan), the rest are queued — no invented
 * clock times, just what the session contains.
 */
export const SessionTimeline = ({ days, onOpen }: { days: DayVolume[]; onOpen: () => void }) => {
  const { t, lang } = useI18n();
  return (
    <ol className="relative mt-4 space-y-2.5 before:absolute before:bottom-4 before:left-[4.5px] before:top-4 before:w-px before:bg-slate-200">
      {days.map((d, i) => {
        const next = i === 0;
        return (
          <li key={d.day + i} className="relative pl-4">
            <span
              className={`absolute left-0 top-3.5 z-10 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                next ? 'bg-[#3E5A52]' : 'bg-slate-300'
              }`}
              aria-hidden
            />
            <button
              onClick={onOpen}
              className={`w-full rounded-2xl px-3 py-2.5 text-left transition-colors ${
                next
                  ? 'bg-[#23352F] text-white hover:bg-[#3E5A52]'
                  : 'bg-[#F3F7F5] text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className={`truncate text-[13px] font-bold ${next ? 'text-white' : 'text-slate-900'}`}>{d.day}</p>
                <span className={`shrink-0 text-[10px] font-semibold ${next ? 'text-[#E9B93B]' : 'text-slate-500'}`}>
                  ~{d.minutes} min
                </span>
              </div>
              <p className={`mt-0.5 truncate text-[11px] ${next ? 'text-white/60' : 'text-slate-500'}`}>
                {planText(lang, d.focus)} · {t('dash.exercises', { n: d.exercises })} · {d.total} {t('perf.setsShort')}
              </p>
              {next && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#E9B93B]">
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
