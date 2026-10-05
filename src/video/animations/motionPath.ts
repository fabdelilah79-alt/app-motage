export type Point = { x: number; y: number };

/** Formes de trajectoire proposées (« chemin dessiné ») ; « custom » = points saisis. */
export const PATH_FORMS = ['arc', 'wave', 'zigzag', 'loop', 'custom'] as const;
export type PathForm = (typeof PATH_FORMS)[number];

const SAMPLES = 64;

/** Points d'une trajectoire, relatifs à la position de départ de l'élément (pixels). */
export const pathPoints = (form: PathForm, width: number, height: number, custom: string) => {
  const points: Point[] = [];
  switch (form) {
    case 'arc':
      // Parabole (comme un projectile) : monte puis redescend.
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        points.push({ x: width * t, y: -height * 4 * t * (1 - t) });
      }
      return points;
    case 'wave':
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        points.push({ x: width * t, y: (-height / 2) * Math.sin(2 * Math.PI * t) });
      }
      return points;
    case 'zigzag':
      return [0, 0.25, 0.5, 0.75, 1].map((t, i) => ({
        x: width * t,
        y: i % 2 === 1 ? -height / 2 : 0,
      }));
    case 'loop':
      // Avance en faisant une boucle au milieu.
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        const angle = 2 * Math.PI * t;
        points.push({
          x: width * t + (height / 2) * Math.sin(angle),
          y: (-height / 2) * (1 - Math.cos(angle)),
        });
      }
      return points;
    case 'custom':
      return parsePoints(custom);
  }
};

/** Lit des points saisis « x,y x,y … » (le premier point est le départ). */
export const parsePoints = (text: string): Point[] => {
  const points = text
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number))
    .filter((pair): pair is [number, number] => pair.length === 2 && pair.every(Number.isFinite))
    .map(([x, y]) => ({ x, y }));
  return points.length > 0 ? points : [{ x: 0, y: 0 }];
};

/** Position sur une ligne brisée à la fraction `progress` de sa longueur totale. */
export const pointAlong = (points: readonly Point[], progress: number): Point => {
  const first = points[0] ?? { x: 0, y: 0 };
  if (points.length < 2) return first;
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1] ?? first;
    const b = points[i] ?? first;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    lengths.push(length);
    total += length;
  }
  if (total === 0) return first;
  let remaining = Math.min(1, Math.max(0, progress)) * total;
  for (let i = 0; i < lengths.length; i++) {
    const length = lengths[i] ?? 0;
    const a = points[i] ?? first;
    const b = points[i + 1] ?? first;
    if (remaining <= length || i === lengths.length - 1) {
      const t = length === 0 ? 0 : Math.min(1, remaining / length);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= length;
  }
  return points[points.length - 1] ?? first;
};
