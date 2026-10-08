import type { FC } from 'react';
import type { VectorElement } from '../../shared/schema';
import { animatedColor } from '../animations/frameStyles';
import type { AnimationFrame } from '../animations/types';
import { InlineMath } from './InlineMath';
import { arrowHead, vectorGeometry, vectorLabel } from './vectorGeometry';

/** Vecteur : flèche proportionnelle à sa norme, nom, composantes et angle facultatifs. */
export const VectorElementView: FC<{ element: VectorElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const { width, height } = element.transform;
  const full = vectorGeometry(element, width, height);
  const grow = animation.draw?.stroke ?? 1;
  const { origin } = full;
  const tip = {
    x: origin.x + (full.tip.x - origin.x) * grow,
    y: origin.y + (full.tip.y - origin.y) * grow,
  };
  const color = animatedColor(element.color, animation);
  const w = element.strokeWidth;
  const head = w * 3.2;
  // Le trait s'arrête avant la pointe pour qu'elle reste nette.
  const shaftEnd = {
    x: tip.x - Math.cos(full.radians) * head * 0.6,
    y: tip.y + Math.sin(full.radians) * head * 0.6,
  };
  const dash = `${w * 1.5} ${w * 1.5}`;
  const arcRadius = Math.max(30, full.length * 0.28);
  const arcEnd = {
    x: origin.x + arcRadius * Math.cos(full.radians),
    y: origin.y - arcRadius * Math.sin(full.radians),
  };
  const labelOffset = head * 1.6;
  const normal = full.radians + Math.PI / 2;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {element.showComponents && grow >= 1 ? (
          <g stroke={element.componentColor} strokeWidth={w * 0.5} fill={element.componentColor}>
            <path d={`M${tip.x} ${tip.y} L${tip.x} ${origin.y} M${tip.x} ${tip.y} L${origin.x} ${tip.y}`} strokeDasharray={dash} fill="none" />
            <path d={`M${origin.x} ${origin.y} L${tip.x} ${origin.y}`} strokeWidth={w * 0.7} />
            <path d={arrowHead(origin, { x: tip.x, y: origin.y }, head * 0.8)} stroke="none" />
            <path d={`M${origin.x} ${origin.y} L${origin.x} ${tip.y}`} strokeWidth={w * 0.7} />
            <path d={arrowHead(origin, { x: origin.x, y: tip.y }, head * 0.8)} stroke="none" />
          </g>
        ) : null}
        {element.showAngle && grow >= 1 ? (
          <g stroke={element.componentColor} strokeWidth={w * 0.5} fill="none">
            <path d={`M${origin.x} ${origin.y} L${origin.x + arcRadius * 1.4} ${origin.y}`} strokeDasharray={dash} />
            <path
              d={`M${origin.x + arcRadius} ${origin.y} A${arcRadius} ${arcRadius} 0 0 ${element.angle >= 0 ? 0 : 1} ${arcEnd.x} ${arcEnd.y}`}
            />
          </g>
        ) : null}
        <circle cx={origin.x} cy={origin.y} r={w * 0.9} fill={color} />
        {grow > 0 ? (
          <g fill={color}>
            <path d={`M${origin.x} ${origin.y} L${shaftEnd.x} ${shaftEnd.y}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
            <path d={arrowHead(origin, tip, head)} />
          </g>
        ) : null}
      </svg>
      {grow >= 1 && element.label ? (
        <div
          style={{
            position: 'absolute',
            left: (origin.x + tip.x) / 2 + Math.cos(normal) * labelOffset,
            top: (origin.y + tip.y) / 2 - Math.sin(normal) * labelOffset,
            transform: 'translate(-50%, -50%)',
            fontSize: w * 6,
            whiteSpace: 'nowrap',
          }}
        >
          <InlineMath latex={vectorLabel(element)} color={color} />
        </div>
      ) : null}
      {element.showAngle && grow >= 1 ? (
        <div
          style={{
            position: 'absolute',
            left: origin.x + arcRadius * 1.25 * Math.cos(full.radians / 2),
            top: origin.y - arcRadius * 1.25 * Math.sin(full.radians / 2),
            transform: 'translate(0, -50%)',
            fontSize: w * 4.5,
          }}
        >
          <InlineMath latex={`${Math.round(element.angle)}^\\circ`} color={element.componentColor} />
        </div>
      ) : null}
    </div>
  );
};
