/**
 * TrainWise brand.
 *
 * The logo is the name itself, in the athletic style we want: heavy condensed
 * italic caps, TRAIN in ink and WISE in lime. No little icon competing with the
 * word — at nav size the wordmark is the logo.
 *
 * `LogoMark` is the compact TW monogram for places a wordmark cannot go
 * (favicon, tight chips). Same two-tone split, same heavy weight.
 */
export const Logo = ({
  size = 30,
  className = '',
  tone = 'default',
}: {
  /** cap-height in px; the type size is derived from it */
  size?: number;
  className?: string;
  tone?: 'default' | 'light';
}) => (
  <span
    className={`tw-logo ${tone === 'light' ? 'tw-logo--light' : ''} ${className}`}
    style={{ fontSize: Math.round(size * 1.34) }}
    aria-label="TrainWise"
  >
    <span className="tw-logo__train">TRAIN</span>
    <span className="tw-logo__wise">WISE</span>
  </span>
);

/** Compact TW monogram — the only place the brand is not spelled out. */
export const LogoMark = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    role="img"
    aria-label="TrainWise"
  >
    <rect width="32" height="32" rx="7" fill="#0F172A" />
    <g transform="translate(-0.6 0)">
      {/* T — solid blocks stay crisp at favicon size */}
      <rect x="5" y="8.6" width="8" height="3" fill="#FFFFFF" />
      <rect x="7" y="8.6" width="3" height="14" fill="#FFFFFF" />
      {/* W, in the brand lime */}
      <path
        d="M15.6 9.2 18.4 22.5l3.2-8.6 3.2 8.6 2.9-13.3"
        stroke="#84CC16"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </g>
  </svg>
);

/** Small circular avatar used in the account chip — flat, not a gradient. */
export const Avatar = ({ label, size = 20 }: { label: string; size?: number }) => (
  <span
    className="rounded-full bg-lime-500 text-slate-900 font-extrabold flex items-center justify-center shrink-0"
    style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
    aria-hidden="true"
  >
    {label.charAt(0).toUpperCase()}
  </span>
);
