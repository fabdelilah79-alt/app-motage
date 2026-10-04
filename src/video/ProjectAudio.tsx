import { Audio } from '@remotion/media';
import { useMemo, type FC } from 'react';
import { Sequence } from 'remotion';
import { musicVolumeAt, voiceIntervals } from '../shared/audioMix';
import type { Project } from '../shared/schema';
import { computeProjectDuration, sceneStartFrames } from '../shared/timeline';
import { useProjectAssets } from './ProjectAssetsContext';
import { resolveAssetSrc } from './elements/resolveAssetSrc';

/** Son de la vidéo : voix off de chaque scène et musiques de fond atténuées sous les voix. */
export const ProjectAudio: FC<{ project: Project }> = ({ project }) => {
  const location = useProjectAssets();
  const starts = useMemo(() => sceneStartFrames(project), [project]);
  const intervals = useMemo(() => voiceIntervals(project), [project]);
  const total = computeProjectDuration(project);
  const srcOf = (assetId: string) => {
    const asset = project.assets.find((item) => item.id === assetId);
    return asset ? resolveAssetSrc(asset, location) : null;
  };

  return (
    <>
      {project.scenes.map((scene, index) => {
        const voice = scene.voiceover;
        const src = voice ? srcOf(voice.assetId) : null;
        if (!voice || !src) return null;
        return (
          <Sequence
            key={`voice-${scene.id}`}
            name={`Voix off ${index + 1}`}
            from={(starts[index] ?? 0) + voice.offset}
            durationInFrames={Math.max(1, scene.durationInFrames - voice.offset)}
            layout="none"
          >
            <Audio src={src} volume={voice.volume} />
          </Sequence>
        );
      })}
      {project.audioTracks.map((track) => {
        const src = srcOf(track.assetId);
        if (!src) return null;
        return (
          <Audio
            key={track.id}
            src={src}
            loop={track.loop}
            loopVolumeCurveBehavior="extend"
            volume={(frame) => musicVolumeAt(frame, track, total, intervals)}
          />
        );
      })}
    </>
  );
};
