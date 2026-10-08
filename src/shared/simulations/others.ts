import { column, integrate, sampleTimes } from './integrator';
import { reader, toDegrees, toRadians } from './params';
import type { Quantity, SimulationModel } from './types';

const q = (key: string, symbol: string, unit: string, fr: string, ar: string, en: string): Quantity => ({
  key,
  symbol,
  unit,
  name: { fr, ar, en },
});

/**
 * Onde progressive sinusoïdale sur une corde, émise à l'instant 0 par la source (x = 0) :
 * un point d'abscisse x ne bouge qu'après l'arrivée du front (t ≥ x / v).
 */
export const ropeDisplacement = (x: number, t: number, A: number, T: number, wavelength: number) => {
  const speed = wavelength / T;
  if (t < x / speed) return 0;
  return A * Math.sin(2 * Math.PI * (t / T - x / wavelength));
};

export const travelingWave: SimulationModel = {
  id: 'traveling-wave',
  category: 'waves',
  star: true,
  name: { fr: 'Onde progressive sur une corde', ar: 'موجة متوالية على حبل', en: 'Traveling wave on a rope' },
  params: [
    { key: 'A', symbol: 'A', unit: 'cm', min: 0.1, max: 20, step: 0.1, default: 3, name: { fr: 'Amplitude', ar: 'الوسع', en: 'Amplitude' } },
    { key: 'T', symbol: 'T', unit: 's', min: 0.1, max: 10, step: 0.1, default: 1, name: { fr: 'Période', ar: 'الدور', en: 'Period' } },
    { key: 'lambda', symbol: '\\lambda', unit: 'm', min: 0.1, max: 10, step: 0.1, default: 1.5, name: { fr: "Longueur d'onde", ar: 'طول الموجة', en: 'Wavelength' } },
    { key: 'length', symbol: 'L', unit: 'm', min: 1, max: 20, step: 0.5, default: 6, name: { fr: 'Longueur de la corde', ar: 'طول الحبل', en: 'Rope length' } },
    { key: 'xM', symbol: 'x_M', unit: 'm', min: 0, max: 20, step: 0.1, default: 3, name: { fr: 'Position du point M', ar: 'موضع النقطة M', en: 'Position of point M' } },
  ],
  quantities: [
    q('yS', 'y_S', 'cm', 'Élongation de la source', 'استطالة المنبع', 'Source displacement'),
    q('yM', 'y_M', 'cm', 'Élongation du point M', 'استطالة النقطة M', 'Point M displacement'),
  ],
  vectors: [],
  defaultGraph: 'yM',
  compute: (params, interval, count) => {
    const p = reader(travelingWave.params, params);
    const [A, T, lambda, xM] = [p('A'), p('T'), p('lambda'), p('xM')];
    const t = sampleTimes(interval, count);
    return {
      t,
      yS: t.map((time) => ropeDisplacement(0, time, A, T, lambda)),
      yM: t.map((time) => ropeDisplacement(xM, time, A, T, lambda)),
    };
  },
};

/** Circuit RC : charge (E) ou décharge du condensateur. */
export const rcCircuit: SimulationModel = {
  id: 'rc-circuit',
  category: 'electricity',
  star: true,
  name: { fr: 'Circuit RC', ar: 'ثنائي القطب RC', en: 'RC circuit' },
  params: [
    { key: 'E', symbol: 'E', unit: 'V', min: 0.5, max: 50, step: 0.5, default: 6, name: { fr: 'Tension du générateur', ar: 'توتر المولد', en: 'Source voltage' } },
    { key: 'R', symbol: 'R', unit: 'kΩ', min: 0.1, max: 1000, step: 0.1, default: 10, name: { fr: 'Résistance', ar: 'المقاومة', en: 'Resistance' } },
    { key: 'C', symbol: 'C', unit: 'µF', min: 0.1, max: 10000, step: 0.1, default: 100, name: { fr: 'Capacité', ar: 'السعة', en: 'Capacitance' } },
    { key: 'discharge', symbol: '', unit: '', min: 0, max: 1, step: 1, default: 0, name: { fr: 'Décharge (0 = charge, 1 = décharge)', ar: 'تفريغ (0 = شحن، 1 = تفريغ)', en: 'Discharge (0 = charge, 1 = discharge)' } },
  ],
  quantities: [
    q('uC', 'u_C', 'V', 'Tension du condensateur', 'توتر المكثف', 'Capacitor voltage'),
    q('i', 'i', 'mA', 'Intensité du courant', 'شدة التيار', 'Current'),
    q('q', 'q', 'mC', 'Charge', 'الشحنة', 'Charge'),
  ],
  vectors: [],
  defaultGraph: 'uC',
  compute: (params, interval, count) => {
    const p = reader(rcCircuit.params, params);
    const [E, R, C, discharge] = [p('E'), p('R') * 1e3, p('C') * 1e-6, p('discharge') >= 0.5];
    const tau = R * C;
    const t = sampleTimes(interval, count);
    const uC = t.map((time) => (discharge ? E * Math.exp(-time / tau) : E * (1 - Math.exp(-time / tau))));
    const sign = discharge ? -1 : 1;
    return {
      t,
      uC,
      i: t.map((time) => ((sign * E) / R) * Math.exp(-time / tau) * 1e3),
      q: uC.map((u) => C * u * 1e3),
      tau: t.map(() => tau),
    };
  },
};

/** Circuit RLC série : oscillations amorties de la tension du condensateur. */
export const rlcCircuit: SimulationModel = {
  id: 'rlc-circuit',
  category: 'electricity',
  star: false,
  name: { fr: 'Circuit RLC (oscillations amorties)', ar: 'دارة RLC (تذبذبات مخمدة)', en: 'RLC circuit (damped oscillations)' },
  params: [
    { key: 'U0', symbol: 'U_0', unit: 'V', min: 0.5, max: 50, step: 0.5, default: 5, name: { fr: 'Tension initiale', ar: 'التوتر البدئي', en: 'Initial voltage' } },
    { key: 'R', symbol: 'R', unit: 'Ω', min: 0, max: 1000, step: 1, default: 20, name: { fr: 'Résistance', ar: 'المقاومة', en: 'Resistance' } },
    { key: 'L', symbol: 'L', unit: 'H', min: 0.01, max: 50, step: 0.01, default: 1, name: { fr: 'Inductance', ar: 'معامل التحريض', en: 'Inductance' } },
    { key: 'C', symbol: 'C', unit: 'mF', min: 0.01, max: 100, step: 0.01, default: 10, name: { fr: 'Capacité', ar: 'السعة', en: 'Capacitance' } },
  ],
  quantities: [
    q('uC', 'u_C', 'V', 'Tension du condensateur', 'توتر المكثف', 'Capacitor voltage'),
    q('i', 'i', 'A', 'Intensité du courant', 'شدة التيار', 'Current'),
  ],
  vectors: [],
  defaultGraph: 'uC',
  compute: (params, interval, count) => {
    const p = reader(rlcCircuit.params, params);
    const [U0, R, L, C] = [p('U0'), p('R'), p('L'), p('C') * 1e-3];
    // État : [charge q, intensité i = dq/dt] ; L·di/dt + R·i + q/C = 0.
    const states = integrate((_t, [qv = 0, i = 0]) => [i, (-R * i - qv / C) / L], [C * U0, 0], interval, count, 40);
    return { t: sampleTimes(interval, count), uC: column(states, 0).map((charge) => charge / C), i: column(states, 1) };
  },
};

/** Réfraction (Snell-Descartes) : l'angle d'incidence balaie une plage ; réflexion totale. */
export const refraction: SimulationModel = {
  id: 'refraction',
  category: 'optics',
  star: true,
  name: { fr: 'Réfraction (Snell-Descartes)', ar: 'الانكسار (قانون ديكارت)', en: 'Refraction (Snell’s law)' },
  params: [
    { key: 'n1', symbol: 'n_1', unit: '', min: 1, max: 2.5, step: 0.01, default: 1, name: { fr: 'Indice du milieu 1', ar: 'معامل انكسار الوسط 1', en: 'Index of medium 1' } },
    { key: 'n2', symbol: 'n_2', unit: '', min: 1, max: 2.5, step: 0.01, default: 1.5, name: { fr: 'Indice du milieu 2', ar: 'معامل انكسار الوسط 2', en: 'Index of medium 2' } },
    { key: 'i0', symbol: 'i_0', unit: '°', min: 0, max: 89, step: 1, default: 10, name: { fr: 'Angle de départ', ar: 'زاوية البداية', en: 'Start angle' } },
    { key: 'i1', symbol: 'i_1', unit: '°', min: 0, max: 89, step: 1, default: 70, name: { fr: "Angle d'arrivée", ar: 'زاوية النهاية', en: 'End angle' } },
    { key: 'sweep', symbol: '', unit: 's', min: 0.5, max: 60, step: 0.5, default: 6, name: { fr: 'Durée du balayage', ar: 'مدة المسح', en: 'Sweep duration' } },
  ],
  quantities: [
    q('i', 'i_1', '°', "Angle d'incidence", 'زاوية الورود', 'Angle of incidence'),
    q('r', 'i_2', '°', 'Angle de réfraction', 'زاوية الانكسار', 'Angle of refraction'),
  ],
  vectors: [],
  defaultGraph: 'r',
  compute: (params, interval, count) => {
    const p = reader(refraction.params, params);
    const [n1, n2, i0, i1, sweep] = [p('n1'), p('n2'), p('i0'), p('i1'), p('sweep')];
    const t = sampleTimes(interval, count);
    const i = t.map((time) => i0 + (i1 - i0) * Math.min(1, time / sweep));
    // NaN : réflexion totale (pas de rayon réfracté).
    const r = i.map((angle) => {
      const s = (n1 / n2) * Math.sin(toRadians(angle));
      return Math.abs(s) <= 1 ? toDegrees(Math.asin(s)) : Number.NaN;
    });
    return { t, i, r };
  },
};

/** Angle limite de réflexion totale (degrés), ou NaN s'il n'existe pas (n1 ≤ n2). */
export const criticalAngle = (n1: number, n2: number) =>
  n1 > n2 ? toDegrees(Math.asin(n2 / n1)) : Number.NaN;

/** Décroissance radioactive N(t) = N₀·e^(−λt). */
export const radioactiveDecay: SimulationModel = {
  id: 'radioactive-decay',
  category: 'misc',
  star: false,
  name: { fr: 'Décroissance radioactive', ar: 'التناقص الإشعاعي', en: 'Radioactive decay' },
  params: [
    { key: 'N0', symbol: 'N_0', unit: '', min: 10, max: 400, step: 10, default: 200, name: { fr: 'Noyaux au départ', ar: 'عدد النوى البدئي', en: 'Initial nuclei' } },
    { key: 'halfLife', symbol: 't_{1/2}', unit: 's', min: 0.2, max: 60, step: 0.1, default: 2, name: { fr: 'Demi-vie', ar: 'عمر النصف', en: 'Half-life' } },
  ],
  quantities: [q('N', 'N', '', 'Noyaux restants', 'النوى المتبقية', 'Remaining nuclei')],
  vectors: [],
  defaultGraph: 'N',
  compute: (params, interval, count) => {
    const p = reader(radioactiveDecay.params, params);
    const [N0, halfLife] = [p('N0'), p('halfLife')];
    const lambda = Math.LN2 / halfLife;
    const t = sampleTimes(interval, count);
    return { t, N: t.map((time) => N0 * Math.exp(-lambda * time)) };
  },
};
