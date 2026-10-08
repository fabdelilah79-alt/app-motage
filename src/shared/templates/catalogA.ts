import type { IdGenerator } from '../factories';
import type { Lang, SceneInput } from '../schema';
import { L, makeKit, scene } from './kit';

const W = { x: 160, width: 1600 };

/** « Notion en 60 secondes » : accroche, définition, formule, courbe, à retenir. */
export const conceptIn60 = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  return [
    scene(newId, 270, [
      k.text(L('La chute libre en 60 secondes', 'السقوط الحر في 60 ثانية', 'Free fall in 60 seconds'), { ...W, y: 360, height: 200 }, 0, 270, 110),
      k.text(L('Pourquoi tous les objets tombent-ils de la même façon ?', 'لماذا تسقط كل الأجسام بالطريقة نفسها؟', 'Why do all objects fall the same way?'), { ...W, y: 600, height: 120 }, 40, 230, 54, { bold: false, color: 'theme.muted' }),
    ], k.t(L('Aujourd’hui, la chute libre en une minute.', 'اليوم، السقوط الحر في دقيقة واحدة.', 'Today, free fall in one minute.'))),
    scene(newId, 450, [
      k.callout('definition', L('Un corps est en chute libre lorsqu’il n’est soumis qu’à son poids.', 'يكون الجسم في سقوط حر عندما يخضع لوزنه فقط.', 'A body is in free fall when its weight is the only force acting on it.'), { ...W, y: 340, height: 360 }, 0, 450),
    ]),
    scene(newId, 450, [
      k.text(L('Sa vitesse augmente régulièrement :', 'تتزايد سرعته بانتظام:', 'Its speed increases steadily:'), { ...W, y: 180, height: 120 }, 0, 450, 64),
      k.math('v = g \\, t', { ...W, y: 380, height: 220 }, 20, 430, 140),
      k.math('g \\approx 9{,}81\\,\\text{m}\\cdot\\text{s}^{-2}', { ...W, y: 650, height: 160 }, 120, 330, 80),
    ]),
    scene(newId, 450, [
        {
          id: k.id('plot'),
          type: 'plot2d',
          transform: { x: 260, y: 80, width: 1400, height: 900 },
          timing: { from: 0, duration: 450 },
          axes: { xMin: 0, xMax: 5, yMin: 0, yMax: 50, xLabel: 't (s)', yLabel: 'v (m/s)' },
          series: [{ id: 'v-t', kind: 'function', expr: '9.81*x', drawStart: 20, drawDuration: 120 }],
          decorations: [{ id: 'point', kind: 'movingPoint', seriesId: 'v-t', from: 0, to: 5, start: 150, duration: 200 }],
        },
      ]),
    scene(newId, 180, [
      k.callout('remember', L('Sans frottement, tous les objets tombent avec la même accélération g.', 'بدون احتكاك، تسقط كل الأجسام بالتسارع نفسه g.', 'Without friction, all objects fall with the same acceleration g.'), { ...W, y: 340, height: 360 }, 0, 180),
    ]),
  ];
};

/** « Définition + formule » : le mot, sa définition, la formule mise en valeur. */
export const definitionFormula = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  return [
    scene(newId, 180, [
      k.text(L('L’énergie cinétique', 'الطاقة الحركية', 'Kinetic energy'), { ...W, y: 420, height: 200 }, 0, 180, 120),
    ]),
    scene(newId, 300, [
      k.callout('definition', L('L’énergie cinétique est l’énergie que possède un corps du fait de son mouvement.', 'الطاقة الحركية هي الطاقة التي يمتلكها جسم بسبب حركته.', 'Kinetic energy is the energy a body has because of its motion.'), { ...W, y: 340, height: 360 }, 0, 300),
    ]),
    scene(newId, 330, [
      {
        ...k.math('E_c = \\frac{1}{2} m v^2', { ...W, y: 330, height: 300 }, 0, 330, 150),
        animations: {
          enter: { presetId: 'enter.terms', duration: 40 },
          emphasis: [{ presetId: 'emphasis.termBox', duration: 20, delay: 80, params: { term: 5 } }],
        },
      },
      k.text(L('m en kg, v en m/s, Ec en joules (J)', 'm بـ kg و v بـ m/s و Ec بالجول (J)', 'm in kg, v in m/s, Ec in joules (J)'), { ...W, y: 720, height: 100 }, 120, 210, 48, { bold: false, color: 'theme.muted' }),
    ]),
  ];
};

/** « Exercice corrigé pas à pas » : énoncé, données, calcul en étapes, résultat. */
export const solvedExercise = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  return [
    scene(newId, 300, [
      k.text(L('Exercice', 'تمرين', 'Exercise'), { ...W, y: 80, height: 120 }, 0, 300, 80),
      k.text(L('Une voiture de 1 000 kg roule à 20 m/s. Calculer son énergie cinétique.', 'سيارة كتلتها 1000 kg تسير بسرعة 20 m/s. احسب طاقتها الحركية.', 'A 1,000 kg car moves at 20 m/s. Compute its kinetic energy.'), { ...W, y: 300, height: 300 }, 20, 280, 60, { bold: false, preset: 'enter.line' }),
    ]),
    scene(newId, 240, [
      k.callout('method', L('On écrit la formule, on remplace par les valeurs, puis on calcule.', 'نكتب العلاقة، ثم نعوض بالقيم، ثم نحسب.', 'Write the formula, substitute the values, then compute.'), { ...W, y: 340, height: 340 }, 0, 240),
    ]),
    scene(newId, 420, [
      k.math('E_c = \\frac{1}{2} m v^2', { ...W, y: 360, height: 300 }, 0, 420, 130, [
        { latex: 'E_c = \\frac{1}{2} \\times 1000 \\times 20^2', at: 120 },
        { latex: 'E_c = 200\\,000\\,\\text{J}', at: 260 },
      ]),
    ]),
    scene(newId, 180, [
      k.callout('remember', L('Résultat : Ec = 200 kJ. Penser à convertir les unités !', 'النتيجة: Ec = 200 kJ. لا تنس تحويل الوحدات!', 'Result: Ec = 200 kJ. Remember to convert units!'), { ...W, y: 340, height: 340 }, 0, 180),
    ]),
  ];
};

/** « Expérience simulée » : question, simulation avec graphique synchronisé, conclusion. */
export const simulatedExperiment = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  return [
    scene(newId, 210, [
      k.text(L('La période d’un pendule dépend-elle de sa masse ?', 'هل يتعلق دور النواس بكتلته؟', 'Does a pendulum’s period depend on its mass?'), { ...W, y: 400, height: 240 }, 0, 210, 80),
    ]),
    scene(newId, 450, [
      {
        id: k.id('simulation'),
        type: 'simulation',
        simId: 'pendulum',
        transform: { x: 80, y: 100, width: 1760, height: 880 },
        timing: { from: 0, duration: 450 },
        params: { L: 1, theta0: 15 },
        display: { vectors: ['velocity'], energyBars: false },
        graph: { quantity: 'theta', position: 'right' },
      },
    ]),
    scene(newId, 210, [
      k.callout('remember', L('Non : aux petits angles, T = 2π√(L/g) ne dépend que de la longueur L.', 'لا: عند الزوايا الصغيرة، T = 2π√(L/g) يتعلق فقط بالطول L.', 'No: for small angles, T = 2π√(L/g) depends only on the length L.'), { ...W, y: 340, height: 360 }, 0, 210),
    ]),
  ];
};
