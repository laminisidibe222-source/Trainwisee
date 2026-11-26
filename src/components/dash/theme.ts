/**
 * Account-area palette, rebuilt from the reference sales dashboard: a light
 * grey canvas, one large white app card, a near-black forest-green sidebar and
 * a single lime accent that carries the active state, charts and highlights.
 */
export const C = {
  canvas: '#E8E9E3',
  canvasDeep: '#DFE3D6',
  panel: '#16281A',
  panelDeep: '#1F3522',
  ink: '#1B241C',
  muted: '#6E7A6B',
  lime: '#A8E04A',
  limeSoft: '#D6F0A8',
  orange: '#E0A83A',
  red: '#C0503C',
  sage: '#DDE7D2',
  line: 'rgba(27, 36, 28, 0.10)',
  // Legacy names still referenced by the older chart components.
  mustard: '#A8E04A',
  mustardSoft: '#D6F0A8',
  teal: '#7EC24A',
} as const;
