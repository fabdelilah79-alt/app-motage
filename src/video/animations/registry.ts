import { enterFade, exitFade } from './presets/fade';
import { enterSlide, exitSlide } from './presets/slide';
import {
  enterLetter,
  enterLine,
  enterMask,
  enterTypewriter,
  enterWord,
} from './presets/textReveal';
import type { AnimationPreset } from './types';

/** Registre de tous les préréglages d'animation, indexé par identifiant. */
export const ANIMATION_PRESETS: Readonly<Record<string, AnimationPreset>> = Object.fromEntries(
  [
    enterFade,
    enterSlide,
    enterTypewriter,
    enterWord,
    enterLine,
    enterLetter,
    enterMask,
    exitFade,
    exitSlide,
  ].map((preset) => [preset.id, preset]),
);

export const getAnimationPreset = (presetId: string): AnimationPreset | undefined =>
  ANIMATION_PRESETS[presetId];
