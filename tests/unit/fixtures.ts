import type { ProjectInput } from '../../src/shared/schema';

/** Projet minimal valide, à compléter selon le test. */
export const makeProjectInput = (overrides: Partial<ProjectInput> = {}): ProjectInput => ({
  schemaVersion: 1,
  id: 'test',
  title: 'Projet de test',
  format: { width: 1920, height: 1080, fps: 30 },
  defaultLang: 'fr',
  scenes: [{ id: 'scene-1', durationInFrames: 60 }],
  ...overrides,
});
