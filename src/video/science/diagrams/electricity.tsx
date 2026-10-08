import type { ReactNode } from 'react';
import { area, booleanParam, letter, line, selectParam, shape } from './kit';
import type { DiagramDefinition, DiagramParamField, DiagramRenderProps } from './types';

/** Fils de part et d'autre d'un symbole centré de largeur `body`. */
const leads = ({ width, height, style }: DiagramRenderProps, body: number) => {
  const mid = height / 2;
  const a = (width - body) / 2;
  return <path d={`M0 ${mid} L${a} ${mid} M${width - a} ${mid} L${width} ${mid}`} {...line(style)} />;
};

/** Appareil de mesure ou générateur : cercle avec une lettre ou un symbole. */
const roundComponent = (props: DiagramRenderProps, inside: ReactNode) => {
  const { width, height, style } = props;
  const r = Math.min(width * 0.3, height * 0.45);
  return (
    <>
      {leads(props, r * 2)}
      <circle cx={width / 2} cy={height / 2} r={r} {...shape(style)} />
      {inside}
    </>
  );
};

const SWITCH: readonly DiagramParamField[] = [{ key: 'closed', kind: 'boolean', default: false }];
const WIRE: readonly DiagramParamField[] = [
  { key: 'elbow', kind: 'select', options: ['horizontal-first', 'vertical-first', 'straight'], default: 'horizontal-first' },
];

const component = (
  id: string,
  name: DiagramDefinition['name'],
  render: DiagramDefinition['render'],
  params: readonly DiagramParamField[] = [],
): DiagramDefinition => ({
  id,
  category: 'electricity',
  name,
  size: { width: 240, height: 100 },
  params,
  render,
});

/** Électricité (symboles normalisés) ; fils avec coudes automatiques. */
export const ELECTRICITY: readonly DiagramDefinition[] = [
  component('generator', { fr: 'Générateur', ar: 'مولد', en: 'Generator' }, (props) =>
    roundComponent(
      props,
      <path
        d={`M${props.width / 2 - props.height * 0.3} ${props.height / 2} L${props.width / 2 + props.height * 0.3} ${props.height / 2}`}
        {...line(props.style)}
      />,
    ),
  ),
  component('battery', { fr: 'Pile', ar: 'عمود كهربائي', en: 'Battery' }, (props) => {
    const { width, height, style } = props;
    const c = width / 2;
    return (
      <>
        {leads(props, 24)}
        <path d={`M${c - 12} ${height * 0.1} L${c - 12} ${height * 0.9}`} {...line(style)} />
        <path d={`M${c + 12} ${height * 0.3} L${c + 12} ${height * 0.7}`} {...line(style, style.color, 2)} />
        <text x={c - 30} y={height * 0.18} {...letter(style, height * 0.22)}>+</text>
      </>
    );
  }),
  component('resistor', { fr: 'Résistance', ar: 'موصل أومي', en: 'Resistor' }, (props) => {
    const { width, height, style } = props;
    const body = width * 0.45;
    return (
      <>
        {leads(props, body)}
        <rect x={(width - body) / 2} y={height * 0.3} width={body} height={height * 0.4} {...shape(style)} />
      </>
    );
  }),
  component('capacitor', { fr: 'Condensateur', ar: 'مكثف', en: 'Capacitor' }, (props) => {
    const { width, height, style } = props;
    const c = width / 2;
    return (
      <>
        {leads(props, 24)}
        <path d={`M${c - 12} ${height * 0.15} L${c - 12} ${height * 0.85} M${c + 12} ${height * 0.15} L${c + 12} ${height * 0.85}`} {...line(style, style.color, 1.3)} />
      </>
    );
  }),
  component('inductor', { fr: 'Bobine', ar: 'وشيعة', en: 'Inductor' }, (props) => {
    const { width, height, style } = props;
    const body = width * 0.5;
    const start = (width - body) / 2;
    const r = body / 8;
    let d = `M${start} ${height / 2}`;
    for (let index = 0; index < 4; index += 1) d += ` a${r} ${r} 0 0 1 ${r * 2} 0`;
    return (
      <>
        {leads(props, body)}
        <path d={d} {...line(style)} />
      </>
    );
  }),
  component('lamp', { fr: 'Lampe', ar: 'مصباح', en: 'Lamp' }, (props) => {
    const { width, height, style } = props;
    const r = Math.min(width * 0.3, height * 0.45);
    const k = r * 0.7;
    return roundComponent(
      props,
      <path d={`M${width / 2 - k} ${height / 2 - k} L${width / 2 + k} ${height / 2 + k} M${width / 2 - k} ${height / 2 + k} L${width / 2 + k} ${height / 2 - k}`} {...line(style)} />,
    );
  }),
  component(
    'switch',
    { fr: 'Interrupteur', ar: 'قاطعة', en: 'Switch' },
    (props) => {
      const { width, height, params, style } = props;
      const closed = booleanParam(params, SWITCH, 'closed');
      const a = width * 0.3;
      const b = width * 0.7;
      const mid = height / 2;
      return (
        <>
          <path d={`M0 ${mid} L${a} ${mid} M${b} ${mid} L${width} ${mid}`} {...line(style)} />
          <path d={closed ? `M${a} ${mid} L${b} ${mid}` : `M${a} ${mid} L${b - 6} ${mid - height * 0.35}`} {...line(style)} />
          <circle cx={a} cy={mid} r={5} {...area(style, style.color)} />
          <circle cx={b} cy={mid} r={5} {...area(style, style.color)} />
        </>
      );
    },
    SWITCH,
  ),
  component('diode', { fr: 'Diode', ar: 'صمام ثنائي', en: 'Diode' }, (props) => {
    const { width, height, style } = props;
    const c = width / 2;
    const s = height * 0.3;
    return (
      <>
        {leads(props, 0)}
        <path d={`M${c - s} ${height / 2 - s} L${c + s * 0.8} ${height / 2} L${c - s} ${height / 2 + s} Z`} {...shape(style)} />
        <path d={`M${c + s * 0.8} ${height / 2 - s} L${c + s * 0.8} ${height / 2 + s}`} {...line(style)} />
      </>
    );
  }),
  component('led', { fr: 'DEL', ar: 'صمام ضوئي', en: 'LED' }, (props) => {
    const { width, height, style } = props;
    const c = width / 2;
    const s = height * 0.25;
    const top = height / 2 - s;
    return (
      <>
        {leads(props, 0)}
        <path d={`M${c - s} ${top} L${c + s * 0.8} ${height / 2} L${c - s} ${height / 2 + s} Z`} {...shape(style)} />
        <path d={`M${c + s * 0.8} ${top} L${c + s * 0.8} ${height / 2 + s}`} {...line(style)} />
        <path d={`M${c} ${top - 4} l${s * 0.7} ${-s * 0.7} m-8 0 h8 v8 M${c + s * 0.6} ${top - 4} l${s * 0.7} ${-s * 0.7} m-8 0 h8 v8`} {...line(style, style.accent, 0.6)} />
      </>
    );
  }),
  component('ammeter', { fr: 'Ampèremètre', ar: 'أمبيرمتر', en: 'Ammeter' }, (props) =>
    roundComponent(props, <text x={props.width / 2} y={props.height / 2} {...letter(props.style, props.height * 0.45)}>A</text>),
  ),
  component('voltmeter', { fr: 'Voltmètre', ar: 'فولطمتر', en: 'Voltmeter' }, (props) =>
    roundComponent(props, <text x={props.width / 2} y={props.height / 2} {...letter(props.style, props.height * 0.45)}>V</text>),
  ),
  {
    id: 'oscilloscope',
    category: 'electricity',
    name: { fr: 'Oscilloscope', ar: 'راسم التذبذب', en: 'Oscilloscope' },
    size: { width: 260, height: 200 },
    params: [],
    render: ({ width, height, style }) => {
      const pad = width * 0.1;
      const screenW = width - pad * 2;
      const screenH = height * 0.6;
      let wave = `M${pad} ${pad + screenH / 2}`;
      for (let index = 1; index <= 60; index += 1) {
        const x = pad + (screenW * index) / 60;
        wave += ` L${x} ${pad + screenH / 2 - Math.sin((index / 60) * Math.PI * 4) * screenH * 0.35}`;
      }
      return (
        <>
          <rect x={3} y={3} width={width - 6} height={height - 6} rx={12} {...shape(style)} />
          <rect x={pad} y={pad} width={screenW} height={screenH} rx={6} {...shape(style, '#0f172a')} />
          <path d={wave} {...line(style, '#4ade80', 0.8)} />
          <circle cx={width * 0.3} cy={height * 0.85} r={height * 0.05} {...line(style)} />
          <circle cx={width * 0.7} cy={height * 0.85} r={height * 0.05} {...line(style)} />
        </>
      );
    },
  },
  {
    id: 'wire',
    category: 'electricity',
    name: { fr: 'Fil (coude automatique)', ar: 'سلك (زاوية تلقائية)', en: 'Wire (auto elbow)' },
    size: { width: 300, height: 200 },
    params: WIRE,
    render: ({ width, height, params, style }) => {
      const elbow = selectParam(params, WIRE, 'elbow');
      const d =
        elbow === 'straight'
          ? `M0 ${height} L${width} 0`
          : elbow === 'vertical-first'
            ? `M0 ${height} L0 0 L${width} 0`
            : `M0 ${height} L${width} ${height} L${width} 0`;
      return (
        <>
          <path d={d} {...line(style)} />
          <circle cx={0} cy={height} r={style.strokeWidth * 1.6} {...area(style, style.color)} />
          <circle cx={width} cy={0} r={style.strokeWidth * 1.6} {...area(style, style.color)} />
        </>
      );
    },
  },
];
