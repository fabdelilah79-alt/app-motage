import type { CalculateMetadataFunction } from 'remotion';
import { parseProject } from '../shared/schema';
import { computeProjectDuration } from '../shared/timeline';
import type { ProjectVideoProps } from './ProjectVideo';

/** Durée, dimensions et fps de la composition, calculés depuis le projet (validé par zod). */
export const calculateProjectMetadata: CalculateMetadataFunction<ProjectVideoProps> = ({
  props,
}) => {
  const project = parseProject(props.project);
  return {
    durationInFrames: computeProjectDuration(project),
    width: project.format.width,
    height: project.format.height,
    fps: project.format.fps,
    props: { ...props, project },
  };
};
