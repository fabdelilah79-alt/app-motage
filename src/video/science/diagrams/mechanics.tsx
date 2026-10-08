import { area, hatches, letter, line, numberParam, shape } from './kit';
import type { DiagramDefinition, DiagramParamField } from './types';

const COILS: readonly DiagramParamField[] = [
  { key: 'coils', kind: 'number', min: 3, max: 30, step: 1, default: 10 },
];
const INCLINE: readonly DiagramParamField[] = [
  { key: 'angle', kind: 'number', min: 5, max: 70, step: 1, default: 30 },
];

/** Mécanique : masse, ressort, poulie, plan incliné, fil, support, chariot, sol. */
export const MECHANICS: readonly DiagramDefinition[] = [
  {
    id: 'mass',
    category: 'mechanics',
    name: { fr: 'Masse', ar: 'كتلة', en: 'Mass' },
    size: { width: 180, height: 140 },
    params: [],
    render: ({ width, height, style }) => (
      <>
        <rect x={3} y={3} width={width - 6} height={height - 6} rx={8} {...shape(style)} />
        <text x={width / 2} y={height / 2} {...letter(style, height * 0.4)}>
          m
        </text>
      </>
    ),
  },
  {
    id: 'spring',
    category: 'mechanics',
    name: { fr: 'Ressort', ar: 'نابض', en: 'Spring' },
    size: { width: 360, height: 90 },
    params: COILS,
    render: ({ width, height, params, style }) => {
      const coils = Math.round(numberParam(params, COILS, 'coils'));
      const lead = width * 0.08;
      const step = (width - lead * 2) / coils;
      const mid = height / 2;
      const amp = height * 0.4;
      let d = `M0 ${mid} L${lead} ${mid}`;
      for (let index = 0; index < coils; index += 1) {
        const x = lead + index * step;
        d += ` L${x + step * 0.25} ${mid - amp} L${x + step * 0.75} ${mid + amp} L${x + step} ${mid}`;
      }
      d += ` L${width} ${mid}`;
      return <path d={d} {...line(style)} />;
    },
  },
  {
    id: 'pulley',
    category: 'mechanics',
    name: { fr: 'Poulie', ar: 'بكرة', en: 'Pulley' },
    size: { width: 200, height: 240 },
    params: [],
    render: ({ width, height, style }) => {
      const r = Math.min(width, height) * 0.38;
      const cx = width / 2;
      const cy = height - r - 4;
      return (
        <>
          <path d={`M${cx} 0 L${cx} ${cy}`} {...line(style)} />
          <path d={`M${cx - r * 0.6} 4 L${cx + r * 0.6} 4`} {...line(style, style.color, 1.5)} />
          <circle cx={cx} cy={cy} r={r} {...shape(style)} />
          <circle cx={cx} cy={cy} r={r * 0.75} {...line(style, style.color, 0.6)} />
          <circle cx={cx} cy={cy} r={r * 0.12} {...area(style, style.color)} />
        </>
      );
    },
  },
  {
    id: 'incline',
    category: 'mechanics',
    name: { fr: 'Plan incliné', ar: 'مستوى مائل', en: 'Inclined plane' },
    size: { width: 520, height: 300 },
    params: INCLINE,
    render: ({ width, height, params, style }) => {
      const angle = (numberParam(params, INCLINE, 'angle') * Math.PI) / 180;
      const base = Math.min(width - 10, (height - 10) / Math.tan(angle));
      const rise = base * Math.tan(angle);
      const y0 = height - 5;
      const arc = Math.min(base, 120) * 0.5;
      return (
        <>
          <path d={`M5 ${y0} L${5 + base} ${y0} L${5 + base} ${y0 - rise} Z`} {...shape(style)} />
          <path d={hatches(15, 5 + base, y0, 10, 18)} {...line(style, style.color, 0.5)} />
          <path
            d={`M${5 + arc} ${y0} A${arc} ${arc} 0 0 0 ${5 + arc * Math.cos(angle)} ${y0 - arc * Math.sin(angle)}`}
            {...line(style, style.accent, 0.7)}
          />
          <text x={5 + arc * 1.3} y={y0 - arc * 0.25} {...letter(style, 28, style.accent)}>
            α
          </text>
        </>
      );
    },
  },
  {
    id: 'string',
    category: 'mechanics',
    name: { fr: 'Fil', ar: 'خيط', en: 'String' },
    size: { width: 30, height: 300 },
    params: [],
    render: ({ width, height, style }) => (
      <path d={`M${width / 2} 0 L${width / 2} ${height}`} {...line(style, style.color, 0.7)} />
    ),
  },
  {
    id: 'support',
    category: 'mechanics',
    name: { fr: 'Support (plafond)', ar: 'حامل (سقف)', en: 'Support (ceiling)' },
    size: { width: 300, height: 40 },
    params: [],
    render: ({ width, height, style }) => (
      <>
        <path d={`M0 ${height - 3} L${width} ${height - 3}`} {...line(style, style.color, 1.4)} />
        {/* Hachures au-dessus du trait : symétrique vertical de celles du sol. */}
        <g transform={`translate(0 ${height}) scale(1 -1)`}>
          <path d={hatches(height, width, 3, height - 6, 16)} {...line(style, style.color, 0.5)} />
        </g>
      </>
    ),
  },
  {
    id: 'cart',
    category: 'mechanics',
    name: { fr: 'Chariot', ar: 'عربة', en: 'Cart' },
    size: { width: 300, height: 160 },
    params: [],
    render: ({ width, height, style }) => {
      const r = height * 0.16;
      return (
        <>
          <rect x={4} y={4} width={width - 8} height={height - r * 2 - 8} rx={10} {...shape(style)} />
          <circle cx={width * 0.25} cy={height - r - 2} r={r} {...shape(style, style.accent)} />
          <circle cx={width * 0.75} cy={height - r - 2} r={r} {...shape(style, style.accent)} />
        </>
      );
    },
  },
  {
    id: 'ground',
    category: 'mechanics',
    name: { fr: 'Sol hachuré', ar: 'أرضية مخططة', en: 'Hatched ground' },
    size: { width: 600, height: 40 },
    params: [],
    render: ({ width, height, style }) => (
      <>
        <path d={`M0 3 L${width} 3`} {...line(style, style.color, 1.4)} />
        <path d={hatches(height, width, 3, height - 6, 16)} {...line(style, style.color, 0.5)} />
      </>
    ),
  },
];
