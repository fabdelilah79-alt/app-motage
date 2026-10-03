import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { Project, SceneTransition } from '../shared/schema';
import { getTransitionDuration } from '../shared/timeline';
import { ProjectAssetsContext } from './ProjectAssetsContext';
import { ProjectSettingsContext } from './ProjectSettingsContext';
import { SceneView } from './scenes/SceneView';

export type ProjectVideoProps = {
  project: Project;
  /** Adresse du serveur local pour les médias importés ('' dans l'éditeur). */
  filesBaseUrl?: string;
};

const renderTransition = (sceneId: string, transition: SceneTransition, duration: number) => {
  const key = `transition-${sceneId}`;
  const timing = linearTiming({ durationInFrames: duration });
  if (transition.type === 'slide') {
    return (
      <TransitionSeries.Transition
        key={key}
        presentation={slide({ direction: transition.direction })}
        timing={timing}
      />
    );
  }
  return <TransitionSeries.Transition key={key} presentation={fade()} timing={timing} />;
};

/** Composition racine : scènes enchaînées avec leurs transitions (aperçu ET rendu MP4). */
export const ProjectVideo: FC<ProjectVideoProps> = ({ project, filesBaseUrl = '' }) => {
  const { fps } = useVideoConfig();
  const items: ReactNode[] = [];

  project.scenes.forEach((scene, index) => {
    const previous = index > 0 ? project.scenes[index - 1] : undefined;
    const transitionDuration = previous ? getTransitionDuration(previous, scene) : 0;
    if (scene.transitionIn && transitionDuration > 0) {
      items.push(renderTransition(scene.id, scene.transitionIn, transitionDuration));
    }
    items.push(
      <TransitionSeries.Sequence
        key={`scene-${scene.id}`}
        name={scene.name || scene.id}
        durationInFrames={scene.durationInFrames}
        premountFor={fps}
      >
        <SceneView scene={scene} />
      </TransitionSeries.Sequence>,
    );
  });

  return (
    <ProjectAssetsContext.Provider
      value={{ assets: project.assets, projectId: project.id, filesBaseUrl }}
    >
      <ProjectSettingsContext.Provider value={{ digits: project.digits }}>
        <AbsoluteFill style={{ backgroundColor: '#000000' }}>
          <TransitionSeries>{items}</TransitionSeries>
        </AbsoluteFill>
      </ProjectSettingsContext.Provider>
    </ProjectAssetsContext.Provider>
  );
};
