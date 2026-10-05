import type { FC } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Scene } from '../../shared/schema';
import { ElementLayer } from '../elements/ElementLayer';
import { cameraAt, cameraTransform } from './camera';
import { SceneBackground } from './SceneBackground';

export const SceneView: FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const camera =
    scene.camera.length > 0 ? cameraTransform(cameraAt(scene.camera, frame), width, height) : undefined;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: camera, transformOrigin: '0 0' }}>
        <SceneBackground background={scene.background} />
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
    </AbsoluteFill>
  );
};
