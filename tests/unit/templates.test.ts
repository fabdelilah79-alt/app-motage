import { describe, expect, it } from 'vitest';
import { LANGS, sceneElementSchema } from '../../src/shared/schema';
import { createProjectFromTemplate, TEMPLATES } from '../../src/shared/templates/registry';
import { computeProjectDuration } from '../../src/shared/timeline';
import { THEMES } from '../../src/video/themes/themes';

let counter = 0;
const newId = () => `id${++counter}`;
const ARABIC = /[؀-ۿ]/;

describe('modèles de vidéos (section 6.11)', () => {
  it('propose les 8 modèles, traduits en fr / ar / en', () => {
    expect(TEMPLATES.map((template) => template.id)).toEqual([
      'concept-60s',
      'definition-formula',
      'solved-exercise',
      'simulated-experiment',
      'compare-two',
      'chapter-summary',
      'vertical-short',
      'channel-intro-outro',
    ]);
    for (const template of TEMPLATES) {
      expect(THEMES.some((theme) => theme.id === template.themeId)).toBe(true);
      for (const lang of LANGS) {
        expect(template.name[lang].length).toBeGreaterThan(0);
        expect(template.description[lang].length).toBeGreaterThan(0);
      }
    }
  });

  it.each(TEMPLATES.flatMap((template) => LANGS.map((lang) => [template.id, lang, template] as const)))(
    '%s en %s : projet valide, identifiants uniques, textes dans la langue choisie',
    (_id, lang, template) => {
      const project = createProjectFromTemplate({ id: 'p', title: 'Essai', defaultLang: lang }, template, newId);
      const ids = project.scenes.flatMap((scene) => [scene.id, ...scene.elements.map((element) => element.id)]);
      expect(new Set(ids).size).toBe(ids.length);
      for (const scene of project.scenes) {
        for (const element of scene.elements) {
          expect(() => sceneElementSchema.parse(element)).not.toThrow();
          if (element.type === 'text' || element.type === 'callout') {
            expect(element.lang).toBe(lang);
            const text = element.content.map((run) => (run.kind === 'text' ? run.text : '')).join('');
            if (lang === 'ar') expect(ARABIC.test(text)).toBe(true);
          }
        }
      }
      expect(computeProjectDuration(project)).toBeGreaterThan(project.format.fps * 10);
    },
  );

  it('« Notion en 60 secondes » dure environ une minute ; le Short est vertical', () => {
    const concept = TEMPLATES.find((template) => template.id === 'concept-60s');
    const short = TEMPLATES.find((template) => template.id === 'vertical-short');
    if (!concept || !short) throw new Error('modèles manquants');
    const seconds = computeProjectDuration(createProjectFromTemplate({ id: 'p', title: 't', defaultLang: 'fr' }, concept, newId)) / 30;
    expect(seconds).toBeGreaterThan(50);
    expect(seconds).toBeLessThan(70);
    const vertical = createProjectFromTemplate({ id: 'p', title: 't', defaultLang: 'ar' }, short, newId);
    expect(vertical.format).toMatchObject({ width: 1080, height: 1920 });
  });
});
