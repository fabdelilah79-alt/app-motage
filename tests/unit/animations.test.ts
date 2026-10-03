import { describe, expect, it } from 'vitest';
import { animationRefSchema } from '../../src/shared/schema';
import { computeElementAnimation } from '../../src/video/animations/computeElementAnimation';
import { ANIMATION_PRESETS, getAnimationPreset } from '../../src/video/animations/registry';
import { NEUTRAL_FRAME } from '../../src/video/animations/types';

const preset = (id: string) => {
  const found = getAnimationPreset(id);
  if (!found) {
    throw new Error(`préréglage introuvable : ${id}`);
  }
  return found;
};

describe('registre des animations', () => {
  it('contient Fondu, Glisser et les apparitions de texte', () => {
    expect(Object.keys(ANIMATION_PRESETS).sort()).toEqual([
      'enter.fade',
      'enter.letter',
      'enter.line',
      'enter.mask',
      'enter.slide',
      'enter.typewriter',
      'enter.word',
      'exit.fade',
      'exit.slide',
    ]);
  });

  it('a des métadonnées complètes et traduites en fr / ar / en', () => {
    for (const item of Object.values(ANIMATION_PRESETS)) {
      expect(item.id.startsWith(`${item.category}.`)).toBe(true);
      expect(item.name.fr && item.name.ar && item.name.en).toBeTruthy();
      expect(item.defaultDuration).toBeGreaterThan(0);
      // Seul « lettre par lettre » est incompatible avec l'arabe (repli sur « mot par mot »).
      expect(item.arabicCompatible).toBe(item.id !== 'enter.letter');
    }
  });

  it('les apparitions de texte transmettent leur progression au rendu du texte', () => {
    for (const mode of ['typewriter', 'word', 'line', 'letter', 'mask']) {
      const item = preset(`enter.${mode}`);
      expect(item.compatibleElements).toEqual(['text']);
      expect(item.run(0.4, {})).toEqual({ ...NEUTRAL_FRAME, reveal: { mode, progress: 0.4 } });
    }
  });
});

describe('préréglages (progress 0 ; 0,5 ; 1)', () => {
  it('enter.fade', () => {
    expect(preset('enter.fade').run(0, {}).opacity).toBe(0);
    expect(preset('enter.fade').run(0.5, {}).opacity).toBe(0.5);
    expect(preset('enter.fade').run(1, {})).toEqual(NEUTRAL_FRAME);
  });

  it('exit.fade', () => {
    expect(preset('exit.fade').run(0, {})).toEqual(NEUTRAL_FRAME);
    expect(preset('exit.fade').run(0.5, {}).opacity).toBe(0.5);
    expect(preset('exit.fade').run(1, {}).opacity).toBe(0);
  });

  it('enter.slide arrive par le bas', () => {
    const params = { side: 'bottom', distance: 100 };
    expect(preset('enter.slide').run(0, params)).toMatchObject({ opacity: 0, translateY: 100 });
    expect(preset('enter.slide').run(0.5, params)).toMatchObject({ opacity: 0.5, translateY: 50 });
    expect(preset('enter.slide').run(1, params)).toEqual({ ...NEUTRAL_FRAME, translateY: 0 });
  });

  it('exit.slide part vers la gauche', () => {
    const params = { side: 'left', distance: 100 };
    expect(preset('exit.slide').run(0, params)).toMatchObject({ opacity: 1, translateX: -0 });
    expect(preset('exit.slide').run(0.5, params)).toMatchObject({ opacity: 0.5, translateX: -50 });
    expect(preset('exit.slide').run(1, params)).toMatchObject({ opacity: 0, translateX: -100 });
  });

  it('remplace des paramètres invalides par les valeurs par défaut', () => {
    expect(preset('enter.slide').run(0, { side: 'diagonale' })).toMatchObject({
      translateX: 0,
      translateY: 120,
    });
  });
});

describe('computeElementAnimation', () => {
  const ref = (value: Record<string, unknown>) => animationRefSchema.parse(value);

  it('applique le délai et la durée de l’apparition', () => {
    const animations = {
      enter: ref({ presetId: 'enter.fade', duration: 10, delay: 5, easing: 'linear' }),
    };
    expect(computeElementAnimation(animations, 100, 0).opacity).toBe(0);
    expect(computeElementAnimation(animations, 100, 10).opacity).toBe(0.5);
    expect(computeElementAnimation(animations, 100, 15).opacity).toBe(1);
  });

  it('termine la disparition à la fin de l’élément', () => {
    const animations = { exit: ref({ presetId: 'exit.fade', duration: 10, easing: 'linear' }) };
    expect(computeElementAnimation(animations, 100, 90).opacity).toBe(1);
    expect(computeElementAnimation(animations, 100, 95).opacity).toBe(0.5);
    expect(computeElementAnimation(animations, 100, 100).opacity).toBe(0);
  });

  it('ignore un préréglage inconnu', () => {
    const animations = { enter: ref({ presetId: 'enter.inconnu', duration: 10 }) };
    expect(computeElementAnimation(animations, 100, 0)).toEqual(NEUTRAL_FRAME);
  });
});
