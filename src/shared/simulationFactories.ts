import { enterFade, randomId, type IdGenerator } from './factories';
import type { ProjectFormat, SimulationElement } from './schema';
import type { SimulationModel } from './simulations/types';

/** Simulation centrée, avec ses vecteurs et son graphique synchronisé par défaut. */
export const createSimulationElement = (
  format: ProjectFormat,
  duration: number,
  model: SimulationModel,
  newId: IdGenerator = randomId,
): SimulationElement => {
  const width = Math.round(format.width * 0.84);
  const height = Math.round(format.height * 0.72);
  return {
    id: `simulation-${newId()}`,
    name: '',
    locked: false,
    hidden: false,
    type: 'simulation',
    simId: model.id,
    transform: {
      x: Math.round((format.width - width) / 2),
      y: Math.round((format.height - height) / 2),
      width,
      height,
      rotation: 0,
      scale: 1,
      opacity: 1,
    },
    timing: { from: 0, duration },
    animations: { enter: enterFade(), emphasis: [] },
    params: {},
    display: { vectors: model.vectors.slice(0, 1), trajectory: true, values: true, energyBars: false },
    graph: { quantity: model.defaultGraph, position: 'right' },
    playbackRate: 1,
    color: 'theme.accent1',
    accent: 'theme.accent2',
    textColor: 'theme.text',
    fontSize: 28,
  };
};
