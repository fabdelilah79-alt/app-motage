import type { FC } from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneElement } from '../../shared/schema';
import { computeElementAnimation } from '../animations/computeElementAnimation';
import { ELEMENT_VIEWS } from './registry';

/** Place un élément dans la scène et applique ses animations (frame relative à l'élément). */
export const ElementLayer: FC<{ element: SceneElement }> = ({ element }) => {
  const frame = useCurrentFrame();
  const { transform, timing } = element;
  const animation = computeElementAnimation(element.animations, timing.duration, frame);
  const View = ELEMENT_VIEWS[element.type] as FC<{ element: SceneElement }>;

  return (
    <div
      style={{
        position: 'absolute',
        left: transform.x,
        top: transform.y,
        width: transform.width,
        height: transform.height,
        opacity: transform.opacity * animation.opacity,
        transform: [
          `translate(${animation.translateX}px, ${animation.translateY}px)`,
          `rotate(${transform.rotation}deg)`,
          `scale(${transform.scale * animation.scale})`,
        ].join(' '),
      }}
    >
      <View element={element} />
    </div>
  );
};
