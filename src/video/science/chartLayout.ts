export type ChartItem = { label: string; value: number; color?: string };

/** Regroupe des valeurs brutes en classes de même largeur (histogramme). */
export const histogramBins = (values: readonly number[], bins: number): ChartItem[] => {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length === 0 || bins < 1) return [];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const width = (max - min) / bins || 1;
  const counts = Array.from({ length: bins }, () => 0);
  for (const value of finite) {
    const index = Math.min(bins - 1, Math.floor((value - min) / width));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  const round = (value: number) => Number(value.toPrecision(3));
  return counts.map((count, index) => ({
    label: `[${round(min + index * width)} ; ${round(min + (index + 1) * width)}[`,
    value: count,
  }));
};

/** Progression de croissance de chaque barre / secteur, avec un décalage entre eux. */
export const staggeredProgress = (
  count: number,
  frame: number,
  growDuration: number,
  stagger: number,
): number[] =>
  Array.from({ length: count }, (_, index) =>
    Math.min(1, Math.max(0, (frame - index * stagger) / Math.max(1, growDuration))),
  );

export type PieSlice = { start: number; end: number };

/**
 * Secteurs (angles en radians, depuis midi dans le sens horaire). Ils se déploient l'un
 * après l'autre : `progress` (0 → 1) parcourt tout le disque.
 */
export const pieSlices = (values: readonly number[], progress: number): PieSlice[] => {
  const positive = values.map((value) => Math.max(0, value));
  const total = positive.reduce((sum, value) => sum + value, 0) || 1;
  const limit = Math.PI * 2 * Math.min(1, Math.max(0, progress));
  let angle = 0;
  return positive.map((value) => {
    const start = Math.min(angle, limit);
    angle += (value / total) * Math.PI * 2;
    return { start, end: Math.min(angle, limit) };
  });
};

/** Chemin SVG d'un secteur de disque. */
export const slicePath = (cx: number, cy: number, r: number, slice: PieSlice): string => {
  if (slice.end - slice.start <= 1e-6) return '';
  const point = (angle: number) => [cx + r * Math.sin(angle), cy - r * Math.cos(angle)] as const;
  if (slice.end - slice.start >= Math.PI * 2 - 1e-6) {
    return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const [x0, y0] = point(slice.start);
  const [x1, y1] = point(slice.end);
  const large = slice.end - slice.start > Math.PI ? 1 : 0;
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
};
