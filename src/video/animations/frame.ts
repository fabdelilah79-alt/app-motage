import type { AnimationFrame, ClipInsets } from './types';

export const NEUTRAL_FRAME: AnimationFrame = {
  opacity: 1,
  translateX: 0,
  translateY: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  blur: 0,
};

/** Un état neutre modifié par quelques valeurs. */
export const frameWith = (values: Partial<AnimationFrame>): AnimationFrame => ({
  ...NEUTRAL_FRAME,
  ...values,
});

const mergeClip = (a?: ClipInsets, b?: ClipInsets): ClipInsets | undefined =>
  a && b
    ? {
        top: Math.max(a.top, b.top),
        right: Math.max(a.right, b.right),
        bottom: Math.max(a.bottom, b.bottom),
        left: Math.max(a.left, b.left),
      }
    : (a ?? b);

/** Combine deux états : effets multipliés (opacité, échelle) ou additionnés (positions, angles). */
export const combineFrames = (a: AnimationFrame, b: AnimationFrame): AnimationFrame => ({
  opacity: a.opacity * b.opacity,
  translateX: a.translateX + b.translateX,
  translateY: a.translateY + b.translateY,
  scale: a.scale * b.scale,
  scaleX: a.scaleX * b.scaleX,
  scaleY: a.scaleY * b.scaleY,
  rotate: a.rotate + b.rotate,
  rotateX: a.rotateX + b.rotateX,
  rotateY: a.rotateY + b.rotateY,
  blur: a.blur + b.blur,
  clip: mergeClip(a.clip, b.clip),
  glow: b.glow ?? a.glow,
  glitch: Math.max(a.glitch ?? 0, b.glitch ?? 0) || undefined,
  reveal: b.reveal ?? a.reveal,
  draw: b.draw ?? a.draw,
  colorShift: b.colorShift ?? a.colorShift,
  colorOverride: b.colorOverride ?? a.colorOverride,
  decoration: b.decoration ?? a.decoration,
  counter: b.counter ?? a.counter,
});
