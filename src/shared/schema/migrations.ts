import { CURRENT_SCHEMA_VERSION, projectSchema, type Project } from './project';

/** Une migration transforme un projet de la version N (clé) vers la version N + 1. */
export type Migration = (project: Record<string, unknown>) => Record<string, unknown>;
export type MigrationTable = Readonly<Record<number, Migration>>;

/** Aucune migration pour l'instant : la version 1 est la première. */
export const MIGRATIONS: MigrationTable = {};

export class ProjectVersionError extends Error {
  readonly version: unknown;

  constructor(version: unknown) {
    super(`Version de projet non prise en charge : ${String(version)}`);
    this.name = 'ProjectVersionError';
    this.version = version;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Fait passer un projet brut (JSON) de sa version à `targetVersion`, migration par migration. */
export const migrateProject = (
  raw: unknown,
  migrations: MigrationTable = MIGRATIONS,
  targetVersion: number = CURRENT_SCHEMA_VERSION,
): unknown => {
  if (!isRecord(raw)) {
    return raw;
  }
  const version = raw.schemaVersion;
  if (typeof version !== 'number' || !Number.isInteger(version) || version > targetVersion) {
    throw new ProjectVersionError(version);
  }
  let project = raw;
  for (let current = version; current < targetVersion; current++) {
    const migration = migrations[current];
    if (!migration) {
      throw new ProjectVersionError(current);
    }
    project = { ...migration(project), schemaVersion: current + 1 };
  }
  return project;
};

/** Migre puis valide un projet. Lève une erreur si le projet est invalide. */
export const parseProject = (raw: unknown): Project => projectSchema.parse(migrateProject(raw));
