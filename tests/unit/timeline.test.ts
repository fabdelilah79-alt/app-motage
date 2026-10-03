import { describe, expect, it } from 'vitest';
import { parseProject } from '../../src/shared/schema';
import { computeProjectDuration } from '../../src/shared/timeline';
import { makeProjectInput } from './fixtures';

describe('durée de la vidéo', () => {
  it('additionne les scènes sans transition', () => {
    const project = parseProject(
      makeProjectInput({
        scenes: [
          { id: 'a', durationInFrames: 60 },
          { id: 'b', durationInFrames: 90 },
        ],
      }),
    );
    expect(computeProjectDuration(project)).toBe(150);
  });

  it('retire la durée des transitions (les scènes se chevauchent)', () => {
    const project = parseProject(
      makeProjectInput({
        scenes: [
          { id: 'a', durationInFrames: 60 },
          { id: 'b', durationInFrames: 90, transitionIn: { type: 'fade', durationInFrames: 15 } },
          { id: 'c', durationInFrames: 30, transitionIn: { type: 'none', durationInFrames: 15 } },
        ],
      }),
    );
    expect(computeProjectDuration(project)).toBe(165);
  });

  it('ignore la transition de la première scène et limite les transitions trop longues', () => {
    const project = parseProject(
      makeProjectInput({
        scenes: [
          { id: 'a', durationInFrames: 20, transitionIn: { type: 'fade', durationInFrames: 10 } },
          { id: 'b', durationInFrames: 40, transitionIn: { type: 'slide', durationInFrames: 99 } },
        ],
      }),
    );
    // Transition limitée à 20 - 1 = 19 frames.
    expect(computeProjectDuration(project)).toBe(41);
  });

  it('donne 325 frames pour le projet de démonstration', async () => {
    const demo = await import('../../templates/demo.json');
    expect(computeProjectDuration(parseProject(demo.default))).toBe(120 + 150 + 120 - 15 - 20);
  });
});
