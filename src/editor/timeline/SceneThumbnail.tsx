import { Thumbnail } from '@remotion/player';
import { useMemo } from 'react';
import type { Project, Scene } from '../../shared/schema';
import { ProjectVideo } from '../../video/ProjectVideo';

type Props = { project: Project; scene: Scene; width: number };

/** Vignette d'une scène : image rendue par Remotion, une seconde après son début. */
export const SceneThumbnail = ({ project, scene, width }: Props) => {
  const { format } = project;
  const inputProps = useMemo(
    () => ({
      project: { ...project, scenes: [{ ...scene, transitionIn: undefined }] },
      filesBaseUrl: '',
    }),
    [project, scene],
  );

  return (
    <Thumbnail
      component={ProjectVideo}
      inputProps={inputProps}
      compositionWidth={format.width}
      compositionHeight={format.height}
      durationInFrames={scene.durationInFrames}
      fps={format.fps}
      frameToDisplay={Math.min(scene.durationInFrames - 1, format.fps)}
      style={{ width, height: (width * format.height) / format.width }}
    />
  );
};
