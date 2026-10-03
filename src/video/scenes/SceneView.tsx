import type { FC } from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import type { Scene } from '../../shared/schema';
import { ElementLayer } from '../elements/ElementLayer';
import { backgroundStyle } from './backgroundStyle';

export const SceneView: FC<{ scene: Scene }> = ({ scene }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={backgroundStyle(scene.background)}>
      {scene.elements
        .filter((element) => !element.hidden)
        .map((element) => (
          <Sequence
            key={element.id}
            name={element.name || element.id}
            from={element.timing.from}
            durationInFrames={element.timing.duration}
            premountFor={fps}
          >
            <ElementLayer element={element} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
