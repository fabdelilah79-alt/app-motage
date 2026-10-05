import { interpolateColors } from 'remotion';
import type { Keyframe } from '../../shared/schema';
import { EASINGS } from './easings';

/** Segment d'images clés encadrant la frame, avec la progression (accélération appliquée). */
const segmentAt = (keyframes: readonly Keyframe[], frame: number) => {
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return null;
  if (frame <= first.frame) return { from: first, to: first, t: 0 };
  if (frame >= last.frame) return { from: last, to: last, t: 0 };
  for (let i = 1; i < sorted.length; i++) {
    const from = sorted[i - 1];
    const to = sorted[i];
    if (from && to && frame <= to.frame) {
      const t = (frame - from.frame) / Math.max(1, to.frame - from.frame);
      return { from, to, t: EASINGS[to.easing](t) };
    }
  }
  return { from: last, to: last, t: 0 };
};

/** Valeur numérique d'une propriété animée par images clés (undefined si aucune). */
export const keyframeNumber = (
  keyframes: readonly Keyframe[] | undefined,
  frame: number,
): number | undefined => {
  const numeric = (keyframes ?? []).filter((item) => typeof item.value === 'number');
  const segment = segmentAt(numeric, frame);
  if (!segment) return undefined;
  const from = Number(segment.from.value);
  const to = Number(segment.to.value);
  return from + (to - from) * segment.t;
};

/** Couleur animée par images clés (undefined si aucune). */
export const keyframeColor = (
  keyframes: readonly Keyframe[] | undefined,
  frame: number,
): string | undefined => {
  const colors = (keyframes ?? []).filter((item) => typeof item.value === 'string');
  const segment = segmentAt(colors, frame);
  if (!segment) return undefined;
  if (segment.from === segment.to) return String(segment.from.value);
  return interpolateColors(segment.t, [0, 1], [String(segment.from.value), String(segment.to.value)]);
};
