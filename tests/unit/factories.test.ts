import { describe, expect, it } from 'vitest';
import { createProject, createScene, createTextElement } from '../../src/shared/factories';
import { createImageElement } from '../../src/shared/mediaFactories';
import { FORMAT_PRESETS } from '../../src/shared/formats';
import { projectSchema, sceneElementSchema, sceneSchema } from '../../src/shared/schema';

let counter = 0;
const newId = () => `id${++counter}`;

describe('création d’objets par défaut', () => {
  it('crée un projet valide avec une scène de 5 s au format choisi', () => {
    const project = createProject(
      { id: 'p-1', title: 'Essai', formatId: 'portrait', defaultLang: 'ar' },
      newId,
    );
    expect(projectSchema.parse(project)).toEqual(project);
    expect(project.format).toEqual(FORMAT_PRESETS.portrait);
    expect(project.scenes[0]?.durationInFrames).toBe(150);
  });

  it('crée une scène, un texte arabe et une image valides', () => {
    const format = FORMAT_PRESETS.landscape;
    expect(() => sceneSchema.parse(createScene(format, newId))).not.toThrow();
    const text = createTextElement(format, 150, 'ar', newId);
    expect(sceneElementSchema.parse(text)).toEqual(text);
    expect(text.content[0]?.text).toBe('اكتب نصك هنا');
    expect(text.timing).toEqual({ from: 0, duration: 150 });
    const asset = {
      id: 'a1',
      kind: 'image' as const,
      name: 'photo.png',
      storage: 'project' as const,
      src: 'assets/photo.png',
      meta: {},
    };
    const image = createImageElement(format, 150, asset, newId);
    expect(sceneElementSchema.parse(image)).toEqual(image);
    expect(image.transform.x + image.transform.width / 2).toBe(960);
  });
});
