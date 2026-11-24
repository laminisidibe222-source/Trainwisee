import { useI18n } from '../../i18n';
import type { DayVolume } from './planView';

/**
 * Working sets per session, two-tone: ink for the heavy compounds that open a
 * session, lime for the accessory work behind them. One label per bar and the
 * average moved into the legend, so nothing has to be truncated or clipped at
 * phone width.
 */
export const PerformanceBars = ({ days }: { days: DayVolume[] }) => {
  const { t } = useI18n();
  const W = 520;
  const H = 172;
  const padTop = 26;
  const padBottom = 30;
  const padLeft = 22;
  const innerH = H - padTop - padBottom;
  const max = Math.max(...days.map((d) => d.total), 1);
  const avg = days.reduce((a, d) => a + d.total, 0) / (days.length || 1);
  const bandW = (W - padLeft - 10) / (days.length || 1);
  const barW = Math.min(34, bandW * 0.44);
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('perf.chartAlt')}>
      {/* horizontal guides */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={padLeft}
          x2={W - 6}
          y1={padTop + innerH * (1 - f)}
          y2={padTop + innerH * (1 - f)}
          stroke="#0F172A"
          strokeOpacity={0.06}
          strokeWidth="1"
        />
      ))}

      {/* weekly average */}
      <line
        x1={padLeft}
        x2={W - 6}
        y1={y(avg)}
        y2={y(avg)}
        stroke="#65A30D"
        strokeOpacity={0.55}
        strokeWidth="1.2"
        strokeDasharray="5 5"
      />

      {days.map((d, i) => {
        const x = padLeft + bandW * i + bandW / 2;
        const top = y(d.total);
        const accessoryTop = y(d.primary + d.accessory);
        const primaryTop = y(d.primary);
        const radius = barW / 2;
        return (
          <g key={d.day + i}>
            <text x={x} y={top - 7} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0F172A">
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
            <text x={x} y={H - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">
              {d.day.length > 12 ? `${d.day.slice(0, 11)}…` : d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
