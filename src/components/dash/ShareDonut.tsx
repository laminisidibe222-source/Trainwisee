import { useI18n } from '../../i18n';
import { C } from './theme';

type Slice = { key: string; label: string; grams: number; kcal: number; color: string };

const R = 54;
const STROKE = 20;
const CIRC = 2 * Math.PI * R;

/**
 * Macro split as a donut, with the biggest slice pulled out of the ring the way
 * the reference does. Values are the plan's own grams x kcal-per-gram.
 */
export const ShareDonut = ({ proteinG, carbsG, fatG, kcal }: { proteinG: number; carbsG: number; fatG: number; kcal: number }) => {
  const { t } = useI18n();
  const slices: Slice[] = [
    { key: 'protein', label: t('dial.protein'), grams: proteinG, kcal: proteinG * 4, color: C.mustard },
    { key: 'carbs', label: t('dial.carbs'), grams: carbsG, kcal: carbsG * 4, color: C.teal },
    { key: 'fat', label: t('dial.fat'), grams: fatG, kcal: fatG * 9, color: C.panel },
  ];
  const total = slices.reduce((a, s) => a + s.kcal, 0) || 1;
  const top = slices.reduce((a, s) => (s.kcal > a.kcal ? s : a), slices[0]);

  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
      <div className="relative h-[152px] w-[152px] shrink-0">
        <svg viewBox="0 0 152 152" className="h-full w-full -rotate-90" role="img" aria-label={t('dial.title')}>
          <circle cx="76" cy="76" r={R} fill="none" stroke={C.canvasDeep} strokeWidth={STROKE} />
          {slices.map((s) => {
            const len = (CIRC * s.kcal) / total;
            const dash = `${Math.max(0, len - 3)} ${CIRC}`;
            const el = (
              <circle
                key={s.key}
                cx="76"
                cy="76"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={s.key === top.key ? STROKE + 5 : STROKE}
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                opacity={0.98}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-extrabold leading-none tabular-nums text-[#23352F]">{kcal}</span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7F78]">{t('share.kcal')}</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#23352F]">{s.label}</span>
            <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#6B7F78]">{s.grams} g</span>
            <span className="w-9 shrink-0 text-right text-[11px] font-bold tabular-nums text-[#23352F]">
              {Math.round((s.kcal / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
