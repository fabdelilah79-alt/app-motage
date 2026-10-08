import { z } from 'zod';
import { frameCountSchema, idSchema, type Project } from './schema';
import { computeProjectDuration, sceneStartFrames } from './timeline';

export const EXPORT_FORMATS = ['mp4', 'webm', 'gif', 'png'] as const;
export const EXPORT_QUALITIES = ['draft', 'standard', 'high'] as const;
export const EXPORT_SIZES = ['half', 'full', 'double'] as const;

/** Réglages choisis dans le panneau d'export. */
export const exportOptionsSchema = z.object({
  format: z.enum(EXPORT_FORMATS).default('mp4'),
  quality: z.enum(EXPORT_QUALITIES).default('standard'),
  /** 50 %, 100 % ou 200 % de la taille du projet (200 % d'un projet 1080p = 4K). */
  size: z.enum(EXPORT_SIZES).default('full'),
  range: z
    .discriminatedUnion('kind', [
      z.object({ kind: z.literal('all') }),
      z.object({ kind: z.literal('scene'), sceneId: idSchema }),
      z.object({ kind: z.literal('interval'), from: frameCountSchema, to: frameCountSchema }),
    ])
    .default({ kind: 'all' }),
  /** Image exportée en PNG (miniature), en frame de la vidéo complète. */
  stillFrame: frameCountSchema.default(0),
  /** Écrire aussi le fichier de sous-titres .srt à côté de la vidéo. */
  srt: z.boolean().default(false),
});
export type ExportOptions = z.infer<typeof exportOptionsSchema>;
export type ExportOptionsInput = z.input<typeof exportOptionsSchema>;

const SCALE = { half: 0.5, full: 1, double: 2 } as const;
/** Qualité H.264 / VP8 : plus le CRF est bas, meilleure est l'image (et plus le fichier est lourd). */
const CRF = { draft: 32, standard: 23, high: 17 } as const;

export type RenderSettings =
  | {
      kind: 'video';
      codec: 'h264' | 'vp8' | 'gif';
      crf: number | null;
      scale: number;
      frameRange: [number, number] | null;
      /** GIF : une image sur deux (fichier plus léger). */
      everyNthFrame: number;
      extension: 'mp4' | 'webm' | 'gif';
    }
  | { kind: 'still'; frame: number; scale: number; extension: 'png' };

/** Intervalle de frames à rendre (null = toute la vidéo). */
export const exportFrameRange = (project: Project, range: ExportOptions['range']): [number, number] | null => {
  const total = computeProjectDuration(project);
  const clamp = (frame: number) => Math.max(0, Math.min(total - 1, Math.round(frame)));
  switch (range.kind) {
    case 'all':
      return null;
    case 'scene': {
      const index = project.scenes.findIndex((scene) => scene.id === range.sceneId);
      const scene = project.scenes[index];
      if (!scene) return null;
      const start = sceneStartFrames(project)[index] ?? 0;
      return [clamp(start), clamp(start + scene.durationInFrames - 1)];
    }
    case 'interval': {
      const from = clamp(Math.min(range.from, range.to));
      const to = clamp(Math.max(range.from, range.to));
      return [from, Math.max(from, to)];
    }
  }
};

/** Réglages de rendu Remotion correspondant aux choix de l'enseignant (fonction pure). */
export const renderSettings = (project: Project, options: ExportOptions): RenderSettings => {
  // Le brouillon est rendu en demi-taille pour aller deux fois plus vite.
  const scale = options.quality === 'draft' ? Math.min(SCALE[options.size], 0.5) : SCALE[options.size];
  if (options.format === 'png') {
    const total = computeProjectDuration(project);
    return { kind: 'still', frame: Math.max(0, Math.min(total - 1, options.stillFrame)), scale, extension: 'png' };
  }
  const frameRange = exportFrameRange(project, options.range);
  switch (options.format) {
    case 'mp4':
      return { kind: 'video', codec: 'h264', crf: CRF[options.quality], scale, frameRange, everyNthFrame: 1, extension: 'mp4' };
    case 'webm':
      return { kind: 'video', codec: 'vp8', crf: CRF[options.quality] - 4, scale, frameRange, everyNthFrame: 1, extension: 'webm' };
    case 'gif':
      // GIF : petit (au plus la moitié de la taille), une image sur deux.
      return { kind: 'video', codec: 'gif', crf: null, scale: Math.min(scale, 0.5), frameRange, everyNthFrame: 2, extension: 'gif' };
  }
};

/** Durée de la partie exportée en secondes (pour prévenir des GIF trop longs). */
export const exportedSeconds = (project: Project, options: ExportOptions) => {
  const range = exportFrameRange(project, options.range);
  const frames = range ? range[1] - range[0] + 1 : computeProjectDuration(project);
  return frames / project.format.fps;
};
