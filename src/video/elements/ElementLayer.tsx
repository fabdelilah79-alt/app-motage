import { Audio } from '@remotion/media';
import type { FC } from 'react';
import { Sequence, useCurrentFrame } from 'remotion';
import type { SceneElement } from '../../shared/schema';
import { computeElementAnimation } from '../animations/computeElementAnimation';
import { Decoration } from '../animations/Decoration';
import { animationTransform, layerAnimationStyle } from '../animations/frameStyles';
import { keyframeColor, keyframeNumber } from '../animations/keyframes';
import type { AnimationFrame } from '../animations/types';
import { sfxSrc } from '../media/sfx';
import { ELEMENT_VIEWS } from './registry';

/** Un texte arabe (ou forcé de droite à gauche) se décore dans le sens de lecture. */
const isRtl = (element: SceneElement) =>
  (element.type === 'text' &&
    (element.direction === 'rtl' || (element.direction === 'auto' && element.lang === 'ar'))) ||
  (element.type === 'callout' && element.lang === 'ar');

/**
 * Place un élément dans la scène et applique ses animations (frame relative à l'élément).
 * En mode Avancé, les images clés remplacent la position, l'échelle, la rotation,
 * l'opacité ou la couleur fixes.
 */
export const ElementLayer: FC<{ element: SceneElement }> = ({ element }) => {
  const frame = useCurrentFrame();
  const { transform, timing, sound, keyframes } = element;
  const computed = computeElementAnimation(element.animations, timing.duration, frame);
  const colorOverride = keyframeColor(keyframes?.color, frame);
  const animation: AnimationFrame = colorOverride ? { ...computed, colorOverride } : computed;
  const View = ELEMENT_VIEWS[element.type] as FC<{
    element: SceneElement;
    animation: AnimationFrame;
  }>;

  const x = keyframeNumber(keyframes?.x, frame) ?? transform.x;
  const y = keyframeNumber(keyframes?.y, frame) ?? transform.y;
  const scale = keyframeNumber(keyframes?.scale, frame) ?? transform.scale;
  const rotation = keyframeNumber(keyframes?.rotation, frame) ?? transform.rotation;
  const opacity = keyframeNumber(keyframes?.opacity, frame) ?? transform.opacity;
  const decoration = animation.decoration;
  const decorationProps = decoration
    ? { decoration, width: transform.width, height: transform.height, rtl: isRtl(element) }
    : null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: transform.width,
          height: transform.height,
          opacity: Math.max(0, Math.min(1, opacity * animation.opacity)),
          transform: animationTransform(animation, rotation, scale),
          ...layerAnimationStyle(animation),
        }}
      >
        {/* Le surlignage passe derrière le contenu ; les autres décorations devant. */}
        {decorationProps && decoration?.kind === 'highlight' ? (
          <Decoration {...decorationProps} />
        ) : null}
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <View element={element} animation={animation} />
        </div>
        {decorationProps && decoration?.kind !== 'highlight' ? (
          <Decoration {...decorationProps} />
        ) : null}
      </div>
      {sound ? (
        // Effet sonore joué au début de l'apparition (après son éventuel délai).
        <Sequence from={element.animations.enter?.delay ?? 0} layout="none" name="Effet sonore">
          <Audio src={sfxSrc(sound.sfx)} volume={sound.volume} />
        </Sequence>
      ) : null}
    </>
  );
};
