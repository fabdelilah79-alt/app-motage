import { z } from 'zod';
import type { FormatPresetId } from '../../shared/formats';
import { renderJobStateSchema, type RenderJobState } from '../../shared/render';
import {
  assetSchema,
  brandSchema,
  parseProject,
  type Asset,
  type Brand,
  type Lang,
  type Project,
} from '../../shared/schema';

/** Erreur renvoyée par le serveur local (code HTTP + code d'erreur). */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const projectSummarySchema = z.object({ id: z.string(), title: z.string(), updatedAt: z.string() });
export type ProjectSummary = z.infer<typeof projectSummarySchema>;

const requestJson = async (url: string, init?: RequestInit): Promise<unknown> => {
  const response = await fetch(url, init);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = z.object({ error: z.string() }).safeParse(body);
    throw new ApiError(response.status, parsed.success ? parsed.data.error : response.statusText);
  }
  return body;
};

const sendJson = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

const brandKitResponseSchema = z.object({
  kit: z
    .object({ colors: z.array(z.string()), logo: z.object({ file: z.string() }).optional() })
    .nullable(),
});
const applyBrandResponseSchema = z.object({ brand: brandSchema, asset: assetSchema.nullable() });

const projectUrl = (id: string) => `/api/projects/${encodeURIComponent(id)}`;

export type MediaMeta = Asset['meta'];

const TYPES_BY_EXTENSION: Readonly<Record<string, string>> = {
  json: 'application/x-lottie+json',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};

/** Type envoyé au serveur : celui du fichier, sinon déduit de l'extension (Lottie = .json). */
export const uploadContentType = (file: Blob, name: string): string => {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  if (extension === 'json') return 'application/x-lottie+json';
  return file.type || TYPES_BY_EXTENSION[extension] || 'application/octet-stream';
};

export const api = {
  listProjects: async (): Promise<ProjectSummary[]> =>
    z.array(projectSummarySchema).parse(await requestJson('/api/projects')),

  createProject: async (input: {
    title: string;
    formatId: FormatPresetId;
    defaultLang: Lang;
  }): Promise<Project> => parseProject(await requestJson('/api/projects', sendJson('POST', input))),

  getProject: async (id: string): Promise<Project> =>
    parseProject(await requestJson(projectUrl(id))),

  saveProject: async (project: Project): Promise<void> => {
    await requestJson(projectUrl(project.id), sendJson('PUT', { project }));
  },

  duplicateProject: async (id: string, title: string): Promise<Project> =>
    parseProject(await requestJson(`${projectUrl(id)}/duplicate`, sendJson('POST', { title }))),

  /** Envoie un média (image, GIF, vidéo, son, Lottie) avec ses mesures (durée, dimensions). */
  uploadMedia: async (projectId: string, file: Blob, name: string, meta: MediaMeta) => {
    const query = new URLSearchParams({ name });
    if (meta.durationInSeconds) query.set('duration', String(meta.durationInSeconds));
    if (meta.width) query.set('width', String(meta.width));
    if (meta.height) query.set('height', String(meta.height));
    const url = `${projectUrl(projectId)}/assets?${query.toString()}`;
    const headers = { 'Content-Type': uploadContentType(file, name) };
    const init = { method: 'POST', headers, body: file };
    return assetSchema.parse(await requestJson(url, init));
  },

  /** Kit de marque enregistré (null s'il n'existe pas encore). */
  getBrandKit: async (): Promise<{ colors: string[]; hasLogo: boolean } | null> => {
    const { kit } = brandKitResponseSchema.parse(await requestJson('/api/brand'));
    return kit ? { colors: kit.colors, hasLogo: kit.logo !== undefined } : null;
  },

  saveBrandKit: async (projectId: string, brand: Brand): Promise<void> => {
    await requestJson('/api/brand', sendJson('PUT', { projectId, brand }));
  },

  /** Copie le kit de marque dans le projet (le logo devient un média du projet). */
  applyBrandKit: async (projectId: string) =>
    applyBrandResponseSchema.parse(
      await requestJson(`${projectUrl(projectId)}/brand`, sendJson('POST', {})),
    ),

  startRender: async (project: Project): Promise<RenderJobState> =>
    renderJobStateSchema.parse(await requestJson('/api/render', sendJson('POST', { project }))),

  cancelRender: async (id: string): Promise<void> => {
    await requestJson(`/api/render/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const renderEventsUrl = (id: string): string =>
  `/api/render/${encodeURIComponent(id)}/events`;
