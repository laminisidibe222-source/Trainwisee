import { planText, useI18n } from '../../i18n';
import type { DayVolume } from './planView';
import { C } from './theme';

/**
 * Two planned curves across the week — working sets on the main lifts and on
 * the accessory work. The pill marks the heaviest session, so the chart never
 * needs a hover state to be readable.
 */
export const WeeklyArea = ({ days }: { days: DayVolume[] }) => {
  const { t, lang } = useI18n();
  const W = 360;
  const H = 200;
  const padX = 30;
  const padTop = 40;
  const padBottom = 28;

  const max = Math.max(...days.map((d) => Math.max(d.primary, d.accessory)), 4);
  const step = days.length > 1 ? (W - padX * 2) / (days.length - 1) : 0;
  const x = (i: number) => padX + step * i;
  const y = (v: number) => padTop + (H - padTop - padBottom) * (1 - v / max);

  const path = (values: number[]) => {
    const pts = values.map((v, i) => [x(i), y(v)] as const);
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const mx = (x0 + x1) / 2;
      d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  };

  const primary = days.map((d) => d.primary);
  const accessory = days.map((d) => d.accessory);
  const area = `${path(primary)} L ${x(days.length - 1)} ${H - padBottom} L ${x(0)} ${H - padBottom} Z`;

  const peakIndex = days.reduce((best, d, i) => (d.total > days[best].total ? i : best), 0);
  const peak = days[peakIndex];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('perf.chartAlt')}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.panel} stopOpacity="0.16" />
          <stop offset="100%" stopColor={C.panel} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((f) => {
        const yy = padTop + (H - padTop - padBottom) * f;
        return (
          <g key={f}>
            <line x1={padX - 6} x2={W - 8} y1={yy} y2={yy} stroke={C.panel} strokeOpacity={0.1} strokeDasharray="3 5" />
            <text x={0} y={yy + 3.5} fontSize="10" fontWeight="600" fill={C.muted}>
              {Math.round(max * (1 - f))}
            </text>
          </g>
        );
      })}

      {days.length > 0 && <path d={area} fill="url(#areaFill)" />}
      <path d={path(primary)} fill="none" stroke={C.panel} strokeWidth="2.4" strokeLinecap="round" />
      <path d={path(accessory)} fill="none" stroke={C.mustard} strokeWidth="2.4" strokeLinecap="round" />

      {days.map((d, i) => (
        <g key={d.day + i}>
          <circle cx={x(i)} cy={y(d.primary)} r="3.4" fill={C.panel} stroke="#fff" strokeWidth="1.8" />
          <circle cx={x(i)} cy={y(d.accessory)} r="2.6" fill={C.mustard} stroke="#fff" strokeWidth="1.4" />
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.muted}>
            {planText(lang, d.day).length > 10 ? `${planText(lang, d.day).slice(0, 9)}…` : planText(lang, d.day)}
          </text>
        </g>
      ))}

      {peak && (
        <g>
          <circle cx={x(peakIndex)} cy={y(peak.primary)} r="5.5" fill={C.mustard} stroke="#fff" strokeWidth="2" />
          <line
            x1={x(peakIndex)}
            y1={y(peak.primary) - 6}
            x2={x(peakIndex)}
            y2={Math.max(y(peak.primary) - 26, 6)}
            stroke={C.panel}
            strokeOpacity="0.35"
          />
          <g transform={`translate(${Math.min(Math.max(x(peakIndex) - 46, 2), W - 94)}, ${Math.max(y(peak.primary) - 48, 2)})`}>
            <rect width="92" height="22" rx="11" fill={C.panel} />
            <text x="46" y="15" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">
              {peak.total} {t('perf.setsShort')}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};
