import type { CSSProperties } from 'react';
import type { TextEffects } from '../../shared/schema';

/** Ombre, lueur, contour et soulignement : appliqués au paragraphe. */
export const strokeShadowStyles = (effects: TextEffects, color: string): CSSProperties => {
  const css: CSSProperties = {};
  const shadows: string[] = [];
  if (effects.shadow) {
    const { offsetX, offsetY, blur, color: shadowColor } = effects.shadow;
    shadows.push(`${offsetX}px ${offsetY}px ${blur}px ${shadowColor}`);
  }
  if (effects.glow) {
    const { radius, color: glowColor } = effects.glow;
    shadows.push(`0 0 ${radius}px ${glowColor}`, `0 0 ${radius * 2}px ${glowColor}`);
  }
  if (shadows.length > 0) css.textShadow = shadows.join(', ');
  if (effects.stroke && effects.stroke.width > 0) {
    css.WebkitTextStroke = `${effects.stroke.width}px ${effects.stroke.color}`;
    css.paintOrder = 'stroke fill';
  }
  if (effects.underline) {
    css.textDecorationLine = 'underline';
    css.textDecorationColor = effects.underline.color ?? color;
    css.textDecorationThickness = `${effects.underline.thickness}px`;
    css.textUnderlineOffset = '0.2em';
  }
  return css;
};

/** Surlignage façon marqueur (bande colorée dans la moitié basse des lignes). */
export const highlightStyle = (color: string): CSSProperties => ({
  backgroundImage: `linear-gradient(transparent 55%, ${color} 55%, ${color} 92%, transparent 92%)`,
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
});

/** Remplissage du texte par un dégradé. */
type Gradient = NonNullable<TextEffects['gradient']>;

export const gradientFillStyle = (gradient: Gradient): CSSProperties => ({
  backgroundImage: `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

/** Fond du paragraphe : bandeau (pleine largeur), pastille (arrondie) ou carte. */
export const backgroundBoxStyle = (background: TextEffects['background']): CSSProperties => {
  if (!background) return { width: '100%' };
  const base: CSSProperties = {
    backgroundColor: background.color,
    padding: background.padding,
    boxSizing: 'border-box',
  };
  switch (background.kind) {
    case 'band':
      return { ...base, width: '100%' };
    case 'pill':
      return {
        ...base,
        display: 'inline-block',
        borderRadius: 9999,
        paddingInline: background.padding * 1.6,
      };
    case 'card':
      return {
        ...base,
        width: '100%',
        borderRadius: 24,
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
      };
  }
};

/** Rideau : révélation progressive dans le sens de lecture (de droite à gauche en arabe). */
export const maskClipPath = (progress: number, rtl: boolean): string => {
  const hidden = `${((1 - progress) * 100).toFixed(2)}%`;
  return rtl ? `inset(0 0 0 ${hidden})` : `inset(0 ${hidden} 0 0)`;
};
