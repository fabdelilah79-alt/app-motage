import { z } from 'zod';
import type { FormatPresetId } from '../../shared/formats';
import { renderJobStateSchema, type RenderJobState } from '../../shared/render';
import {
  assetSchema,
  parseProject,
  type Asset,
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

const projectUrl = (id: string) => `/api/projects/${encodeURIComponent(id)}`;

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

  uploadImage: async (projectId: string, file: File): Promise<Asset> => {
    const url = `${projectUrl(projectId)}/assets?name=${encodeURIComponent(file.name)}`;
    const init = { method: 'POST', headers: { 'Content-Type': file.type }, body: file };
    return assetSchema.parse(await requestJson(url, init));
  },

  startRender: async (project: Project): Promise<RenderJobState> =>
    renderJobStateSchema.parse(await requestJson('/api/render', sendJson('POST', { project }))),

  cancelRender: async (id: string): Promise<void> => {
    await requestJson(`/api/render/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const renderEventsUrl = (id: string): string =>
  `/api/render/${encodeURIComponent(id)}/events`;
