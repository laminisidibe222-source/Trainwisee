import { useI18n } from '../../i18n';
import type { DayVolume } from './planView';
import { C } from './theme';

/**
 * Working sets per session, two-tone: deep green for the compounds that open a
 * session, mustard for the accessory work behind them. Ticks on the left and a
 * single label per bar, so it stays legible at phone width.
 */
export const PerformanceBars = ({ days }: { days: DayVolume[] }) => {
  const { t } = useI18n();
  const W = 340;
  const H = 190;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 28;
  const innerH = H - padTop - padBottom;
  const max = Math.max(...days.map((d) => d.total), 1);
  const avg = days.reduce((a, d) => a + d.total, 0) / (days.length || 1);
  const bandW = (W - padLeft - 10) / (days.length || 1);
  const barW = Math.min(26, bandW * 0.44);
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('perf.chartAlt')}>
      {/* y ticks */}
      {[0, 0.5, 1].map((f) => {
        const v = Math.round(max * f);
        return (
          <g key={f}>
            <line
              x1={padLeft - 4}
              x2={W - 8}
              y1={padTop + innerH * (1 - f)}
              y2={padTop + innerH * (1 - f)}
              stroke={C.panel}
              strokeOpacity={0.08}
            />
            <text x={0} y={padTop + innerH * (1 - f) + 4} fontSize="10.5" fontWeight="600" fill={C.muted}>
              {v}
            </text>
          </g>
        );
      })}

      <line
        x1={padLeft}
        x2={W - 8}
        y1={y(avg)}
        y2={y(avg)}
        stroke={C.mustard}
        strokeWidth="1.4"
        strokeDasharray="4 4"
      />

      {days.map((d, i) => {
        const x = padLeft + bandW * i + bandW / 2;
        const top = y(d.total);
        const accessoryTop = y(d.primary + d.accessory);
        const primaryTop = y(d.primary);
        return (
          <g key={d.day + i}>
            <text x={x} y={top - 6} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.ink}>
              {d.total}
            </text>
            <rect
              x={x - barW / 2}
              y={accessoryTop}
              width={barW}
              height={Math.max(2, primaryTop - accessoryTop)}
              rx={5}
              fill={C.mustard}
            />
            <rect
              x={x - barW / 2}
              y={primaryTop}
              width={barW}
              height={Math.max(2, padTop + innerH - primaryTop)}
              rx={5}
              fill={C.panel}
            />
            <text x={x} y={H - 10} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.muted}>
              {d.day.length > 9 ? `${d.day.slice(0, 8)}…` : d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
