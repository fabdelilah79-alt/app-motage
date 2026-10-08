import { describe, expect, it } from 'vitest';
import { elementAnimationsSchema } from '../../src/shared/schema';
import { computeElementAnimation } from '../../src/video/animations/computeElementAnimation';
import { NEUTRAL_FRAME } from '../../src/video/animations/frame';
import {
  ANIMATION_PRESETS,
  PRESET_LIST,
  getAnimationPreset,
  presetsOfCategory,
} from '../../src/video/animations/registry';
import type { AnimationFrame } from '../../src/video/animations/types';

const NUMERIC = [
  'opacity',
  'translateX',
  'translateY',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'blur',
] as const;

const preset = (id: string) => {
  const found = getAnimationPreset(id);
  if (!found) throw new Error(`préréglage introuvable : ${id}`);
  return found;
};

/** Aucun effet visible sur les valeurs numériques (position, échelle, rotation, opacité…). */
const expectNeutralNumbers = (frame: AnimationFrame) => {
  for (const key of NUMERIC) expect(frame[key]).toBeCloseTo(NEUTRAL_FRAME[key], 6);
  if (frame.clip) expect(Math.max(...Object.values(frame.clip))).toBeCloseTo(0, 6);
};

/**
 * Point de départ d'une apparition : élément invisible (opacité nulle, réduit à un point,
 * masqué, non tracé) ou, pour le compteur, nombres encore à zéro.
 */
const isHidden = (frame: AnimationFrame) =>
  frame.counter === 0 ||
  frame.opacity < 0.01 ||
  frame.scale < 0.01 ||
  (frame.clip !== undefined && Math.max(...Object.values(frame.clip)) > 99.9) ||
  frame.reveal?.progress === 0 ||
  (frame.draw !== undefined && frame.draw.stroke === 0);

describe('catalogue des animations (section 6.4)', () => {
  it('contient toutes les catégories', () => {
    expect(presetsOfCategory('enter')).toHaveLength(20);
    expect(presetsOfCategory('emphasis')).toHaveLength(13);
    expect(presetsOfCategory('motion')).toHaveLength(4);
    // Symétriques des apparitions (sauf le compteur) + rétrécir en point + balayage.
    expect(presetsOfCategory('exit')).toHaveLength(21);
    expect(Object.keys(ANIMATION_PRESETS)).toHaveLength(PRESET_LIST.length);
  });

  it('a des métadonnées complètes, traduites en fr / ar / en', () => {
    for (const item of PRESET_LIST) {
      expect(item.id.startsWith(`${item.category}.`)).toBe(true);
      expect(item.name.fr && item.name.ar && item.name.en).toBeTruthy();
      expect(item.defaultDuration).toBeGreaterThan(0);
      // Seul « lettre par lettre » est incompatible avec l'arabe (repli sur « mot par mot »).
      expect(item.arabicCompatible).toBe(!item.id.endsWith('.letter'));
    }
  });
});

describe('chaque préréglage à progress 0 ; 0,5 ; 1', () => {
  for (const item of PRESET_LIST) {
    it(item.id, () => {
      const values = [0, 0.5, 1].map((progress) => item.run(progress, {}));
      for (const frame of values) {
        for (const key of NUMERIC) expect(Number.isFinite(frame[key])).toBe(true);
        expect(frame.opacity).toBeGreaterThanOrEqual(0);
        expect(frame.opacity).toBeLessThanOrEqual(1);
      }
      const [start, , end] = values;
      if (!start || !end) throw new Error('valeurs manquantes');
      if (item.category === 'enter') {
        expect(isHidden(start)).toBe(true);
        expectNeutralNumbers(end);
      }
      if (item.category === 'exit') {
        expectNeutralNumbers(start);
        expect(isHidden(end)).toBe(true);
      }
      if ((item.category === 'emphasis' || item.category === 'motion') && !item.holdAfter) {
        expectNeutralNumbers(start);
        expectNeutralNumbers(end);
      }
      expect(values).toMatchSnapshot();
    });
  }
});

describe('valeurs de quelques préréglages', () => {
  it('glisser : arrive par le côté choisi', () => {
    const params = { side: 'bottom', distance: 100 };
    expect(preset('enter.slide').run(0.5, params)).toMatchObject({ opacity: 0.5, translateY: 50 });
    expect(preset('exit.slide').run(1, { side: 'left', distance: 100 })).toMatchObject({
      opacity: 0,
      translateX: -100,
    });
  });

  it('pop : dépasse la taille finale avant de s’y poser', () => {
    const scales = [0.6, 0.7, 0.8].map((p) => preset('enter.pop').run(p, {}).scale);
    expect(Math.max(...scales)).toBeGreaterThan(1);
  });

  it('rideau : découvre depuis le côté choisi', () => {
    expect(preset('enter.wipe').run(0.25, { side: 'left' }).clip).toEqual({
      top: 0,
      right: 75,
      bottom: 0,
      left: 0,
    });
  });

  it('déplacement A → B et chemin en arc', () => {
    expect(preset('motion.move').run(1, { dx: 300, dy: -100 })).toMatchObject({
      translateX: 300,
      translateY: -100,
    });
    const top = preset('motion.path').run(0.5, { form: 'arc', width: 600, height: 200 });
    expect(top.translateX).toBeCloseTo(300, 0);
    expect(top.translateY).toBeCloseTo(-200, 0);
  });

  it('remplace des paramètres invalides par les valeurs par défaut', () => {
    expect(preset('enter.slide').run(0, { side: 'diagonale' })).toMatchObject({ translateY: 120 });
  });
});

describe('enchaînement des animations d’un élément', () => {
  const animations = (value: unknown) => elementAnimationsSchema.parse(value);

  it('apparition : délai et durée', () => {
    const value = animations({
      enter: { presetId: 'enter.fade', duration: 10, delay: 5, easing: 'linear' },
    });
    expect(computeElementAnimation(value, 100, 0).opacity).toBe(0);
    expect(computeElementAnimation(value, 100, 10).opacity).toBe(0.5);
    expect(computeElementAnimation(value, 100, 15).opacity).toBe(1);
  });

  it('disparition : se termine à la fin de l’élément', () => {
    const value = animations({ exit: { presetId: 'exit.fade', duration: 10, easing: 'linear' } });
    expect(computeElementAnimation(value, 100, 95).opacity).toBe(0.5);
    expect(computeElementAnimation(value, 100, 100).opacity).toBe(0);
  });

  it('mise en valeur répétée, puis retour à la normale', () => {
    const value = animations({
      emphasis: [{ presetId: 'emphasis.pulse', duration: 10, delay: 20, repeat: 2, easing: 'linear' }],
    });
    expect(computeElementAnimation(value, 100, 25).scale).toBeGreaterThan(1);
    expect(computeElementAnimation(value, 100, 35).scale).toBeGreaterThan(1);
    expect(computeElementAnimation(value, 100, 45).scale).toBe(1);
  });

  it('les décorations et déplacements gardent leur état final', () => {
    const value = animations({
      emphasis: [
        { presetId: 'emphasis.circle', duration: 10, delay: 0 },
        { presetId: 'motion.move', duration: 10, delay: 0, params: { dx: 50, dy: 0 } },
      ],
    });
    const after = computeElementAnimation(value, 100, 80);
    expect(after.decoration?.progress).toBe(1);
    expect(after.translateX).toBe(50);
  });

  it('ignore un préréglage inconnu', () => {
    const value = animations({ enter: { presetId: 'enter.inconnu', duration: 10 } });
    expect(computeElementAnimation(value, 100, 0)).toEqual(NEUTRAL_FRAME);
  });
});
