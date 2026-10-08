import { describe, expect, it } from 'vitest';
import { FORMAT_PRESETS } from '../../src/shared/formats';
import { sceneElementSchema } from '../../src/shared/schema';
import { createSimulationElement } from '../../src/shared/simulationFactories';
import { circularMotion, freeFall, inclinedPlane, pendulum, projectile, satellite, springMass, theoreticalRange } from '../../src/shared/simulations/mechanics';
import { criticalAngle, radioactiveDecay, rcCircuit, refraction, rlcCircuit, ropeDisplacement, travelingWave } from '../../src/shared/simulations/others';
import { defaultParams, paramValue } from '../../src/shared/simulations/params';
import { runSimulation, SIMULATIONS } from '../../src/shared/simulations/registry';
import type { SimulationModel } from '../../src/shared/simulations/types';
import { simulationIndex, simulationSampling } from '../../src/video/simulations/timing';
import { SIM_VIEWS } from '../../src/video/simulations/views';

const run = (model: SimulationModel, params: Record<string, number>, seconds: number, rate = 120) =>
  model.compute(params, 1 / rate, Math.round(seconds * rate) + 1);

/** Instants où la grandeur passe de négative à positive (interpolation linéaire). */
const upwardCrossings = (t: readonly number[], values: readonly number[]) => {
  const crossings: number[] = [];
  for (let k = 1; k < values.length; k += 1) {
    const a = values[k - 1] ?? 0;
    const b = values[k] ?? 0;
    if (a < 0 && b >= 0) {
      const t0 = t[k - 1] ?? 0;
      const t1 = t[k] ?? 0;
      crossings.push(t0 + ((t1 - t0) * -a) / (b - a));
    }
  }
  return crossings;
};

const meanPeriod = (crossings: readonly number[]) =>
  ((crossings[crossings.length - 1] ?? 0) - (crossings[0] ?? 0)) / (crossings.length - 1);

const relativeDrift = (values: readonly number[]) => {
  const first = values[0] ?? 1;
  return Math.max(...values.map((value) => Math.abs(value - first))) / Math.abs(first);
};

describe('tests physiques (section 6.8 du plan)', () => {
  it('pendule : période aux petits angles = 2π√(L/g) à 1 % près', () => {
    for (const L of [0.5, 1, 2]) {
      const result = run(pendulum, { L, theta0: 5, g: 9.81 }, 20);
      const period = meanPeriod(upwardCrossings(result.t ?? [], result.theta ?? []));
      const expected = 2 * Math.PI * Math.sqrt(L / 9.81);
      expect(Math.abs(period - expected) / expected).toBeLessThan(0.01);
    }
  });

  it('pendule non amorti : énergie mécanique conservée à 0,1 % près sur 10 périodes', () => {
    const result = run(pendulum, { L: 1, theta0: 40, m: 0.5 }, 10 * 2.1, 30);
    expect(relativeDrift(result.em ?? [])).toBeLessThan(0.001);
  });

  it('masse-ressort : période 2π√(m/k) et énergie conservée', () => {
    const result = run(springMass, { k: 20, m: 0.5, x0: 0.1 }, 12);
    const expected = 2 * Math.PI * Math.sqrt(0.5 / 20);
    const period = meanPeriod(upwardCrossings(result.t ?? [], result.x ?? []));
    expect(Math.abs(period - expected) / expected).toBeLessThan(0.01);
    expect(relativeDrift(result.em ?? [])).toBeLessThan(0.001);
  });

  it('amortissement : l’énergie mécanique diminue', () => {
    const em = run(pendulum, { theta0: 30, b: 0.5 }, 10).em ?? [];
    expect(em[em.length - 1] ?? 0).toBeLessThan((em[0] ?? 0) * 0.5);
  });

  it('projectile : portée = v₀² sin(2α) / g', () => {
    for (const [v0, alpha] of [[15, 45], [20, 30], [10, 70]] as const) {
      const result = run(projectile, { v0, alpha, h0: 0, g: 9.81 }, 5);
      const range = Math.max(...(result.x ?? []));
      const expected = theoreticalRange(v0, alpha, 9.81);
      expect(Math.abs(range - expected) / expected).toBeLessThan(0.001);
      expect(Math.min(...(result.y ?? []))).toBeGreaterThanOrEqual(0);
    }
  });

  it('circuit RC : uC(τ) = 0,63 E (charge) et 0,37 E (décharge)', () => {
    const tau = 10e3 * 100e-6;
    const charge = rcCircuit.compute({ E: 6, R: 10, C: 100 }, tau / 100, 101);
    expect((charge.uC?.[100] ?? 0) / 6).toBeCloseTo(1 - Math.exp(-1), 3);
    expect((charge.uC?.[100] ?? 0) / 6).toBeCloseTo(0.63, 2);
    const discharge = rcCircuit.compute({ E: 6, R: 10, C: 100, discharge: 1 }, tau / 100, 101);
    expect((discharge.uC?.[100] ?? 0) / 6).toBeCloseTo(0.37, 2);
  });

  it('circuit LC (R = 0) : période 2π√(LC), énergie conservée', () => {
    const result = run(rlcCircuit, { U0: 5, R: 0, L: 1, C: 10 }, 5);
    const expected = 2 * Math.PI * Math.sqrt(1 * 10e-3);
    const period = meanPeriod(upwardCrossings(result.t ?? [], result.uC ?? []));
    expect(Math.abs(period - expected) / expected).toBeLessThan(0.01);
    const amplitude = Math.max(...(result.uC ?? []).slice(-120).map(Math.abs));
    expect(amplitude).toBeCloseTo(5, 1);
  });

  it('chute libre : durée √(2h/g), puis immobile au sol', () => {
    const result = run(freeFall, { h0: 20, g: 9.81 }, 4);
    const t = result.t ?? [];
    const landing = t[(result.y ?? []).findIndex((y) => y <= 0)] ?? 0;
    expect(landing).toBeCloseTo(Math.sqrt((2 * 20) / 9.81), 1);
    const vMax = Math.max(...(result.v ?? []));
    expect(vMax / Math.sqrt(2 * 9.81 * 20)).toBeGreaterThan(0.98);
    expect(result.y?.[result.y.length - 1]).toBe(0);
  });

  it('frottement fluide : vitesse limite m·g/k', () => {
    const result = run(freeFall, { h0: 200, m: 1, k: 2, g: 9.81 }, 4);
    expect(result.v?.[result.v.length - 1] ?? 0).toBeCloseTo(9.81 / 2, 1);
  });

  it('plan incliné : a = g(sin α − μ cos α), immobile si tan α ≤ μ', () => {
    const result = run(inclinedPlane, { alpha: 30, mu: 0.2, L: 50 }, 2);
    const a = 9.81 * (Math.sin(Math.PI / 6) - 0.2 * Math.cos(Math.PI / 6));
    expect(result.v?.[120] ?? 0).toBeCloseTo(a, 3);
    const still = run(inclinedPlane, { alpha: 10, mu: 0.5 }, 2);
    expect(Math.max(...(still.s ?? []))).toBe(0);
  });

  it('mouvement circulaire et satellite en orbite circulaire', () => {
    const circle = run(circularMotion, { R: 2, T: 4 }, 4);
    (circle.x ?? []).forEach((x, k) => expect(Math.hypot(x, circle.y?.[k] ?? 0)).toBeCloseTo(2, 6));
    const orbit = run(satellite, { r0: 4, GM: 40, v0: Math.sqrt(40 / 4) }, 30, 30);
    expect(relativeDrift(orbit.r ?? [])).toBeLessThan(0.001);
  });

  it('réfraction : n₁ sin i₁ = n₂ sin i₂, réflexion totale au-delà de l’angle limite', () => {
    const result = run(refraction, { n1: 1, n2: 1.5, i0: 10, i1: 80, sweep: 2 }, 2);
    (result.i ?? []).forEach((i, k) => {
      const r = result.r?.[k] ?? 0;
      expect(Math.sin((i * Math.PI) / 180)).toBeCloseTo(1.5 * Math.sin((r * Math.PI) / 180), 6);
    });
    expect(criticalAngle(1.5, 1)).toBeCloseTo(41.81, 2);
    const total = run(refraction, { n1: 1.5, n2: 1, i0: 50, i1: 50 }, 1);
    expect(Number.isNaN(total.r?.[0])).toBe(true);
  });

  it('onde progressive : le point M ne bouge qu’après l’arrivée du front', () => {
    expect(ropeDisplacement(3, 1.9, 3, 1, 1.5)).toBe(0); // front à 1,5 m/s : arrivée à 2 s
    expect(ropeDisplacement(3, 2.25, 3, 1, 1.5)).toBeCloseTo(3);
    const result = run(travelingWave, { A: 3, T: 1, lambda: 1.5, xM: 3 }, 4);
    // M reproduit le mouvement de la source avec un retard de x/v = 2 s.
    expect(result.yM?.[270]).toBeCloseTo(3, 6);
    expect(result.yS?.[30]).toBeCloseTo(3, 6);
  });

  it('décroissance radioactive : N(t½) = N₀ / 2', () => {
    const result = run(radioactiveDecay, { N0: 200, halfLife: 2 }, 4);
    expect(result.N?.[240]).toBeCloseTo(100, 6);
    expect(result.N?.[480]).toBeCloseTo(50, 6);
  });
});

describe('cadre commun des simulations', () => {
  it('chaque modèle a une vue, des paramètres valides et une grandeur à tracer', () => {
    const ids = SIMULATIONS.map((model) => model.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const model of SIMULATIONS) {
      expect(SIM_VIEWS[model.id]).toBeDefined();
      expect(model.quantities.some((quantity) => quantity.key === model.defaultGraph)).toBe(true);
      for (const field of model.params) {
        expect(field.min).toBeLessThanOrEqual(field.default);
        expect(field.default).toBeLessThanOrEqual(field.max);
      }
      const result = runSimulation(model, defaultParams(model.params), 1 / 30, 91);
      expect(result.t).toHaveLength(91);
      for (const quantity of model.quantities) expect(result[quantity.key]).toHaveLength(91);
    }
    expect(SIMULATIONS.filter((model) => model.star).map((model) => model.id).sort()).toEqual(
      ['free-fall', 'pendulum', 'projectile', 'rc-circuit', 'refraction', 'spring-mass', 'traveling-wave'].sort(),
    );
  });

  it('paramètres bornés et valeurs par défaut', () => {
    expect(paramValue(pendulum.params, { L: 500 }, 'L')).toBe(20);
    expect(paramValue(pendulum.params, {}, 'L')).toBe(1);
    expect(paramValue(pendulum.params, { L: Number.NaN }, 'L')).toBe(1);
  });

  it('pré-calcul mémorisé et résultat identique à chaque appel (déterminisme)', () => {
    const a = runSimulation(pendulum, { L: 1 }, 1 / 30, 60);
    expect(runSimulation(pendulum, { L: 1 }, 1 / 30, 60)).toBe(a);
    expect(pendulum.compute({ L: 1 }, 1 / 30, 60)).toEqual(a);
  });

  it('ralenti et pause sur un instant', () => {
    expect(simulationSampling(300, 30, 0.25)).toEqual({ interval: 0.25 / 30, count: 301 });
    expect(simulationIndex(100, 301, undefined)).toBe(100);
    expect(simulationIndex(100, 301, 60)).toBe(60);
    expect(simulationIndex(500, 301, undefined)).toBe(300);
  });

  it('fabrique un élément valide pour chaque simulation', () => {
    for (const model of SIMULATIONS) {
      const element = createSimulationElement(FORMAT_PRESETS.landscape, 300, model, () => 'x');
      expect(sceneElementSchema.parse(element)).toEqual(element);
    }
  });
});
