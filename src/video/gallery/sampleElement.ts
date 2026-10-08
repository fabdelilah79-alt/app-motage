import type { SceneElementInput } from '../../shared/schema';
import type { AnimationPreset } from '../animations/types';

type Box = { x: number; y: number; width: number; height: number };

/** Paramètres réduits pour que les mouvements restent visibles dans une petite vignette. */
const PREVIEW_PARAMS: Record<string, Record<string, unknown>> = {
  'enter.slide': { distance: 60 },
  'exit.slide': { distance: 60 },
  'motion.move': { dx: 140, dy: 0 },
  'motion.path': { form: 'arc', width: 160, height: 70 },
  'motion.orbit': { radius: 40 },
  'motion.float': { amplitude: 12 },
  'emphasis.shake': { intensity: 14 },
};

/** Animations de l'élément d'exemple selon la catégorie du préréglage. */
const animationsFor = (preset: AnimationPreset, scale: number) => {
  const ref = {
    presetId: preset.id,
    duration: preset.defaultDuration,
    params: scale < 1 ? (PREVIEW_PARAMS[preset.id] ?? {}) : {},
  };
  switch (preset.category) {
    case 'enter':
      return { enter: { ...ref, delay: 8 } };
    case 'exit':
      return { exit: { ...ref, delay: 8 } };
    case 'emphasis':
    case 'motion':
      return { emphasis: [{ ...ref, delay: 12 }] };
  }
};

/**
 * Élément d'exemple adapté au préréglage : un texte pour les animations de texte,
 * une étoile pour le tracé, un rectangle arrondi sinon.
 */
export const sampleElement = (
  preset: AnimationPreset,
  id: string,
  box: Box,
  duration: number,
  scale = 1,
): SceneElementInput => {
  const base = {
    id,
    transform: box,
    timing: { from: 0, duration },
    animations: animationsFor(preset, scale),
  };
  const kinds = preset.compatibleElements;
  if (kinds !== 'all' && kinds.includes('math') && !kinds.includes('shape')) {
    return {
      ...base,
      type: 'math',
      latex: 'E_c = \\frac{1}{2} m v^2',
      fontSize: Math.round(box.height * 0.45),
      color: '#0f172a',
    };
  }
  if (kinds !== 'all' && kinds.includes('text') && !kinds.includes('shape')) {
    return {
      ...base,
      type: 'text',
      lang: 'fr',
      content: [{ kind: 'text', text: preset.id === 'enter.counter' ? 'v = 12,5 m/s' : 'La vitesse' }],
      style: { fontSize: Math.round(box.height * 0.42), fontWeight: 700, color: '#0f172a', align: 'center' },
    };
  }
  const drawing = kinds !== 'all' && kinds.includes('shape');
  return {
    ...base,
    type: 'shape',
    shape: drawing ? 'star' : 'rectangle',
    fill: '#38bdf8',
    stroke: '#0f172a',
    strokeWidth: Math.max(2, Math.round(box.height * 0.05)),
  };
};
