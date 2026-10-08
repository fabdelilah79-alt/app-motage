import { circularMotion, freeFall, inclinedPlane, pendulum, projectile, satellite, springMass } from './mechanics';
import { radioactiveDecay, rcCircuit, refraction, rlcCircuit, travelingWave } from './others';
import type { SimCategory, SimulationModel } from './types';

/** Simulations prêtes à l'emploi (les ★ d'abord dans chaque domaine). */
export const SIMULATIONS: readonly SimulationModel[] = [
  freeFall,
  projectile,
  pendulum,
  springMass,
  inclinedPlane,
  circularMotion,
  satellite,
  travelingWave,
  rcCircuit,
  rlcCircuit,
  refraction,
  radioactiveDecay,
];

export const SIM_CATEGORIES: readonly SimCategory[] = ['mechanics', 'waves', 'electricity', 'optics', 'misc'];

export const getSimulation = (id: string): SimulationModel | undefined =>
  SIMULATIONS.find((model) => model.id === id);

const cache = new Map<string, Record<string, number[]>>();

/**
 * Résultat pré-calculé (mis en cache) : `count` échantillons espacés de `interval` secondes
 * de temps simulé. Mêmes paramètres → même résultat (rendu déterministe).
 */
export const runSimulation = (
  model: SimulationModel,
  params: Readonly<Record<string, number>>,
  interval: number,
  count: number,
) => {
  const key = JSON.stringify([model.id, params, interval, count]);
  const cached = cache.get(key);
  if (cached) return cached;
  const result = model.compute(params, interval, count);
  if (cache.size > 50) cache.clear();
  cache.set(key, result);
  return result;
};
