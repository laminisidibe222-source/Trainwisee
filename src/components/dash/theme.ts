/**
 * Account-area palette, rebuilt from the blue "command palette" reference: a
 * royal-blue sidebar, a white secondary panel, a light-grey canvas and a single
 * electric blue accent. Legacy keys stay so the charts keep compiling.
 */
export const C = {
  canvas: '#F4F5F7',
  canvasDeep: '#E8EBF2',
  panel: '#1A1F36',
  panelDeep: '#11152A',
  ink: '#1A1F36',
  muted: '#8A94A6',
  blue: '#2952FF',
  blueDark: '#1B3AD9',
  paleBlue: '#E8F0FE',
  amber: '#F5A524',
  red: '#D6455D',
  line: 'rgba(26, 31, 54, 0.08)',
  // Legacy aliases used by PerformanceBars / ShareDonut.
  lime: '#2952FF',
  limeSoft: '#B9C6FF',
  orange: '#F5A524',
  sage: '#EEF1FF',
  mustard: '#7C93FF',
  mustardSoft: '#CDD7FF',
  teal: '#5B7BFF',
} as const;
