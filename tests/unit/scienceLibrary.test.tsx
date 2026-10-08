import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { parseDataPoints, formatDataPoints } from '../../src/editor/panels/science/dataPoints';
import { insertSnippet, SYMBOL_GROUPS } from '../../src/editor/panels/science/symbols';
import { FORMAT_PRESETS } from '../../src/shared/formats';
import { calloutKindSchema, sceneElementSchema } from '../../src/shared/schema';
import {
  createCalloutElement,
  createChartElement,
  createDiagramElement,
  createDimensionElement,
  createMathElement,
  createPlotElement,
  createVectorElement,
} from '../../src/shared/scienceFactories';
import { calloutTitle } from '../../src/video/science/calloutStyles';
import { DIAGRAM_LIST, getDiagram } from '../../src/video/science/diagrams/registry';

const format = FORMAT_PRESETS.landscape;
let counter = 0;
const newId = () => `id${++counter}`;

describe('bibliothèque de schémas', () => {
  it('contient les schémas du plan, avec des identifiants uniques et traduits', () => {
    const ids = DIAGRAM_LIST.map((diagram) => diagram.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ['mass', 'spring', 'pulley', 'incline', 'cart', 'ground', 'resistor', 'capacitor', 'ammeter', 'voltmeter', 'lens-converging', 'lens-diverging', 'mirror', 'prism', 'thermometer', 'magnet']) {
      expect(getDiagram(id)).toBeDefined();
    }
    for (const diagram of DIAGRAM_LIST) {
      expect([diagram.name.fr, diagram.name.ar, diagram.name.en].every((name) => name.length > 0)).toBe(true);
    }
  });

  it.each(DIAGRAM_LIST.map((diagram) => [diagram.id, diagram] as const))('%s se dessine', (_id, diagram) => {
    const style = { color: '#000', accent: '#f00', fill: '#eee', strokeWidth: 3, draw: { stroke: 0.5, fill: 0 } };
    const svg = renderToStaticMarkup(
      <svg>{diagram.render({ ...diagram.size, params: {}, style })}</svg>,
    );
    expect(svg).toMatch(/<(path|rect|circle)/);
    expect(svg).not.toContain('NaN');
  });
});

describe('fabriques des éléments scientifiques', () => {
  it('produisent des éléments valides', () => {
    const elements = [
      createMathElement(format, 150, newId),
      createPlotElement(format, 150, 'function', newId),
      createPlotElement(format, 150, 'data', newId),
      createChartElement(format, 150, 'pie', newId),
      createVectorElement(format, 150, newId),
      createDimensionElement(format, 150, 'ar', newId),
      createDiagramElement(format, 150, 'spring', { width: 360, height: 90 }, newId),
      ...calloutKindSchema.options.map((kind) => createCalloutElement(format, 150, kind, 'ar', newId)),
    ];
    for (const element of elements) expect(sceneElementSchema.parse(element)).toEqual(element);
  });

  it('les encadrés ont un titre dans la langue du texte', () => {
    expect(calloutTitle('remember', 'ar', '')).toBe('لنتذكر');
    expect(calloutTitle('definition', 'fr', '  ')).toBe('Définition');
    expect(calloutTitle('warning', 'en', 'Danger !')).toBe('Danger !');
  });
});

describe('outils de saisie', () => {
  it('lit un tableau de mesures collé (virgule décimale, tabulations)', () => {
    expect(parseDataPoints('0 ; 0,2\n1\t2,1\n\n2 4.3\nmauvais')).toEqual([
      [0, 0.2],
      [1, 2.1],
      [2, 4.3],
    ]);
    expect(formatDataPoints([[1, 2]])).toBe('1 ; 2');
  });

  it('insère un symbole et place le curseur dans les accolades', () => {
    expect(insertSnippet('E = ', 4, 4, '\\frac{}{}')).toEqual({ text: 'E = \\frac{}{}', cursor: 10 });
    expect(insertSnippet('ab', 1, 1, '\\pi ')).toEqual({ text: 'a\\pi b', cursor: 5 });
    expect(SYMBOL_GROUPS.length).toBeGreaterThanOrEqual(6);
  });
});
