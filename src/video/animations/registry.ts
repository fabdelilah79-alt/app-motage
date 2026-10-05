import {
  enterBlur,
  enterElastic,
  enterFade,
  enterFlip,
  enterPop,
  enterRotate,
  enterSlide,
  enterWipe,
  enterZoomIn,
  enterZoomOut,
} from './presets/enterBasic';
import { enterCounter, enterDraw, enterGlitch, enterHandwriting } from './presets/enterSpecial';
import {
  emphasisArrow,
  emphasisBlink,
  emphasisCircle,
  emphasisColor,
  emphasisGlow,
  emphasisGrow,
  emphasisHighlight,
  emphasisPulse,
  emphasisShake,
  emphasisSwing,
  emphasisUnderline,
} from './presets/emphasis';
import { exitShrink, exitSweep, mirrorAsExit } from './presets/exit';
import { motionFloat, motionMove, motionOrbit, motionPath } from './presets/motion';
import {
  enterLetter,
  enterLine,
  enterMask,
  enterTypewriter,
  enterWord,
} from './presets/textReveal';
import type { AnimationCategory, AnimationPreset } from './types';

/** Apparitions, dans l'ordre des menus (catalogue de la section 6.4 du plan). */
const ENTERS: readonly AnimationPreset[] = [
  enterFade,
  enterSlide,
  enterZoomIn,
  enterZoomOut,
  enterPop,
  enterBlur,
  enterRotate,
  enterFlip,
  enterElastic,
  enterWipe,
  enterTypewriter,
  enterWord,
  enterLetter,
  enterLine,
  enterMask,
  enterDraw,
  enterHandwriting,
  enterGlitch,
  enterCounter,
];

/** Le compteur n'a pas de symétrique (des nombres qui « décomptent » prêteraient à confusion). */
const EXITS: readonly AnimationPreset[] = [
  ...ENTERS.filter((preset) => preset !== enterCounter).map(mirrorAsExit),
  exitShrink,
  exitSweep,
];

const EMPHASES: readonly AnimationPreset[] = [
  emphasisPulse,
  emphasisShake,
  emphasisSwing,
  emphasisGrow,
  emphasisBlink,
  emphasisColor,
  emphasisHighlight,
  emphasisUnderline,
  emphasisCircle,
  emphasisArrow,
  emphasisGlow,
];

const MOTIONS: readonly AnimationPreset[] = [motionMove, motionPath, motionOrbit, motionFloat];

export const PRESET_LIST: readonly AnimationPreset[] = [...ENTERS, ...EMPHASES, ...MOTIONS, ...EXITS];

/** Registre de tous les préréglages d'animation, indexé par identifiant. */
export const ANIMATION_PRESETS: Readonly<Record<string, AnimationPreset>> = Object.fromEntries(
  PRESET_LIST.map((preset) => [preset.id, preset]),
);

export const getAnimationPreset = (presetId: string): AnimationPreset | undefined =>
  ANIMATION_PRESETS[presetId];

export const presetsOfCategory = (category: AnimationCategory): AnimationPreset[] =>
  PRESET_LIST.filter((preset) => preset.category === category);
