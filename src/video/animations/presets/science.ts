import { z } from 'zod';
import { definePreset } from '../definePreset';
import { frameWith } from '../frame';

const noParams = z.object({});

/** Équation : les termes apparaissent l'un après l'autre (E_c, puis =, puis ½…). */
export const enterTerms = definePreset({
  id: 'enter.terms',
  name: { fr: 'Terme par terme', ar: 'حدًّا بحدّ', en: 'Term by term' },
  category: 'enter',
  defaultDuration: 40,
  compatibleElements: ['math'],
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => frameWith({ reveal: { mode: 'word', progress } }),
});

const termEmphasis = (
  style: 'highlight' | 'box',
  name: Record<'fr' | 'ar' | 'en', string>,
  defaultColor: string,
) =>
  definePreset({
    id: style === 'highlight' ? 'emphasis.term' : 'emphasis.termBox',
    name,
    category: 'emphasis',
    defaultDuration: 20,
    compatibleElements: ['math'],
    arabicCompatible: true,
    holdAfter: true,
    paramFields: [
      { key: 'term', kind: 'number', min: 1, max: 30, step: 1 },
      { key: 'color', kind: 'color' },
    ],
    paramsSchema: z.object({
      /** Numéro du terme, à partir de 1 (comme on le compte à voix haute). */
      term: z.number().int().min(1).default(1),
      color: z.string().default(defaultColor),
    }),
    apply: (progress, { term, color }) =>
      frameWith({ term: { index: term - 1, progress, color, style } }),
  });

export const emphasisTerm = termEmphasis(
  'highlight',
  { fr: 'Surbrillance d’un terme', ar: 'إبراز حدّ', en: 'Highlight a term' },
  '#fde047',
);

export const emphasisTermBox = termEmphasis(
  'box',
  { fr: 'Encadrer un terme', ar: 'تأطير حدّ', en: 'Box a term' },
  '#ef4444',
);
