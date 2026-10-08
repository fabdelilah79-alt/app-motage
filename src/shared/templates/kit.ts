import type { IdGenerator } from '../factories';
import type { Lang, SceneElementInput, SceneInput } from '../schema';

export type Texts = Record<Lang, string>;
export const L = (fr: string, ar: string, en: string): Texts => ({ fr, ar, en });

type Box = { x: number; y: number; width: number; height: number };

const enter = (presetId: string, duration = 20, delay = 0) => ({ presetId, duration, delay });

/** Petits constructeurs d'éléments pour écrire les modèles lisiblement. */
export const makeKit = (lang: Lang, newId: IdGenerator) => {
  const id = (prefix: string) => `${prefix}-${newId()}`;
  const timing = (from: number, duration: number) => ({ from, duration });
  return {
    t: (texts: Texts) => texts[lang],
    text: (texts: Texts, box: Box, from: number, duration: number, fontSize: number, options: { bold?: boolean; color?: string; preset?: string; align?: 'start' | 'center' | 'end' } = {}): SceneElementInput => ({
      id: id('text'),
      type: 'text',
      lang,
      transform: box,
      timing: timing(from, duration),
      animations: { enter: enter(options.preset ?? 'enter.word', 25) },
      content: [{ kind: 'text', text: texts[lang] }],
      style: {
        fontSize,
        fontWeight: options.bold === false ? 400 : 700,
        color: options.color ?? 'theme.text',
        align: options.align ?? 'center',
      },
    }),
    math: (latex: string, box: Box, from: number, duration: number, fontSize = 96, steps: { latex: string; at: number }[] = []): SceneElementInput => ({
      id: id('math'),
      type: 'math',
      latex,
      fontSize,
      transform: box,
      timing: timing(from, duration),
      steps: steps.map((step) => ({ ...step, duration: 24 })),
      animations: { enter: enter('enter.terms', 40) },
    }),
    callout: (kind: 'definition' | 'remember' | 'warning' | 'example' | 'method', texts: Texts, box: Box, from: number, duration: number): SceneElementInput => ({
      id: id('callout'),
      type: 'callout',
      calloutKind: kind,
      lang,
      transform: box,
      timing: timing(from, duration),
      animations: { enter: enter('enter.slide', 20) },
      content: [{ kind: 'text', text: texts[lang] }],
    }),
    id,
  };
};

export type Kit = ReturnType<typeof makeKit>;

/** Scène avec fond du thème et transition par défaut. */
export const scene = (newId: IdGenerator, durationInFrames: number, elements: SceneElementInput[], script = ''): SceneInput => ({
  id: `scene-${newId()}`,
  durationInFrames,
  background: { type: 'theme' },
  transitionIn: { type: 'fade', durationInFrames: 15 },
  elements,
  script,
});
