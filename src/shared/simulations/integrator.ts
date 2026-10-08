/** Équation différentielle y' = f(t, y) (y : vecteur d'état). */
export type Derivative = (t: number, y: readonly number[]) => number[];

/** Un pas de Runge-Kutta d'ordre 4. */
export const rk4Step = (f: Derivative, t: number, y: readonly number[], dt: number): number[] => {
  const k1 = f(t, y);
  const k2 = f(t + dt / 2, y.map((value, i) => value + (dt / 2) * (k1[i] ?? 0)));
  const k3 = f(t + dt / 2, y.map((value, i) => value + (dt / 2) * (k2[i] ?? 0)));
  const k4 = f(t + dt, y.map((value, i) => value + dt * (k3[i] ?? 0)));
  return y.map(
    (value, i) => value + (dt / 6) * ((k1[i] ?? 0) + 2 * (k2[i] ?? 0) + 2 * (k3[i] ?? 0) + (k4[i] ?? 0)),
  );
};

/**
 * Intégration à pas fixe : `substeps` pas RK4 entre deux échantillons (un échantillon par
 * frame de la vidéo). `stop` peut figer l'état (ex. objet posé au sol).
 * Renvoie l'état à chaque échantillon k = 0 … count − 1.
 */
export const integrate = (
  f: Derivative,
  y0: readonly number[],
  interval: number,
  count: number,
  substeps = 20,
  stop?: (y: readonly number[]) => number[] | null,
): number[][] => {
  const states: number[][] = [];
  let y = [...y0];
  let t = 0;
  const dt = interval / substeps;
  for (let k = 0; k < count; k += 1) {
    states.push(y);
    for (let s = 0; s < substeps; s += 1) {
      const next = rk4Step(f, t, y, dt);
      const stopped = stop?.(next) ?? null;
      y = stopped ?? next;
      t += dt;
    }
  }
  return states;
};

/** Instants des échantillons (secondes). */
export const sampleTimes = (interval: number, count: number) =>
  Array.from({ length: count }, (_, k) => k * interval);

/** Colonne d'un tableau d'états. */
export const column = (states: readonly (readonly number[])[], index: number) =>
  states.map((state) => state[index] ?? 0);
