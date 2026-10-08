import type { IdGenerator } from '../factories';
import type { Lang, SceneInput } from '../schema';
import { L, makeKit, scene } from './kit';

const W = { x: 160, width: 1600 };

/** « Comparer deux phénomènes » : deux colonnes, puis graphique en barres. */
export const compareTwo = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  const rtl = lang === 'ar';
  const left = { x: 120, width: 800 };
  const right = { x: 1000, width: 800 };
  const [first, second] = rtl ? [right, left] : [left, right];
  return [
    scene(newId, 180, [
      k.text(L('Conduction ou convection ?', 'التوصيل أم الحمل الحراري؟', 'Conduction or convection?'), { ...W, y: 420, height: 200 }, 0, 180, 100),
    ]),
    scene(newId, 360, [
      k.callout('definition', L('Conduction : la chaleur passe de proche en proche, sans déplacement de matière.', 'التوصيل: تنتقل الحرارة تدريجيًا دون انتقال المادة.', 'Conduction: heat passes step by step, with no movement of matter.'), { ...first, y: 300, height: 420 }, 0, 360),
      k.callout('example', L('Convection : la chaleur est transportée par le mouvement d’un fluide.', 'الحمل الحراري: تُنقل الحرارة بحركة مائع.', 'Convection: heat is carried by the motion of a fluid.'), { ...second, y: 300, height: 420 }, 60, 300),
    ]),
    scene(newId, 300, [
      k.text(L('Conductivité thermique (W·m⁻¹·K⁻¹)', 'الموصلية الحرارية (W·m⁻¹·K⁻¹)', 'Thermal conductivity (W·m⁻¹·K⁻¹)'), { ...W, y: 60, height: 100 }, 0, 300, 52),
      {
        id: k.id('chart'),
        type: 'chart',
        chartKind: 'bar',
        transform: { x: 260, y: 200, width: 1400, height: 780 },
        timing: { from: 10, duration: 290 },
        items: [
          { label: k.t(L('Cuivre', 'النحاس', 'Copper')), value: 390 },
          { label: k.t(L('Aluminium', 'الألومنيوم', 'Aluminium')), value: 237 },
          { label: k.t(L('Fer', 'الحديد', 'Iron')), value: 80 },
          { label: k.t(L('Verre', 'الزجاج', 'Glass')), value: 1 },
        ],
      },
    ]),
  ];
};

/** « Résumé de chapitre » : titre, points clés ligne par ligne, à retenir. */
export const chapterSummary = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  return [
    scene(newId, 180, [
      k.text(L('Résumé : les lois de Newton', 'ملخص: قوانين نيوتن', 'Summary: Newton’s laws'), { ...W, y: 420, height: 200 }, 0, 180, 104),
    ]),
    scene(newId, 480, [
      k.text(
        L(
          '1. Principe d’inertie\n2. Principe fondamental de la dynamique\n3. Principe des actions réciproques',
          '1. مبدأ القصور الذاتي\n2. المبدأ الأساسي للتحريك\n3. مبدأ التأثيرات المتبادلة',
          '1. Law of inertia\n2. Fundamental principle of dynamics\n3. Action and reaction',
        ),
        { ...W, y: 220, height: 520 },
        0,
        480,
        64,
        { preset: 'enter.line', align: 'start' },
      ),
    ]),
    scene(newId, 330, [
      k.math('\\sum \\vec{F} = m\\,\\vec{a}', { ...W, y: 250, height: 260 }, 0, 330, 140),
      k.callout('remember', L('La somme des forces est égale à la masse multipliée par l’accélération.', 'مجموع القوى يساوي الكتلة مضروبة في التسارع.', 'The sum of the forces equals mass times acceleration.'), { ...W, y: 620, height: 300 }, 60, 270),
    ]),
  ];
};

/** « Short vertical » (9:16) : accroche, formule, appel à l'action. */
export const verticalShort = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  const V = { x: 80, width: 920 };
  return [
    scene(newId, 150, [
      k.text(L('Pourquoi le ciel est-il bleu ?', 'لماذا السماء زرقاء؟', 'Why is the sky blue?'), { ...V, y: 700, height: 420 }, 0, 150, 110, { preset: 'enter.pop' }),
    ]),
    scene(newId, 300, [
      k.text(L('La lumière bleue est plus diffusée que la rouge :', 'يتشتت الضوء الأزرق أكثر من الأحمر:', 'Blue light is scattered more than red:'), { ...V, y: 420, height: 360 }, 0, 300, 70),
      k.math('I \\propto \\frac{1}{\\lambda^4}', { ...V, y: 900, height: 400 }, 30, 270, 160),
    ]),
    scene(newId, 150, [
      k.text(L('Abonne-toi pour plus de physique !', 'اشترك لمزيد من الفيزياء!', 'Subscribe for more physics!'), { ...V, y: 760, height: 360 }, 0, 150, 84, { preset: 'enter.pop', color: 'theme.accent1' }),
    ]),
  ];
};

/** « Intro + outro de chaîne » : nom de la chaîne, sujet, remerciement. */
export const channelIntroOutro = (lang: Lang, newId: IdGenerator): SceneInput[] => {
  const k = makeKit(lang, newId);
  return [
    scene(newId, 120, [
      k.text(L('Ma chaîne de physique', 'قناتي للفيزياء', 'My physics channel'), { ...W, y: 360, height: 200 }, 0, 120, 110, { preset: 'enter.pop' }),
      k.text(L('Comprendre le monde en équations', 'نفهم العالم بالمعادلات', 'Understanding the world in equations'), { ...W, y: 600, height: 110 }, 25, 95, 54, { bold: false, color: 'theme.muted' }),
    ]),
    scene(newId, 240, [
      k.text(L('[Votre contenu ici]', '[محتواك هنا]', '[Your content here]'), { ...W, y: 440, height: 160 }, 0, 240, 80, { color: 'theme.muted' }),
    ]),
    scene(newId, 150, [
      k.text(L('Merci d’avoir regardé !', 'شكرا على المشاهدة!', 'Thanks for watching!'), { ...W, y: 380, height: 200 }, 0, 150, 110, { preset: 'enter.pop' }),
      k.text(L('À bientôt pour une nouvelle notion', 'إلى اللقاء في درس جديد', 'See you soon for a new topic'), { ...W, y: 620, height: 110 }, 25, 125, 54, { bold: false, color: 'theme.muted' }),
    ]),
  ];
};
