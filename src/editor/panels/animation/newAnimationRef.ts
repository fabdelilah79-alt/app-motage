import type { AnimationRef } from '../../../shared/schema';
import { getAnimationPreset } from '../../../video/animations/registry';

/** Nouvelle animation avec les réglages par défaut du préréglage. */
export const newAnimationRef = (presetId: string, delay = 0): AnimationRef | undefined => {
  const preset = getAnimationPreset(presetId);
  return preset
    ? { presetId, duration: preset.defaultDuration, delay, easing: 'smooth', params: {}, repeat: 1 }
    : undefined;
};
