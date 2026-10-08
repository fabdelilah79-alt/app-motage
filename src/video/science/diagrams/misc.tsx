import { area, letter, line, numberParam, shape } from './kit';
import type { DiagramDefinition, DiagramParamField } from './types';

const LEVEL: readonly DiagramParamField[] = [
  { key: 'level', kind: 'number', min: 0, max: 100, step: 5, default: 60 },
];

/** Divers : thermomètre, bécher, aimant, Terre et satellite, repère (O, i, j). */
export const MISC: readonly DiagramDefinition[] = [
  {
    id: 'thermometer',
    category: 'misc',
    name: { fr: 'Thermomètre', ar: 'محرار', en: 'Thermometer' },
    size: { width: 80, height: 320 },
    params: LEVEL,
    render: ({ width, height, params, style }) => {
      const level = numberParam(params, LEVEL, 'level') / 100;
      const c = width / 2;
      const r = width * 0.35;
      const tubeW = width * 0.3;
      const tubeTop = 6;
      const tubeBottom = height - r * 2;
      const liquidTop = tubeBottom - (tubeBottom - tubeTop - 10) * level;
      return (
        <>
          <rect x={c - tubeW / 2} y={tubeTop} width={tubeW} height={tubeBottom - tubeTop + 4} rx={tubeW / 2} {...shape(style)} />
          <rect x={c - tubeW * 0.25} y={liquidTop} width={tubeW * 0.5} height={tubeBottom - liquidTop + 6} {...area(style, '#ef4444')} />
          <circle cx={c} cy={height - r - 2} r={r} {...shape(style, '#ef4444')} />
        </>
      );
    },
  },
  {
    id: 'beaker',
    category: 'misc',
    name: { fr: 'Bécher', ar: 'كأس بيشر', en: 'Beaker' },
    size: { width: 200, height: 240 },
    params: LEVEL,
    render: ({ width, height, params, style }) => {
      const level = numberParam(params, LEVEL, 'level') / 100;
      const surface = height - 6 - (height - 30) * level;
      return (
        <>
          <rect x={14} y={surface} width={width - 28} height={height - 6 - surface} {...area(style, style.accent)} fillOpacity={(style.draw?.fill ?? 1) * 0.4} />
          <path d={`M4 14 L14 24 L14 ${height - 4} L${width - 14} ${height - 4} L${width - 14} 14`} {...line(style)} />
          {[0.3, 0.5, 0.7].map((mark) => (
            <path key={mark} d={`M${width - 14} ${height * mark} l-18 0`} {...line(style, style.color, 0.5)} />
          ))}
        </>
      );
    },
  },
  {
    id: 'magnet',
    category: 'misc',
    name: { fr: 'Aimant droit', ar: 'مغناطيس مستقيم', en: 'Bar magnet' },
    size: { width: 320, height: 90 },
    params: [],
    render: ({ width, height, style }) => (
      <>
        <rect x={2} y={2} width={width / 2 - 2} height={height - 4} {...shape(style, '#ef4444')} />
        <rect x={width / 2} y={2} width={width / 2 - 2} height={height - 4} {...shape(style, '#3b82f6')} />
        <text x={width / 4} y={height / 2} {...letter(style, height * 0.5, '#ffffff')}>N</text>
        <text x={(width * 3) / 4} y={height / 2} {...letter(style, height * 0.5, '#ffffff')}>S</text>
      </>
    ),
  },
  {
    id: 'earth-satellite',
    category: 'misc',
    name: { fr: 'Terre et satellite', ar: 'الأرض وقمر اصطناعي', en: 'Earth and satellite' },
    size: { width: 360, height: 360 },
    params: [],
    render: ({ width, height, style }) => {
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.2;
      const orbit = Math.min(width, height) * 0.44;
      const sx = cx + orbit * Math.cos(-Math.PI / 4);
      const sy = cy + orbit * Math.sin(-Math.PI / 4);
      return (
        <>
          <circle cx={cx} cy={cy} r={orbit} {...line(style, style.color, 0.5)} strokeDasharray={style.draw ? 1 : '8 8'} />
          <circle cx={cx} cy={cy} r={R} {...shape(style, '#3b82f6')} />
          <path d={`M${cx - R * 0.5} ${cy - R * 0.4} q${R * 0.3} ${-R * 0.3} ${R * 0.6} 0 q${R * 0.2} ${R * 0.4} ${-R * 0.2} ${R * 0.7} z`} {...area(style, '#22c55e')} />
          <rect x={sx - 14} y={sy - 9} width={28} height={18} rx={3} {...shape(style, style.accent)} />
          <path d={`M${sx - 34} ${sy} L${sx - 14} ${sy} M${sx + 14} ${sy} L${sx + 34} ${sy}`} {...line(style, style.accent, 1.4)} />
        </>
      );
    },
  },
  {
    id: 'frame',
    category: 'misc',
    name: { fr: 'Repère (O, i, j)', ar: 'معلم (O, i, j)', en: 'Frame (O, i, j)' },
    size: { width: 260, height: 260 },
    params: [],
    render: ({ width, height, style }) => {
      const ox = width * 0.15;
      const oy = height * 0.85;
      const head = (x: number, y: number, horizontal: boolean) =>
        horizontal ? `M${x} ${y} l-16 -8 l0 16 z` : `M${x} ${y} l-8 16 l16 0 z`;
      return (
        <>
          <path d={`M${ox} ${oy} L${width - 6} ${oy} M${ox} ${oy} L${ox} 6`} {...line(style)} />
          <path d={`${head(width - 4, oy, true)} ${head(ox, 4, false)}`} {...area(style, style.color)} />
          <text x={ox - 18} y={oy + 18} {...letter(style, 26)}>O</text>
          <text x={width - 20} y={oy + 24} {...letter(style, 26)}>x</text>
          <text x={ox - 22} y={18} {...letter(style, 26)}>y</text>
        </>
      );
    },
  },
];
