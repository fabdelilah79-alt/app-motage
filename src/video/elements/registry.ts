import type { FC } from 'react';
import type { ElementType, SceneElement } from '../../shared/schema';
import type { AnimationFrame } from '../animations/types';
import { GifElementView } from './GifElementView';
import { IconElementView } from './IconElementView';
import { ImageElementView } from './ImageElementView';
import { LottieElementView } from './LottieElementView';
import { ShapeElementView } from './ShapeElementView';
import { TextElementView } from './TextElementView';
import { VideoElementView } from './VideoElementView';
import { CalloutElementView } from '../science/CalloutElementView';
import { ChartElementView } from '../science/ChartElementView';
import { DiagramElementView } from '../science/diagrams/DiagramElementView';
import { DimensionElementView } from '../science/DimensionElementView';
import { MathElementView } from '../science/MathElementView';
import { Plot2DElementView } from '../science/plot/Plot2DElementView';
import { VectorElementView } from '../science/VectorElementView';
import { SimulationElementView } from '../simulations/SimulationElementView';
import { Scene3DElementView } from '../three/Scene3DElementView';

type ElementViewRegistry = {
  [Type in ElementType]: FC<{
    element: Extract<SceneElement, { type: Type }>;
    /** État de l'animation (utilisé par les textes pour la révélation progressive). */
    animation: AnimationFrame;
  }>;
};

/** Registre des composants de rendu : un composant par type d'élément. */
export const ELEMENT_VIEWS: ElementViewRegistry = {
  text: TextElementView,
  image: ImageElementView,
  video: VideoElementView,
  gif: GifElementView,
  lottie: LottieElementView,
  icon: IconElementView,
  shape: ShapeElementView,
  math: MathElementView,
  plot2d: Plot2DElementView,
  chart: ChartElementView,
  vector: VectorElementView,
  dimension: DimensionElementView,
  diagram: DiagramElementView,
  callout: CalloutElementView,
  scene3d: Scene3DElementView,
  simulation: SimulationElementView,
};
