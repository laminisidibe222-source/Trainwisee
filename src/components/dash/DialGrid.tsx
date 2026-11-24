import { useI18n, type TKey } from '../../i18n';
import type { Dial } from './planView';

const R = 26;
const C = 2 * Math.PI * R;

/**
 * Six gauges instead of six paragraphs: macro split, intake vs expenditure,
 * sleep target and how far into the 12-week block you are. All values come
 * from the plan; nothing is sampled or invented.
 */
export const DialGrid = ({ dials }: { dials: Dial[] }) => {
  const { t } = useI18n();
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3">
      {dials.map((d) => (
        <li
          key={d.key}
          className="flex flex-col items-center rounded-2xl border border-slate-900/6 bg-[#FAFBF8] px-2 py-3.5"
        >
          <div className="relative h-[68px] w-[68px]">
            <svg viewBox="0 0 68 68" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="34" cy="34" r={R} fill="none" stroke="#E2E8F0" strokeWidth="6" />
              <circle
                cx="34"
                cy="34"
                r={R}
                fill="none"
                stroke="#65A30D"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(C * Math.max(4, Math.min(100, d.pct))) / 100} ${C}`}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-[13px] font-extrabold tabular-nums text-slate-900">
              {d.pct}%
            </span>
          </div>
          <p className="mt-1.5 text-[11px] font-bold text-slate-800">{d.value}</p>
          <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {t(`dial.${d.key}` as TKey)}
          </p>
        </li>
      ))}
    </ul>
  );
};
