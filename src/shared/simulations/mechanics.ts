import { column, integrate, sampleTimes } from './integrator';
import { gravityParam, massParam, reader, toDegrees, toRadians } from './params';
import type { Quantity, SimulationModel } from './types';

const q = (key: string, symbol: string, unit: string, fr: string, ar: string, en: string): Quantity => ({
  key,
  symbol,
  unit,
  name: { fr, ar, en },
});

const ENERGY: readonly Quantity[] = [
  q('ec', 'E_c', 'J', 'Énergie cinétique', 'الطاقة الحركية', 'Kinetic energy'),
  q('ep', 'E_p', 'J', 'Énergie potentielle', 'طاقة الوضع', 'Potential energy'),
  q('em', 'E_m', 'J', 'Énergie mécanique', 'الطاقة الميكانيكية', 'Mechanical energy'),
];

/** Chute libre verticale (frottement fluide facultatif) jusqu'au sol. */
export const freeFall: SimulationModel = {
  id: 'free-fall',
  category: 'mechanics',
  star: true,
  name: { fr: 'Chute libre', ar: 'السقوط الحر', en: 'Free fall' },
  params: [
    { key: 'h0', symbol: 'h_0', unit: 'm', min: 0.1, max: 200, step: 0.5, default: 20, name: { fr: 'Hauteur initiale', ar: 'الارتفاع البدئي', en: 'Initial height' } },
    massParam(1),
    gravityParam(),
    { key: 'k', symbol: 'k', unit: 'kg/s', min: 0, max: 5, step: 0.05, default: 0, name: { fr: 'Frottement fluide', ar: 'الاحتكاك المائع', en: 'Air drag' } },
  ],
  quantities: [
    q('y', 'y', 'm', 'Hauteur', 'الارتفاع', 'Height'),
    q('v', 'v', 'm/s', 'Vitesse', 'السرعة', 'Speed'),
    ...ENERGY,
  ],
  vectors: ['velocity', 'weight'],
  defaultGraph: 'y',
  compute: (params, interval, count) => {
    const p = reader(freeFall.params, params);
    const [h0, m, g, k] = [p('h0'), p('m'), p('g'), p('k')];
    // État : [hauteur, vitesse vers le bas].
    const states = integrate(
      (_t, [, v = 0]) => [-v, g - (k / m) * v],
      [h0, 0],
      interval,
      count,
      20,
      ([y = 0]) => (y <= 0 ? [0, 0] : null),
    );
    const y = column(states, 0);
    const v = column(states, 1);
    const ec = v.map((value) => 0.5 * m * value * value);
    const ep = y.map((value) => m * g * value);
    return { t: sampleTimes(interval, count), y, v, ec, ep, em: ec.map((value, i) => value + (ep[i] ?? 0)) };
  },
};

/** Projectile sans frottement : trajectoire parabolique jusqu'au sol. */
export const projectile: SimulationModel = {
  id: 'projectile',
  category: 'mechanics',
  star: true,
  name: { fr: 'Projectile', ar: 'المقذوف', en: 'Projectile' },
  params: [
    { key: 'v0', symbol: 'v_0', unit: 'm/s', min: 0.5, max: 100, step: 0.5, default: 15, name: { fr: 'Vitesse initiale', ar: 'السرعة البدئية', en: 'Initial speed' } },
    { key: 'alpha', symbol: '\\alpha', unit: '°', min: 0, max: 90, step: 1, default: 45, name: { fr: 'Angle de tir', ar: 'زاوية القذف', en: 'Launch angle' } },
    { key: 'h0', symbol: 'h_0', unit: 'm', min: 0, max: 100, step: 0.5, default: 0, name: { fr: 'Hauteur initiale', ar: 'الارتفاع البدئي', en: 'Initial height' } },
    gravityParam(),
  ],
  quantities: [
    q('x', 'x', 'm', 'Abscisse', 'الأفصول', 'x position'),
    q('y', 'y', 'm', 'Altitude', 'الأرتوب', 'Height'),
    q('vx', 'v_x', 'm/s', 'Vitesse horizontale', 'السرعة الأفقية', 'Horizontal speed'),
    q('vy', 'v_y', 'm/s', 'Vitesse verticale', 'السرعة الرأسية', 'Vertical speed'),
  ],
  vectors: ['velocity', 'components', 'weight'],
  defaultGraph: 'y',
  compute: (params, interval, count) => {
    const p = reader(projectile.params, params);
    const [v0, alpha, h0, g] = [p('v0'), toRadians(p('alpha')), p('h0'), p('g')];
    const vx0 = v0 * Math.cos(alpha);
    const vy0 = v0 * Math.sin(alpha);
    // Instant d'arrivée au sol (racine positive de h0 + vy0·t − g·t²/2 = 0).
    const landing = (vy0 + Math.sqrt(vy0 * vy0 + 2 * g * h0)) / g;
    const t = sampleTimes(interval, count);
    const tc = t.map((time) => Math.min(time, landing));
    return {
      t,
      x: tc.map((time) => vx0 * time),
      y: tc.map((time) => Math.max(0, h0 + vy0 * time - 0.5 * g * time * time)),
      vx: t.map((time) => (time < landing ? vx0 : 0)),
      vy: t.map((time) => (time < landing ? vy0 - g * time : 0)),
    };
  },
};

/** Portée théorique d'un tir depuis le sol : v₀² sin(2α) / g. */
export const theoreticalRange = (v0: number, alphaDegrees: number, g: number) =>
  (v0 * v0 * Math.sin(2 * toRadians(alphaDegrees))) / g;

/** Pendule simple (amorti ou non), angle quelconque. */
export const pendulum: SimulationModel = {
  id: 'pendulum',
  category: 'mechanics',
  star: true,
  name: { fr: 'Pendule simple', ar: 'النواس البسيط', en: 'Simple pendulum' },
  params: [
    { key: 'L', symbol: 'L', unit: 'm', min: 0.05, max: 20, step: 0.05, default: 1, name: { fr: 'Longueur du fil', ar: 'طول الخيط', en: 'String length' } },
    { key: 'theta0', symbol: '\\theta_0', unit: '°', min: -170, max: 170, step: 1, default: 20, name: { fr: 'Angle initial', ar: 'الزاوية البدئية', en: 'Initial angle' } },
    massParam(0.5),
    gravityParam(),
    { key: 'b', symbol: 'b', unit: 's⁻¹', min: 0, max: 5, step: 0.01, default: 0, name: { fr: 'Amortissement', ar: 'التخميد', en: 'Damping' } },
  ],
  quantities: [
    q('theta', '\\theta', '°', 'Angle', 'الزاوية', 'Angle'),
    q('omega', '\\dot{\\theta}', 'rad/s', 'Vitesse angulaire', 'السرعة الزاوية', 'Angular speed'),
    q('v', 'v', 'm/s', 'Vitesse', 'السرعة', 'Speed'),
    ...ENERGY,
  ],
  vectors: ['velocity', 'weight', 'tension'],
  defaultGraph: 'theta',
  compute: (params, interval, count) => {
    const p = reader(pendulum.params, params);
    const [L, theta0, m, g, b] = [p('L'), toRadians(p('theta0')), p('m'), p('g'), p('b')];
    const states = integrate((_t, [th = 0, w = 0]) => [w, -(g / L) * Math.sin(th) - b * w], [theta0, 0], interval, count, 40);
    const theta = column(states, 0);
    const omega = column(states, 1);
    const v = omega.map((w) => L * w);
    const ec = v.map((value) => 0.5 * m * value * value);
    const ep = theta.map((th) => m * g * L * (1 - Math.cos(th)));
    return {
      t: sampleTimes(interval, count),
      theta: theta.map(toDegrees),
      omega,
      v,
      ec,
      ep,
      em: ec.map((value, i) => value + (ep[i] ?? 0)),
    };
  },
};

/** Oscillateur masse-ressort horizontal (amorti ou non). */
export const springMass: SimulationModel = {
  id: 'spring-mass',
  category: 'mechanics',
  star: true,
  name: { fr: 'Masse-ressort', ar: 'نواس مرن', en: 'Mass-spring' },
  params: [
    { key: 'k', symbol: 'k', unit: 'N/m', min: 0.1, max: 500, step: 0.5, default: 20, name: { fr: 'Raideur', ar: 'الصلابة', en: 'Stiffness' } },
    massParam(0.5),
    { key: 'x0', symbol: 'x_0', unit: 'm', min: -1, max: 1, step: 0.01, default: 0.1, name: { fr: 'Élongation initiale', ar: 'الاستطالة البدئية', en: 'Initial displacement' } },
    { key: 'c', symbol: 'h', unit: 'kg/s', min: 0, max: 10, step: 0.05, default: 0, name: { fr: 'Frottement', ar: 'الاحتكاك', en: 'Friction' } },
  ],
  quantities: [
    q('x', 'x', 'm', 'Élongation', 'الاستطالة', 'Displacement'),
    q('v', 'v', 'm/s', 'Vitesse', 'السرعة', 'Speed'),
    ...ENERGY,
  ],
  vectors: ['velocity', 'force'],
  defaultGraph: 'x',
  compute: (params, interval, count) => {
    const p = reader(springMass.params, params);
    const [k, m, x0, c] = [p('k'), p('m'), p('x0'), p('c')];
    const states = integrate((_t, [x = 0, v = 0]) => [v, (-k * x - c * v) / m], [x0, 0], interval, count, 40);
    const x = column(states, 0);
    const v = column(states, 1);
    const ec = v.map((value) => 0.5 * m * value * value);
    const ep = x.map((value) => 0.5 * k * value * value);
    return { t: sampleTimes(interval, count), x, v, ec, ep, em: ec.map((value, i) => value + (ep[i] ?? 0)) };
  },
};

/** Glissement sur un plan incliné avec frottement solide. */
export const inclinedPlane: SimulationModel = {
  id: 'inclined-plane',
  category: 'mechanics',
  star: false,
  name: { fr: 'Plan incliné avec frottement', ar: 'مستوى مائل مع احتكاك', en: 'Inclined plane with friction' },
  params: [
    { key: 'alpha', symbol: '\\alpha', unit: '°', min: 0, max: 80, step: 1, default: 30, name: { fr: 'Inclinaison', ar: 'زاوية الميل', en: 'Slope angle' } },
    { key: 'mu', symbol: '\\mu', unit: '', min: 0, max: 1.5, step: 0.01, default: 0.2, name: { fr: 'Coefficient de frottement', ar: 'معامل الاحتكاك', en: 'Friction coefficient' } },
    { key: 'L', symbol: 'L', unit: 'm', min: 0.5, max: 50, step: 0.5, default: 5, name: { fr: 'Longueur du plan', ar: 'طول المستوى', en: 'Plane length' } },
    massParam(1),
    gravityParam(),
  ],
  quantities: [
    q('s', 'x', 'm', 'Distance parcourue', 'المسافة المقطوعة', 'Distance'),
    q('v', 'v', 'm/s', 'Vitesse', 'السرعة', 'Speed'),
  ],
  vectors: ['weight', 'normal', 'friction', 'velocity'],
  defaultGraph: 'v',
  compute: (params, interval, count) => {
    const p = reader(inclinedPlane.params, params);
    const [alpha, mu, L, g] = [toRadians(p('alpha')), p('mu'), p('L'), p('g')];
    const a = Math.max(0, g * (Math.sin(alpha) - mu * Math.cos(alpha)));
    const tEnd = a > 0 ? Math.sqrt((2 * L) / a) : Number.POSITIVE_INFINITY;
    const t = sampleTimes(interval, count);
    return {
      t,
      s: t.map((time) => 0.5 * a * Math.min(time, tEnd) ** 2),
      v: t.map((time) => (time < tEnd ? a * time : 0)),
    };
  },
};

/** Mouvement circulaire uniforme. */
export const circularMotion: SimulationModel = {
  id: 'circular-motion',
  category: 'mechanics',
  star: false,
  name: { fr: 'Mouvement circulaire uniforme', ar: 'الحركة الدائرية المنتظمة', en: 'Uniform circular motion' },
  params: [
    { key: 'R', symbol: 'R', unit: 'm', min: 0.1, max: 100, step: 0.1, default: 2, name: { fr: 'Rayon', ar: 'الشعاع', en: 'Radius' } },
    { key: 'T', symbol: 'T', unit: 's', min: 0.2, max: 60, step: 0.1, default: 4, name: { fr: 'Période', ar: 'الدور', en: 'Period' } },
  ],
  quantities: [
    q('x', 'x', 'm', 'Abscisse', 'الأفصول', 'x position'),
    q('y', 'y', 'm', 'Ordonnée', 'الأرتوب', 'y position'),
    q('angle', '\\theta', '°', 'Angle', 'الزاوية', 'Angle'),
  ],
  vectors: ['velocity', 'acceleration'],
  defaultGraph: 'x',
  compute: (params, interval, count) => {
    const p = reader(circularMotion.params, params);
    const [R, T] = [p('R'), p('T')];
    const t = sampleTimes(interval, count);
    const angle = t.map((time) => (2 * Math.PI * time) / T);
    return {
      t,
      x: angle.map((a) => R * Math.cos(a)),
      y: angle.map((a) => R * Math.sin(a)),
      angle: angle.map((a) => toDegrees(a) % 360),
    };
  },
};

/** Satellite autour d'une planète (lois de Kepler), unités réduites (GM réglable). */
export const satellite: SimulationModel = {
  id: 'satellite',
  category: 'mechanics',
  star: false,
  name: { fr: 'Satellite (lois de Kepler)', ar: 'قمر اصطناعي (قوانين كبلر)', en: 'Satellite (Kepler laws)' },
  params: [
    { key: 'r0', symbol: 'r_0', unit: 'u', min: 1, max: 10, step: 0.1, default: 4, name: { fr: 'Distance initiale', ar: 'المسافة البدئية', en: 'Initial distance' } },
    { key: 'v0', symbol: 'v_0', unit: 'u/s', min: 0.1, max: 10, step: 0.05, default: 2.6, name: { fr: 'Vitesse initiale', ar: 'السرعة البدئية', en: 'Initial speed' } },
    { key: 'GM', symbol: 'GM', unit: 'u³/s²', min: 1, max: 200, step: 1, default: 40, name: { fr: 'Constante GM', ar: 'الثابتة GM', en: 'GM constant' } },
  ],
  quantities: [
    q('r', 'r', 'u', 'Distance au centre', 'المسافة إلى المركز', 'Distance'),
    q('v', 'v', 'u/s', 'Vitesse', 'السرعة', 'Speed'),
    q('x', 'x', 'u', 'Abscisse', 'الأفصول', 'x position'),
    q('y', 'y', 'u', 'Ordonnée', 'الأرتوب', 'y position'),
  ],
  vectors: ['velocity', 'force'],
  defaultGraph: 'r',
  compute: (params, interval, count) => {
    const p = reader(satellite.params, params);
    const [r0, v0, GM] = [p('r0'), p('v0'), p('GM')];
    const states = integrate(
      (_t, [x = 0, y = 0, vx = 0, vy = 0]) => {
        const r3 = Math.max(1e-6, Math.hypot(x, y)) ** 3;
        return [vx, vy, (-GM * x) / r3, (-GM * y) / r3];
      },
      [r0, 0, 0, v0],
      interval,
      count,
      60,
    );
    const x = column(states, 0);
    const y = column(states, 1);
    return {
      t: sampleTimes(interval, count),
      x,
      y,
      r: x.map((value, i) => Math.hypot(value, y[i] ?? 0)),
      v: states.map(([, , vx = 0, vy = 0]) => Math.hypot(vx, vy)),
    };
  },
};
