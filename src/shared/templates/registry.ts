import type { IdGenerator } from '../factories';
import { FORMAT_PRESETS, type FormatPresetId } from '../formats';
import { CURRENT_SCHEMA_VERSION, parseProject, type Lang, type Project, type SceneInput } from '../schema';
import { conceptIn60, definitionFormula, simulatedExperiment, solvedExercise } from './catalogA';
import { channelIntroOutro, chapterSummary, compareTwo, verticalShort } from './catalogB';
import { L, type Texts } from './kit';

export type VideoTemplate = {
  id: string;
  name: Texts;
  description: Texts;
  /** Format du modèle (les positions des éléments sont prévues pour ce format). */
  formatId: FormatPresetId;
  themeId: string;
  build: (lang: Lang, newId: IdGenerator) => SceneInput[];
};

/** Les 8 modèles de la section 6.11 du plan, en français, arabe et anglais. */
export const TEMPLATES: readonly VideoTemplate[] = [
  { id: 'concept-60s', formatId: 'landscape', name: L('Notion en 60 secondes', 'مفهوم في 60 ثانية', 'Concept in 60 seconds'), description: L('Accroche, définition, formule, courbe et à retenir.', 'تمهيد، تعريف، علاقة، منحنى وخلاصة.', 'Hook, definition, formula, curve and key point.'), themeId: 'dark-math', build: conceptIn60 },
  { id: 'definition-formula', formatId: 'landscape', name: L('Définition + formule', 'تعريف + علاقة', 'Definition + formula'), description: L('Le mot, sa définition, la formule mise en valeur.', 'الكلمة، تعريفها، والعلاقة مع إبرازها.', 'The word, its definition, the highlighted formula.'), themeId: 'minimal-light', build: definitionFormula },
  { id: 'solved-exercise', formatId: 'landscape', name: L('Exercice corrigé pas à pas', 'تمرين محلول خطوة بخطوة', 'Step-by-step solved exercise'), description: L('Énoncé, méthode, calcul qui se transforme, résultat.', 'النص، الطريقة، حساب متدرج، النتيجة.', 'Statement, method, step-by-step calculation, result.'), themeId: 'notebook', build: solvedExercise },
  { id: 'simulated-experiment', formatId: 'landscape', name: L('Expérience simulée', 'تجربة محاكاة', 'Simulated experiment'), description: L('Une question, une simulation avec son graphique, la conclusion.', 'سؤال، محاكاة مع مخططها، والاستنتاج.', 'A question, a simulation with its graph, the conclusion.'), themeId: 'lab', build: simulatedExperiment },
  { id: 'compare-two', formatId: 'landscape', name: L('Comparer deux phénomènes', 'مقارنة ظاهرتين', 'Compare two phenomena'), description: L('Deux encadrés côte à côte puis un graphique en barres.', 'إطاران متجاوران ثم مخطط بالأعمدة.', 'Two side-by-side boxes, then a bar chart.'), themeId: 'paper-cut', build: compareTwo },
  { id: 'chapter-summary', formatId: 'landscape', name: L('Résumé de chapitre', 'ملخص الفصل', 'Chapter summary'), description: L('Titre, points clés ligne par ligne, formule à retenir.', 'العنوان، النقاط الأساسية سطرًا بسطر، علاقة للحفظ.', 'Title, key points line by line, formula to remember.'), themeId: 'chalkboard', build: chapterSummary },
  { id: 'vertical-short', name: L('Short vertical', 'فيديو قصير عمودي', 'Vertical short'), description: L('Format 9:16 pour Shorts, Reels et Statuts.', 'صيغة 9:16 للمقاطع القصيرة والحالات.', '9:16 format for Shorts, Reels and Status.'), formatId: 'portrait', themeId: 'neon', build: verticalShort },
  { id: 'channel-intro-outro', formatId: 'landscape', name: L('Intro + outro de chaîne', 'مقدمة وخاتمة القناة', 'Channel intro + outro'), description: L('Nom de la chaîne, emplacement du contenu, remerciement.', 'اسم القناة، مكان المحتوى، شكر.', 'Channel name, content placeholder, thanks.'), themeId: 'kinetic', build: channelIntroOutro },
];

export const getTemplate = (id: string | undefined) => TEMPLATES.find((template) => template.id === id);

/** Les modèles sont écrits à 30 images/s (durées en frames). */
type NewProjectOptions = { id: string; title: string; defaultLang: Lang };

/** Projet complet à partir d'un modèle, dans la langue choisie. */
export const createProjectFromTemplate = (
  options: NewProjectOptions,
  template: VideoTemplate,
  newId: IdGenerator,
): Project =>
  parseProject({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: options.id,
    title: options.title,
    format: { ...FORMAT_PRESETS[template.formatId] },
    defaultLang: options.defaultLang,
    themeId: template.themeId,
    scenes: template.build(options.defaultLang, newId),
  });
