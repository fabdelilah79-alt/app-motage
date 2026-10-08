import { area, line, shape } from './kit';

/** Hachures au dos du miroir (à droite du trait). */
const mirrorHatches = (height: number, depth: number) => {
  const parts: string[] = [];
  for (let y = 0; y < height - depth; y += 18) parts.push(`M8 ${y + depth} l${depth} ${-depth}`);
  return parts.join(' ');
};
import type { DiagramDefinition } from './types';

/** Pointe de flèche (triangle) en (x, y), orientée selon `angle` (radians). */
const tip = (x: number, y: number, angle: number, size: number) =>
  `M${x} ${y} L${x - size * Math.cos(angle - 0.45)} ${y - size * Math.sin(angle - 0.45)} L${x - size * Math.cos(angle + 0.45)} ${y - size * Math.sin(angle + 0.45)} Z`;

const lens = (id: string, name: DiagramDefinition['name'], converging: boolean): DiagramDefinition => ({
  id,
  category: 'optics',
  name,
  size: { width: 80, height: 320 },
  params: [],
  render: ({ width, height, style }) => {
    const c = width / 2;
    const s = Math.min(width * 0.4, 24);
    // Convergente : flèches vers l'extérieur ; divergente : vers l'intérieur.
    const top = converging ? tip(c, 2, -Math.PI / 2, s) : tip(c, s + 2, Math.PI / 2, s);
    const bottom = converging
      ? tip(c, height - 2, Math.PI / 2, s)
      : tip(c, height - s - 2, -Math.PI / 2, s);
    return (
      <>
        <path d={`M${c} 2 L${c} ${height - 2}`} {...line(style)} />
        <path d={`${top} ${bottom}`} {...area(style, style.color)} />
      </>
    );
  },
});

/** Optique : lentilles, miroir, prisme, rayon lumineux, écran, source, œil. */
export const OPTICS: readonly DiagramDefinition[] = [
  lens('lens-converging', { fr: 'Lentille convergente', ar: 'عدسة مجمعة', en: 'Converging lens' }, true),
  lens('lens-diverging', { fr: 'Lentille divergente', ar: 'عدسة مفرقة', en: 'Diverging lens' }, false),
  {
    id: 'mirror',
    category: 'optics',
    name: { fr: 'Miroir plan', ar: 'مرآة مستوية', en: 'Plane mirror' },
    size: { width: 50, height: 300 },
    params: [],
    render: ({ width, height, style }) => (
      <>
        <path d={`M8 0 L8 ${height}`} {...line(style, style.color, 1.5)} />
        <path d={mirrorHatches(height, Math.min(width - 12, 24))} {...line(style, style.color, 0.5)} />
      </>
    ),
  },
  {
    id: 'prism',
    category: 'optics',
    name: { fr: 'Prisme', ar: 'موشور', en: 'Prism' },
    size: { width: 260, height: 230 },
    params: [],
    render: ({ width, height, style }) => (
      <path d={`M${width / 2} 4 L${width - 4} ${height - 4} L4 ${height - 4} Z`} {...shape(style, style.accent)} fillOpacity={0.35} />
    ),
  },
  {
    id: 'ray',
    category: 'optics',
    name: { fr: 'Rayon lumineux', ar: 'شعاع ضوئي', en: 'Light ray' },
    size: { width: 400, height: 40 },
    params: [],
    render: ({ width, height, style }) => (
      <>
        <path d={`M0 ${height / 2} L${width} ${height / 2}`} {...line(style, style.accent)} />
        <path d={tip(width / 2 + 12, height / 2, 0, 22)} {...area(style, style.accent)} />
      </>
    ),
  },
  {
    id: 'screen',
    category: 'optics',
    name: { fr: 'Écran', ar: 'شاشة', en: 'Screen' },
    size: { width: 40, height: 320 },
    params: [],
    render: ({ width, height, style }) => (
      <rect x={width * 0.3} y={0} width={width * 0.4} height={height} {...shape(style, style.color)} />
    ),
  },
  {
    id: 'source',
    category: 'optics',
    name: { fr: 'Source lumineuse', ar: 'منبع ضوئي', en: 'Light source' },
    size: { width: 160, height: 160 },
    params: [],
    render: ({ width, height, style }) => {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * 0.2;
      const rays = Array.from({ length: 8 }, (_, index) => {
        const a = (index * Math.PI) / 4;
        return `M${cx + Math.cos(a) * r * 1.4} ${cy + Math.sin(a) * r * 1.4} L${cx + Math.cos(a) * r * 2.3} ${cy + Math.sin(a) * r * 2.3}`;
      }).join(' ');
      return (
        <>
          <circle cx={cx} cy={cy} r={r} {...shape(style, style.accent)} />
          <path d={rays} {...line(style, style.accent)} />
        </>
      );
    },
  },
  {
    id: 'eye',
    category: 'optics',
    name: { fr: 'Œil', ar: 'عين', en: 'Eye' },
    size: { width: 200, height: 110 },
    params: [],
    render: ({ width, height, style }) => {
      const mid = height / 2;
      return (
        <>
          <path d={`M4 ${mid} Q${width / 2} ${-mid * 0.6} ${width - 4} ${mid} Q${width / 2} ${height + mid * 0.6} 4 ${mid} Z`} {...shape(style)} />
          <circle cx={width / 2} cy={mid} r={height * 0.28} {...shape(style, style.accent)} />
          <circle cx={width / 2} cy={mid} r={height * 0.12} {...area(style, style.color)} />
        </>
      );
    },
  },
];
