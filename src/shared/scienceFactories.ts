import { enterFade, randomId, type IdGenerator } from './factories';
import type {
  CalloutElement,
  CalloutKind,
  ChartElement,
  ChartKind,
  DiagramElement,
  DimensionElement,
  Lang,
  MathElement,
  Plot2DElement,
  ProjectFormat,
  VectorElement,
} from './schema';

/** Boîte centrée ; tailles prévues pour 1920 px de large, adaptées au format. */
const centered = (format: ProjectFormat, width: number, height: number) => {
  const scale = Math.min(format.width / 1920, format.height / 1080) || 1;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  return {
    x: Math.round((format.width - w) / 2),
    y: Math.round((format.height - h) / 2),
    width: w,
    height: h,
    rotation: 0,
    scale: 1,
    opacity: 1,
  };
};

const base = (prefix: string, format: ProjectFormat, duration: number, size: [number, number], newId: IdGenerator) => ({
  id: `${prefix}-${newId()}`,
  name: '',
  locked: false,
  hidden: false,
  transform: centered(format, size[0], size[1]),
  timing: { from: 0, duration },
  animations: { enter: enterFade(), emphasis: [] },
});

export const createMathElement = (
  format: ProjectFormat,
  duration: number,
  newId: IdGenerator = randomId,
): MathElement => ({
  ...base('math', format, duration, [1000, 220], newId),
  type: 'math',
  latex: 'E_c = \\frac{1}{2} m v^2',
  color: 'theme.text',
  fontSize: 96,
  align: 'center',
  steps: [],
  animations: {
    enter: { presetId: 'enter.terms', duration: 40, delay: 0, easing: 'linear', params: {}, repeat: 1 },
    emphasis: [],
  },
});

export type PlotPreset = 'function' | 'data';

const axes = (overrides: Partial<Plot2DElement['axes']>): Plot2DElement['axes'] => ({
  xMin: -1,
  xMax: 10,
  yMin: -1,
  yMax: 10,
  xStep: 0,
  yStep: 0,
  grid: true,
  arrows: true,
  showNumbers: true,
  xLabel: 'x',
  yLabel: 'y',
  color: 'theme.text',
  gridColor: 'theme.grid',
  fontSize: 28,
  ...overrides,
});

const seriesStyle = {
  color: 'theme.accent1',
  width: 5,
  dashed: false,
  label: '',
  drawStart: 0,
  drawDuration: 45,
  params: {},
};

/** Repère avec une courbe y = f(x) (parabole) ou des données mesurées modélisées. */
export const createPlotElement = (
  format: ProjectFormat,
  duration: number,
  preset: PlotPreset,
  newId: IdGenerator = randomId,
): Plot2DElement => {
  const seriesId = `serie-${newId()}`;
  const common = base('plot', format, duration, [1100, 700], newId);
  if (preset === 'data') {
    return {
      ...common,
      type: 'plot2d',
      axes: axes({ xMin: 0, xMax: 6, yMin: 0, yMax: 14, xLabel: 't (s)', yLabel: 'x (m)' }),
      series: [
        {
          ...seriesStyle,
          id: seriesId,
          kind: 'data',
          points: [
            [0, 0.2],
            [1, 2.1],
            [2, 4.3],
            [3, 6.0],
            [4, 8.2],
            [5, 9.9],
          ],
          fit: 'affine',
          showEquation: true,
          marker: 'circle',
        },
      ],
      decorations: [],
    };
  }
  return {
    ...common,
    type: 'plot2d',
    axes: axes({ xMin: -4, xMax: 4, yMin: -1, yMax: 10 }),
    series: [{ ...seriesStyle, id: seriesId, kind: 'function', expr: 'a*x^2', params: { a: { value: 0.5, start: 0, duration: 60, easing: 'smooth' } } }],
    decorations: [],
  };
};

export const createChartElement = (
  format: ProjectFormat,
  duration: number,
  chartKind: ChartKind,
  newId: IdGenerator = randomId,
): ChartElement => ({
  ...base('chart', format, duration, [1000, 600], newId),
  type: 'chart',
  chartKind,
  items: [
    { label: 'A', value: 12 },
    { label: 'B', value: 7 },
    { label: 'C', value: 4 },
  ],
  values: [9.8, 9.7, 9.9, 9.81, 9.75, 9.85, 9.6, 9.9, 9.82, 9.79, 9.7, 9.88],
  bins: 5,
  showValues: true,
  unit: '',
  textColor: 'theme.text',
  growDuration: 40,
  stagger: 6,
  fontSize: 30,
});

export const createVectorElement = (
  format: ProjectFormat,
  duration: number,
  newId: IdGenerator = randomId,
): VectorElement => ({
  ...base('vector', format, duration, [500, 400], newId),
  type: 'vector',
  originX: 0.2,
  originY: 0.75,
  angle: 30,
  value: 10,
  unit: 'N',
  pxPerUnit: 30,
  label: '\\vec{F}',
  showValue: false,
  showComponents: false,
  showAngle: false,
  color: 'theme.accent1',
  componentColor: 'theme.muted',
  strokeWidth: 6,
  animations: {
    enter: { presetId: 'enter.draw', duration: 30, delay: 0, easing: 'smooth', params: {}, repeat: 1 },
    emphasis: [],
  },
});

export const createDimensionElement = (
  format: ProjectFormat,
  duration: number,
  lang: Lang,
  newId: IdGenerator = randomId,
): DimensionElement => ({
  ...base('dimension', format, duration, [500, 120], newId),
  type: 'dimension',
  label: 'L = 2 m',
  lang,
  color: 'theme.text',
  strokeWidth: 3,
  fontSize: 36,
});

export const createDiagramElement = (
  format: ProjectFormat,
  duration: number,
  diagramId: string,
  size: { width: number; height: number },
  newId: IdGenerator = randomId,
): DiagramElement => ({
  ...base('diagram', format, duration, [size.width, size.height], newId),
  type: 'diagram',
  diagramId,
  params: {},
  label: '',
  color: 'theme.text',
  accent: 'theme.accent1',
  fill: 'theme.surface',
  strokeWidth: 3,
});

const CALLOUT_SAMPLE: Record<Lang, string> = {
  fr: "L'énergie cinétique d'un corps dépend de sa masse et de sa vitesse.",
  ar: 'تتعلق الطاقة الحركية لجسم بكتلته وسرعته.',
  en: 'The kinetic energy of a body depends on its mass and speed.',
};

export const createCalloutElement = (
  format: ProjectFormat,
  duration: number,
  calloutKind: CalloutKind,
  lang: Lang,
  newId: IdGenerator = randomId,
): CalloutElement => ({
  ...base('callout', format, duration, [1100, 300], newId),
  type: 'callout',
  calloutKind,
  lang,
  title: '',
  content: [{ kind: 'text', text: CALLOUT_SAMPLE[lang] }],
  fontSize: 40,
});
