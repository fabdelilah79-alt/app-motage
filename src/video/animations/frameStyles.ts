import type { CSSProperties } from 'react';
import type { AnimationFrame, ClipInsets } from './types';

const PERSPECTIVE = 1200;

/** Couleur finale : couleur d'images clés, puis changement de couleur progressif. */
export const animatedColor = (base: string, frame: AnimationFrame): string => {
  const color = frame.colorOverride ?? base;
  const shift = frame.colorShift;
  if (!shift || shift.amount <= 0) return color;
  const kept = Math.round((1 - Math.min(1, shift.amount)) * 100);
  return `color-mix(in srgb, ${color} ${kept}%, ${shift.color})`;
};

const insetOf = (clip: ClipInsets) =>
  `inset(${clip.top.toFixed(2)}% ${clip.right.toFixed(2)}% ${clip.bottom.toFixed(2)}% ${clip.left.toFixed(2)}%)`;

/** Filtres CSS : flou, lueur, décalage de couleurs du glitch. */
export const animationFilter = (frame: AnimationFrame): string | undefined => {
  const filters: string[] = [];
  if (frame.blur > 0) filters.push(`blur(${frame.blur.toFixed(2)}px)`);
  if (frame.glow && frame.glow.radius > 0) {
    filters.push(`drop-shadow(0 0 ${frame.glow.radius.toFixed(1)}px ${frame.glow.color})`);
  }
  if (frame.glitch && frame.glitch > 0) {
    const shift = (6 * frame.glitch).toFixed(1);
    filters.push(
      `drop-shadow(${shift}px 0 rgba(255, 0, 80, 0.7))`,
      `drop-shadow(-${shift}px 0 rgba(0, 220, 255, 0.7))`,
    );
  }
  return filters.length > 0 ? filters.join(' ') : undefined;
};

/** Transformation complète : déplacement, rotations (dont 3D) et échelles. */
export const animationTransform = (frame: AnimationFrame, rotation: number, scale: number) => {
  const parts = [`translate(${frame.translateX.toFixed(2)}px, ${frame.translateY.toFixed(2)}px)`];
  if (frame.rotateX !== 0 || frame.rotateY !== 0) {
    parts.unshift(`perspective(${PERSPECTIVE}px)`);
    parts.push(`rotateX(${frame.rotateX.toFixed(2)}deg)`, `rotateY(${frame.rotateY.toFixed(2)}deg)`);
  }
  parts.push(`rotate(${(rotation + frame.rotate).toFixed(2)}deg)`);
  const s = scale * frame.scale;
  parts.push(`scale(${(s * frame.scaleX).toFixed(4)}, ${(s * frame.scaleY).toFixed(4)})`);
  return parts.join(' ');
};

/** Styles du calque d'un élément animé. */
export const layerAnimationStyle = (frame: AnimationFrame): CSSProperties => ({
  filter: animationFilter(frame),
  clipPath: frame.clip ? insetOf(frame.clip) : undefined,
});
