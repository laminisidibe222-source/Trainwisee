import { useI18n } from '../../i18n';
import type { DayVolume } from './planView';

/**
 * Weekly working sets per session, two-tone: ink for the heavy compounds that
 * open a session, lime for the accessory work behind them. Values sit above
 * each bar and the dashed line marks the weekly average.
 */
export const PerformanceBars = ({ days }: { days: DayVolume[] }) => {
  const { t } = useI18n();
  const W = 520;
  const H = 208;
  const padTop = 26;
  const padBottom = 46;
  const padLeft = 26;
  const innerH = H - padTop - padBottom;
  const max = Math.max(...days.map((d) => d.total), 1);
  const avg = days.reduce((a, d) => a + d.total, 0) / (days.length || 1);
  const bandW = (W - padLeft - 12) / (days.length || 1);
  const barW = Math.min(38, bandW * 0.42);
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('perf.chartAlt')}>
      {/* horizontal guides */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={padLeft}
          x2={W - 8}
          y1={padTop + innerH * (1 - f)}
          y2={padTop + innerH * (1 - f)}
          stroke="#0F172A"
          strokeOpacity={0.06}
          strokeWidth="1"
        />
      ))}

      {/* average */}
      <line
        x1={padLeft}
        x2={W - 8}
        y1={y(avg)}
        y2={y(avg)}
        stroke="#65A30D"
        strokeOpacity={0.55}
        strokeWidth="1.2"
        strokeDasharray="5 5"
      />
      <text x={W - 8} y={y(avg) - 6} textAnchor="end" fontSize="10" fontWeight="700" fill="#4D7C0F">
        {t('perf.avg', { n: Math.round(avg) })}
      </text>

      {days.map((d, i) => {
        const x = padLeft + bandW * i + bandW / 2;
        const top = y(d.total);
        const accessoryTop = y(d.primary + d.accessory);
        const primaryTop = y(d.primary);
        const radius = barW / 2;
        return (
          <g key={d.day + i}>
            <text x={x} y={top - 8} textAnchor="middle" fontSize="12" fontWeight="800" fill="#0F172A">
              {d.total}
            </text>
            {/* accessory work sits on top so the lime reads as the finish */}
            <rect
              x={x - barW / 2}
              y={accessoryTop}
              width={barW}
              height={Math.max(2, primaryTop - accessoryTop)}
              rx={radius}
              fill="#65A30D"
            />
            <rect
              x={x - barW / 2}
              y={primaryTop}
              width={barW}
              height={Math.max(2, padTop + innerH - primaryTop)}
              rx={radius}
              fill="#0F172A"
            />
            <text x={x} y={H - 26} textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">
              {d.day.length > 9 ? `${d.day.slice(0, 8)}…` : d.day}
            </text>
            <text x={x} y={H - 12} textAnchor="middle" fontSize="9.5" fill="#94A3B8">
              {d.focus.length > 11 ? `${d.focus.slice(0, 10)}…` : d.focus}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
