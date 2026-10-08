import { CircularMotionView, SatelliteView } from './OrbitViews';
import { DecayView } from './DecayView';
import { FreeFallView } from './FreeFallView';
import { InclinedPlaneView } from './InclinedPlaneView';
import { PendulumView } from './PendulumView';
import { ProjectileView } from './ProjectileView';
import { RCView, RLCView } from './CircuitViews';
import { RefractionView } from './RefractionView';
import { SpringMassView } from './SpringMassView';
import type { SimView } from './types';
import { WaveView } from './WaveView';

/** Vue de chaque simulation (même identifiant que le modèle de src/shared/simulations). */
export const SIM_VIEWS: Readonly<Record<string, SimView>> = {
  'free-fall': FreeFallView,
  projectile: ProjectileView,
  pendulum: PendulumView,
  'spring-mass': SpringMassView,
  'inclined-plane': InclinedPlaneView,
  'circular-motion': CircularMotionView,
  satellite: SatelliteView,
  'traveling-wave': WaveView,
  'rc-circuit': RCView,
  'rlc-circuit': RLCView,
  refraction: RefractionView,
  'radioactive-decay': DecayView,
};
