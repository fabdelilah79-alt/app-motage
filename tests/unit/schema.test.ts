import { describe, expect, it } from 'vitest';
import demoTemplate from '../../templates/demo.json';
import { parseProject, projectSchema } from '../../src/shared/schema';
import { makeProjectInput } from './fixtures';

describe('schéma du projet', () => {
  it('valide le projet de démonstration (3 scènes, fr / ar / en)', () => {
    const project = parseProject(demoTemplate);
    expect(project.scenes).toHaveLength(3);
    const langs = project.scenes.flatMap((scene) =>
      scene.elements.flatMap((element) => (element.type === 'text' ? [element.lang] : [])),
    );
    expect(new Set(langs)).toEqual(new Set(['fr', 'ar', 'en']));
  });

  it('applique les valeurs par défaut', () => {
    const project = parseProject(
      makeProjectInput({
        scenes: [
          {
            id: 'scene-1',
            durationInFrames: 60,
            elements: [
              {
                id: 'text-1',
                type: 'text',
                lang: 'ar',
                transform: { x: 0, y: 0, width: 400, height: 100 },
                timing: { from: 0, duration: 60 },
                content: [{ kind: 'text', text: 'مرحبا' }],
              },
            ],
          },
        ],
      }),
    );
    const scene = project.scenes[0];
    expect(scene?.background).toEqual({ type: 'color', color: '#ffffff' });
    const element = scene?.elements[0];
    expect(element?.animations).toEqual({});
    expect(element?.transform).toMatchObject({ rotation: 0, scale: 1, opacity: 1 });
    if (element?.type !== 'text') {
      throw new Error('élément texte attendu');
    }
    expect(element.direction).toBe('auto');
    expect(element.style).toMatchObject({ fontSize: 64, fontWeight: 400, align: 'start' });
  });

  it('refuse un projet sans scène', () => {
    expect(projectSchema.safeParse(makeProjectInput({ scenes: [] })).success).toBe(false);
  });

  it('refuse une scène de durée nulle', () => {
    const input = makeProjectInput({ scenes: [{ id: 'scene-1', durationInFrames: 0 }] });
    expect(projectSchema.safeParse(input).success).toBe(false);
  });

  it('refuse un type d’élément inconnu', () => {
    const input = {
      ...makeProjectInput(),
      scenes: [{ id: 'scene-1', durationInFrames: 60, elements: [{ id: 'x', type: 'teapot' }] }],
    };
    expect(projectSchema.safeParse(input).success).toBe(false);
  });
});
