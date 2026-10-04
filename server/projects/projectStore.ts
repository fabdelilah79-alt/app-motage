import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createProject, randomId, type IdGenerator } from '../../src/shared/factories';
import type { FormatPresetId } from '../../src/shared/formats';
import { parseProject, type Asset, type Lang, type Project } from '../../src/shared/schema';
import { MEDIA_TYPES, PROJECT_ID_PATTERN, assetFileName, newProjectId } from './fileNames';

export type ProjectSummary = { id: string; title: string; updatedAt: string };

export type NewProjectInput = { title: string; formatId: FormatPresetId; defaultLang: Lang };

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Projet introuvable : ${id}`);
    this.name = 'ProjectNotFoundError';
  }
}

export class UnsupportedFileError extends Error {
  constructor(contentType: string) {
    super(`Type de fichier non pris en charge : ${contentType}`);
    this.name = 'UnsupportedFileError';
  }
}

const PROJECT_FILE = 'project.json';
const ASSETS_DIR = 'assets';

/**
 * Projets sur le disque : <projectsDir>/<id>/project.json + assets/.
 * Toutes les entrées (identifiants, chemins) sont vérifiées avant tout accès au disque.
 */
export const createProjectStore = (projectsDir: string, newId: IdGenerator = randomId) => {
  const projectDir = (id: string): string => {
    if (!PROJECT_ID_PATTERN.test(id)) {
      throw new ProjectNotFoundError(id);
    }
    return path.join(projectsDir, id);
  };

  const write = async (project: Project): Promise<void> => {
    const dir = projectDir(project.id);
    await mkdir(path.join(dir, ASSETS_DIR), { recursive: true });
    await writeFile(path.join(dir, PROJECT_FILE), `${JSON.stringify(project, null, 2)}\n`);
  };

  const read = async (id: string): Promise<Project> => {
    let raw: string;
    try {
      raw = await readFile(path.join(projectDir(id), PROJECT_FILE), 'utf8');
    } catch {
      throw new ProjectNotFoundError(id);
    }
    return parseProject(JSON.parse(raw));
  };

  const list = async (): Promise<ProjectSummary[]> => {
    await mkdir(projectsDir, { recursive: true });
    const entries = await readdir(projectsDir, { withFileTypes: true });
    const summaries = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && PROJECT_ID_PATTERN.test(entry.name))
        .map(async (entry): Promise<ProjectSummary | null> => {
          try {
            const file = path.join(projectsDir, entry.name, PROJECT_FILE);
            const [project, info] = await Promise.all([read(entry.name), stat(file)]);
            return { id: project.id, title: project.title, updatedAt: info.mtime.toISOString() };
          } catch {
            return null; // dossier sans projet valide : ignoré
          }
        }),
    );
    return summaries
      .filter((summary): summary is ProjectSummary => summary !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  };

  const create = async (input: NewProjectInput): Promise<Project> => {
    const project = createProject({ id: newProjectId(input.title, newId()), ...input }, newId);
    await write(project);
    return project;
  };

  const save = async (id: string, project: Project): Promise<Project> => {
    if (project.id !== id) {
      throw new ProjectNotFoundError(id);
    }
    await read(id); // le projet doit déjà exister
    await write(project);
    return project;
  };

  const duplicate = async (id: string, copyTitle: string): Promise<Project> => {
    const original = await read(id);
    const copy: Project = { ...original, id: newProjectId(copyTitle, newId()), title: copyTitle };
    await cp(projectDir(id), projectDir(copy.id), { recursive: true });
    await write(copy);
    return copy;
  };

  /** Enregistre un média importé dans assets/ et renvoie sa description pour le projet. */
  const addAsset = async (
    id: string,
    originalName: string,
    contentType: string,
    data: Buffer,
    meta: Asset['meta'] = {},
  ): Promise<Asset> => {
    const type = MEDIA_TYPES[contentType];
    if (!type) {
      throw new UnsupportedFileError(contentType);
    }
    await read(id);
    const fileName = assetFileName(originalName, type.extension, newId());
    await mkdir(path.join(projectDir(id), ASSETS_DIR), { recursive: true });
    await writeFile(path.join(projectDir(id), ASSETS_DIR, fileName), data);
    return {
      id: `asset-${newId()}`,
      kind: type.kind,
      name: originalName,
      storage: 'project',
      src: `${ASSETS_DIR}/${fileName}`,
      meta,
    };
  };

  /** Chemin absolu d'un fichier du projet, ou null s'il sort du dossier du projet. */
  const resolveFile = (id: string, relativePath: string): string | null => {
    const dir = path.resolve(projectDir(id));
    const file = path.resolve(dir, relativePath);
    return file.startsWith(dir + path.sep) ? file : null;
  };

  return { list, create, read, save, duplicate, addAsset, resolveFile };
};

export type ProjectStore = ReturnType<typeof createProjectStore>;
