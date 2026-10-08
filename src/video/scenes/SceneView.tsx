import type { FC } from 'react';
import { AbsoluteFill, Freeze, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Scene } from '../../shared/schema';
import { layoutFrame } from '../animations/layoutFrame';
import { ElementLayer } from '../elements/ElementLayer';
import { useProjectSettings } from '../ProjectSettingsContext';
import { cameraAt, cameraTransform } from './camera';
import { SceneBackground } from './SceneBackground';
import { SubtitlesOverlay } from './SubtitlesOverlay';

export const SceneView: FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { layoutMode } = useProjectSettings();
  const camera =
    scene.camera.length > 0 && !layoutMode
      ? cameraTransform(cameraAt(scene.camera, frame), width, height)
      : undefined;
  const visible = scene.elements.filter((element) => !element.hidden);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: camera, transformOrigin: '0 0' }}>
        <SceneBackground background={scene.background} />
        {layoutMode
          ? // Vue de placement : chaque élément figé à son instant le plus complet.
            visible.map((element) => (
              <Freeze key={element.id} frame={layoutFrame(element.animations, element.timing.duration)}>
                <ElementLayer element={element} />
              </Freeze>
            ))
          : visible.map((element) => (
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
      <SubtitlesOverlay cues={scene.subtitles} />
    </AbsoluteFill>
  );
};
