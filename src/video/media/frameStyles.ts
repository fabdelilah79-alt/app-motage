import type { CSSProperties } from 'react';
import type { Crop, KenBurns } from '../../shared/schema';

type FrameOptions = {
  mask: 'none' | 'rounded' | 'circle';
  cornerRadius: number;
  border?: { width: number; color: string };
  shadow: boolean;
};

/** Cadre d'un média : masque (cercle, coins arrondis), bordure et ombre. */
export const mediaFrameStyle = (options: FrameOptions): CSSProperties => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  borderRadius:
    options.mask === 'circle' ? '50%' : options.mask === 'rounded' ? options.cornerRadius : 0,
  border: options.border ? `${options.border.width}px solid ${options.border.color}` : undefined,
  boxSizing: 'border-box',
  boxShadow: options.shadow ? '0 18px 40px rgba(15, 23, 42, 0.35)' : undefined,
});

/**
 * Recadrage : le média est agrandi puis décalé pour que seule la zone choisie
 * remplisse le cadre (les pourcentages sont ceux de l'image d'origine).
 */
export const cropInnerStyle = (crop: Crop): CSSProperties => {
  const visibleWidth = Math.max(0.1, 1 - (crop.left + crop.right) / 100);
  const visibleHeight = Math.max(0.1, 1 - (crop.top + crop.bottom) / 100);
  return {
    position: 'absolute',
    width: `${100 / visibleWidth}%`,
    height: `${100 / visibleHeight}%`,
    left: `${-(crop.left / visibleWidth)}%`,
    top: `${-(crop.top / visibleHeight)}%`,
  };
};

/** Ken Burns : zoom lent de 1 à `zoom` et déplacement, selon la progression (0 → 1). */
export const kenBurnsTransform = (kenBurns: KenBurns, progress: number): string | undefined => {
  if (kenBurns.zoom <= 1 && kenBurns.panX === 0 && kenBurns.panY === 0) return undefined;
  const scale = 1 + (kenBurns.zoom - 1) * progress;
  // Déplacement limité à ce que le zoom permet, pour ne jamais montrer de bord vide.
  const room = ((scale - 1) / scale) * 50;
  const x = -kenBurns.panX * room * progress;
  const y = -kenBurns.panY * room * progress;
  return `scale(${scale.toFixed(4)}) translate(${x.toFixed(3)}%, ${y.toFixed(3)}%)`;
};
