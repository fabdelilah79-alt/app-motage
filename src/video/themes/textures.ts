import type { CSSProperties } from 'react';
import type { Texture } from '../../shared/schema';

/** Échelle des motifs : 1 pour une vidéo de 1920 px de large. */
type TextureOptions = { lineColor: string; unit: number; rtl: boolean };

const px = (value: number, unit: number) => `${Math.max(1, Math.round(value * unit))}px`;

/**
 * Textures de fond dessinées en CSS (aucune image à charger) : papier, ardoise, quadrillage,
 * lignes de cahier (marge du côté du début de lecture), points, blueprint.
 */
export const textureStyle = (
  texture: Texture,
  color: string,
  { lineColor, unit, rtl }: TextureOptions,
): CSSProperties => {
  const base: CSSProperties = { backgroundColor: color };
  switch (texture) {
    case 'paper':
      return {
        ...base,
        backgroundImage: [
          'radial-gradient(circle at 20% 30%, rgba(120, 80, 20, 0.07), transparent 45%)',
          'radial-gradient(circle at 80% 75%, rgba(120, 80, 20, 0.08), transparent 50%)',
          `repeating-linear-gradient(35deg, rgba(0, 0, 0, 0.018) 0 ${px(2, unit)}, transparent ${px(2, unit)} ${px(5, unit)})`,
        ].join(', '),
      };
    case 'slate':
      return {
        ...base,
        backgroundImage: [
          'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.08), transparent 70%)',
          'radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.05), transparent 30%)',
          'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.35) 100%)',
        ].join(', '),
      };
    case 'grid':
      return {
        ...base,
        backgroundImage: [
          `linear-gradient(${lineColor} ${px(1, unit)}, transparent ${px(1, unit)})`,
          `linear-gradient(90deg, ${lineColor} ${px(1, unit)}, transparent ${px(1, unit)})`,
        ].join(', '),
        backgroundSize: `${px(48, unit)} ${px(48, unit)}`,
      };
    case 'lined': {
      const margin = px(140, unit);
      const marginEnd = px(143, unit);
      const side = rtl ? '270deg' : '90deg';
      return {
        ...base,
        backgroundImage: [
          `linear-gradient(${side}, transparent ${margin}, #f87171 ${margin}, #f87171 ${marginEnd}, transparent ${marginEnd})`,
          `repeating-linear-gradient(180deg, transparent 0 ${px(55, unit)}, ${lineColor} ${px(55, unit)} ${px(57, unit)})`,
        ].join(', '),
      };
    }
    case 'dots':
      return {
        ...base,
        backgroundImage: `radial-gradient(${lineColor} ${px(2.5, unit)}, transparent ${px(3, unit)})`,
        backgroundSize: `${px(36, unit)} ${px(36, unit)}`,
      };
    case 'blueprint': {
      const major = px(160, unit);
      const minor = px(32, unit);
      const thin = px(1, unit);
      const thick = px(2, unit);
      return {
        ...base,
        backgroundImage: [
          `linear-gradient(rgba(255, 255, 255, 0.28) ${thick}, transparent ${thick})`,
          `linear-gradient(90deg, rgba(255, 255, 255, 0.28) ${thick}, transparent ${thick})`,
          `linear-gradient(rgba(255, 255, 255, 0.1) ${thin}, transparent ${thin})`,
          `linear-gradient(90deg, rgba(255, 255, 255, 0.1) ${thin}, transparent ${thin})`,
        ].join(', '),
        backgroundSize: `${major} ${major}, ${major} ${major}, ${minor} ${minor}, ${minor} ${minor}`,
      };
    }
  }
};
