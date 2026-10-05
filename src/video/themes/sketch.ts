import rough from 'roughjs';

export type SketchPath = {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  /** « fill » : hachures ou remplissage ; « stroke » : contour (animable avec « Tracé »). */
  role: 'fill' | 'stroke';
};

/** Graine numérique stable (jamais 0 : 0 ferait utiliser un hasard non reproductible). */
export const seedFromId = (id: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (Math.abs(hash) % 2147483646) + 1;
};

type SketchOptions = { stroke: string; strokeWidth: number; fill: string; seed: number };

/**
 * Version « dessinée à la main » d'un tracé SVG (Rough.js). La graine fixe garantit le même
 * dessin à chaque frame et à chaque export.
 */
export const sketchPaths = (d: string, options: SketchOptions): SketchPath[] => {
  const generator = rough.generator();
  const hasFill = options.fill !== 'none' && options.fill !== 'transparent';
  const drawable = generator.path(d, {
    seed: options.seed,
    roughness: 1.4,
    bowing: 1.2,
    stroke: options.stroke,
    strokeWidth: options.strokeWidth,
    fill: hasFill ? options.fill : undefined,
    fillStyle: 'hachure',
    fillWeight: Math.max(1, options.strokeWidth * 0.6),
    hachureGap: Math.max(6, options.strokeWidth * 3),
  });
  // toPaths produit un tracé par ensemble d'opérations, dans le même ordre.
  const roles = drawable.sets.map((set) => (set.type === 'path' ? 'stroke' : 'fill'));
  return generator.toPaths(drawable).map((path, index) => ({
    d: path.d,
    stroke: path.stroke,
    strokeWidth: path.strokeWidth,
    fill: path.fill ?? 'none',
    role: roles[index] ?? 'stroke',
  }));
};
