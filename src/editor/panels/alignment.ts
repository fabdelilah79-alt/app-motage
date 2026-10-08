import type { ProjectFormat, Transform } from '../../shared/schema';

export const ALIGNMENTS = ['left', 'centerX', 'right', 'top', 'centerY', 'bottom'] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

/** Marge de sécurité au bord de l'image (4 % du plus petit côté). */
export const safeMargin = (format: ProjectFormat) =>
  Math.round(Math.min(format.width, format.height) * 0.04);

/** Nouvelle position d'un élément aligné sur l'image (fonction pure). */
export const alignElement = (transform: Transform, format: ProjectFormat, alignment: Alignment): Transform => {
  const margin = safeMargin(format);
  const { width, height } = transform;
  switch (alignment) {
    case 'left':
      return { ...transform, x: margin };
    case 'centerX':
      return { ...transform, x: Math.round((format.width - width) / 2) };
    case 'right':
      return { ...transform, x: format.width - width - margin };
    case 'top':
      return { ...transform, y: margin };
    case 'centerY':
      return { ...transform, y: Math.round((format.height - height) / 2) };
    case 'bottom':
      return { ...transform, y: format.height - height - margin };
  }
};
