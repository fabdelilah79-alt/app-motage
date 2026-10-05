import { random } from 'remotion';

export type Particle = { x: number; y: number; radius: number; opacity: number };

/**
 * Particules lumineuses qui dérivent lentement : position calculée uniquement à partir de
 * la graine, de l'index et de la frame (rendu déterministe, identique à chaque export).
 */
export const particlesAt = (
  count: number,
  seed: string,
  frame: number,
  width: number,
  height: number,
): Particle[] =>
  Array.from({ length: count }, (_, index) => {
    const r = (key: string) => random(`${seed}-${index}-${key}`);
    const speed = 0.2 + r('speed') * 0.8; // pixels par frame (pour 1920 px)
    const scale = width / 1920;
    const angle = r('angle') * Math.PI * 2;
    const rawX = r('x') * width + Math.cos(angle) * speed * scale * frame;
    const rawY = r('y') * height + Math.sin(angle) * speed * scale * frame;
    const twinkle = 0.5 + 0.5 * Math.sin(frame / (12 + r('twinkle') * 30) + r('phase') * 6.28);
    return {
      x: wrap(rawX, width),
      y: wrap(rawY, height),
      radius: (1.5 + r('size') * 4) * scale,
      opacity: 0.25 + 0.6 * twinkle,
    };
  });

const wrap = (value: number, size: number) => ((value % size) + size) % size;
