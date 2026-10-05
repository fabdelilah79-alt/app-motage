import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';
import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';

type ZoomProps = Record<string, never>;

/** Transition « Zoom » : la scène suivante arrive en zoomant, la précédente recule en fondu. */
const ZoomPresentation: FC<TransitionPresentationComponentProps<ZoomProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const entering = presentationDirection === 'entering';
  const scale = entering ? 1.4 - 0.4 * presentationProgress : 1 - 0.15 * presentationProgress;
  const opacity = entering ? presentationProgress : 1 - presentationProgress;
  return <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>{children}</AbsoluteFill>;
};

export const zoom = (): TransitionPresentation<ZoomProps> => ({
  component: ZoomPresentation,
  props: {},
});
