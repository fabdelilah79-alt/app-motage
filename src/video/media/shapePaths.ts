import type { ShapeKind } from '../../shared/schema';

const round = (value: number) => Number(value.toFixed(2));

/** Sommets d'un polygone régulier (ou d'une étoile si `innerRatio` < 1) inscrit dans w × h. */
const radialPoints = (w: number, h: number, count: number, innerRatio = 1) => {
  const points: string[] = [];
  const steps = innerRatio < 1 ? count * 2 : count;
  for (let i = 0; i < steps; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / steps;
    const r = innerRatio < 1 && i % 2 === 1 ? innerRatio : 1;
    const x = round(w / 2 + (r * w * Math.cos(angle)) / 2);
    const y = round(h / 2 + (r * h * Math.sin(angle)) / 2);
    points.push(`${x},${y}`);
  }
  return `M${points.join(' L')} Z`;
};

/** Pointe de flèche orientée selon l'angle (radians), au point (x, y). */
const arrowHead = (x: number, y: number, angle: number, size: number) => {
  const left = angle + Math.PI * 0.82;
  const right = angle - Math.PI * 0.82;
  const point = (a: number) => `${round(x + size * Math.cos(a))},${round(y + size * Math.sin(a))}`;
  return `M${point(left)} L${round(x)},${round(y)} L${point(right)}`;
};

/**
 * Tracé SVG d'une forme dans une boîte w × h (marge `inset` pour l'épaisseur du trait).
 * Fonction pure : la même forme donne toujours le même tracé.
 */
export const shapePath = (shape: ShapeKind, w: number, h: number, sides: number, inset = 0) => {
  const x0 = inset;
  const y0 = inset;
  const iw = Math.max(1, w - 2 * inset);
  const ih = Math.max(1, h - 2 * inset);
  const translate = (d: string) => ({ d, transform: `translate(${x0} ${y0})` });
  const head = Math.min(iw, ih) * 0.35;

  switch (shape) {
    case 'rectangle':
      return translate(`M0,0 H${round(iw)} V${round(ih)} H0 Z`);
    case 'circle': {
      const rx = round(iw / 2);
      const ry = round(ih / 2);
      const arc = `A${rx},${ry} 0 1,0`;
      return translate(`M0,${ry} ${arc} ${round(iw)},${ry} ${arc} 0,${ry} Z`);
    }
    case 'polygon':
      return translate(radialPoints(iw, ih, Math.max(3, sides)));
    case 'star':
      return translate(radialPoints(iw, ih, Math.max(3, sides), 0.45));
    case 'line':
      return translate(`M0,${round(ih / 2)} L${round(iw)},${round(ih / 2)}`);
    case 'arrow': {
      const y = round(ih / 2);
      return translate(`M0,${y} L${round(iw)},${y} ${arrowHead(iw, ih / 2, 0, head)}`);
    }
    case 'curvedArrow': {
      // Courbe de Bézier quadratique ; la pointe suit la tangente au point d'arrivée.
      const endAngle = Math.atan2(ih - 0, iw - iw / 2);
      const curve = `M0,${round(ih)} Q${round(iw / 2)},0 ${round(iw)},${round(ih)}`;
      return translate(`${curve} ${arrowHead(iw, ih, endAngle, head)}`);
    }
    case 'bubble': {
      const body = ih * 0.78;
      const r = Math.min(iw, body) * 0.18;
      return translate(
        `M${round(r)},0 H${round(iw - r)} Q${round(iw)},0 ${round(iw)},${round(r)} ` +
          `V${round(body - r)} Q${round(iw)},${round(body)} ${round(iw - r)},${round(body)} ` +
          `H${round(iw * 0.4)} L${round(iw * 0.2)},${round(ih)} ` +
          `L${round(iw * 0.25)},${round(body)} ` +
          `H${round(r)} Q0,${round(body)} 0,${round(body - r)} V${round(r)} Q0,0 ${round(r)},0 Z`,
      );
    }
  }
};
