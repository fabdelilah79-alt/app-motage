import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { flip } from '@remotion/transitions/flip';
import { iris } from '@remotion/transitions/iris';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { useMemo, type FC, type ReactNode } from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import type { Project, SceneTransition } from '../shared/schema';
import { getTransitionDuration } from '../shared/timeline';
import { BrandLogo } from './brand/BrandLogo';
import { ProjectAssetsContext } from './ProjectAssetsContext';
import { ProjectAudio } from './ProjectAudio';
import { ProjectSettingsContext } from './ProjectSettingsContext';
import { SceneView } from './scenes/SceneView';
import { zoom } from './scenes/zoomPresentation';
import { applyThemeColors } from './themes/applyTheme';
import { ThemeContext } from './themes/ThemeContext';
import { resolveTheme } from './themes/themes';

export type ProjectVideoProps = {
  project: Project;
  /** Adresse du serveur local pour les médias importés ('' dans l'éditeur). */
  filesBaseUrl?: string;
  /** Aperçu de l'éditeur affiché réduit : la 3D est calculée en plus basse résolution. */
  previewScale?: number;
  /** Vue de placement de l'éditeur (éléments visibles et immobiles pendant l'édition). */
  layoutMode?: boolean;
};

type Size = { width: number; height: number };

/** Transition qui mène à une scène (balayage, zoom, retournement, horloge, iris…). */
const renderTransition = (
  sceneId: string,
  transition: SceneTransition,
  duration: number,
  size: Size,
) => {
  const key = `transition-${sceneId}`;
  const timing = linearTiming({ durationInFrames: duration });
  const { direction } = transition;
  switch (transition.type) {
    case 'slide':
      return (
        <TransitionSeries.Transition key={key} presentation={slide({ direction })} timing={timing} />
      );
    case 'wipe':
      return (
        <TransitionSeries.Transition key={key} presentation={wipe({ direction })} timing={timing} />
      );
    case 'flip':
      return (
        <TransitionSeries.Transition key={key} presentation={flip({ direction })} timing={timing} />
      );
    case 'zoom':
      return <TransitionSeries.Transition key={key} presentation={zoom()} timing={timing} />;
    case 'clockWipe':
      return (
        <TransitionSeries.Transition key={key} presentation={clockWipe(size)} timing={timing} />
      );
    case 'iris':
      return <TransitionSeries.Transition key={key} presentation={iris(size)} timing={timing} />;
    case 'fade':
    case 'none':
      return <TransitionSeries.Transition key={key} presentation={fade()} timing={timing} />;
  }
};

/** Composition racine : scènes enchaînées avec leurs transitions (aperçu ET rendu MP4). */
export const ProjectVideo: FC<ProjectVideoProps> = ({
  project,
  filesBaseUrl = '',
  previewScale,
  layoutMode = false,
}) => {
  const { fps, width, height } = useVideoConfig();
  const theme = useMemo(
    () => resolveTheme(project.themeId, project.themeOverrides),
    [project.themeId, project.themeOverrides],
  );
  // Les couleurs « theme.xxx » des scènes deviennent les couleurs réelles du thème.
  const scenes = useMemo(() => applyThemeColors(project.scenes, theme), [project.scenes, theme]);
  const items: ReactNode[] = [];

  scenes.forEach((scene, index) => {
    const previous = index > 0 ? scenes[index - 1] : undefined;
    const transitionDuration = previous ? getTransitionDuration(previous, scene) : 0;
    if (scene.transitionIn && transitionDuration > 0) {
      const size = { width, height };
      items.push(renderTransition(scene.id, scene.transitionIn, transitionDuration, size));
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
      <ProjectSettingsContext.Provider
        value={{
          digits: project.digits,
          defaultLang: project.defaultLang,
          subtitleStyle: project.subtitleStyle,
          previewScale,
          layoutMode,
        }}
      >
        <ThemeContext.Provider value={theme}>
          <AbsoluteFill style={{ backgroundColor: '#000000' }}>
            <TransitionSeries>{items}</TransitionSeries>
            {project.brand ? <BrandLogo brand={project.brand} /> : null}
            <ProjectAudio project={project} />
          </AbsoluteFill>
        </ThemeContext.Provider>
      </ProjectSettingsContext.Provider>
    </ProjectAssetsContext.Provider>
  );
};
