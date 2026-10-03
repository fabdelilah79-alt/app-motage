import { describe, expect, it } from 'vitest';
import {
  CURRENT_SCHEMA_VERSION,
  ProjectVersionError,
  migrateProject,
  parseProject,
} from '../../src/shared/schema';
import { makeProjectInput } from './fixtures';

describe('migrations du projet', () => {
  it('laisse inchangé un projet déjà à la version courante', () => {
    const input = makeProjectInput();
    expect(input.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrateProject(input)).toEqual(input);
    expect(parseProject(input).id).toBe('test');
  });

  it('applique les migrations dans l’ordre, version par version', () => {
    const migrations = {
      0: (project: Record<string, unknown>) => ({ ...project, ajoutV1: true }),
      1: (project: Record<string, unknown>) => ({ ...project, ajoutV2: true }),
    };
    expect(migrateProject({ schemaVersion: 0, titre: 'x' }, migrations, 2)).toEqual({
      schemaVersion: 2,
      titre: 'x',
      ajoutV1: true,
      ajoutV2: true,
    });
  });

  it('refuse une version future, absente ou sans migration disponible', () => {
    const future = { schemaVersion: CURRENT_SCHEMA_VERSION + 1 };
    expect(() => migrateProject(future)).toThrow(ProjectVersionError);
    expect(() => migrateProject({ title: 'sans version' })).toThrow(ProjectVersionError);
    expect(() => migrateProject({ schemaVersion: 0 }, {}, 1)).toThrow(ProjectVersionError);
  });
});
