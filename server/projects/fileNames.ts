import type { AssetKind } from '../../src/shared/schema';
import { slugify } from '../render/outputFileName';

/** Identifiant de projet sûr pour un nom de dossier (lettres, chiffres, tirets). */
export const PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,80}$/;

/** Types de fichiers acceptés à l'import : extension enregistrée et type de média. */
export const MEDIA_TYPES: Readonly<Record<string, { extension: string; kind: AssetKind }>> = {
  'image/png': { extension: 'png', kind: 'image' },
  'image/jpeg': { extension: 'jpg', kind: 'image' },
  'image/webp': { extension: 'webp', kind: 'image' },
  'image/svg+xml': { extension: 'svg', kind: 'image' },
  'image/gif': { extension: 'gif', kind: 'gif' },
  'video/mp4': { extension: 'mp4', kind: 'video' },
  'video/webm': { extension: 'webm', kind: 'video' },
  'video/quicktime': { extension: 'mov', kind: 'video' },
  'audio/mpeg': { extension: 'mp3', kind: 'audio' },
  'audio/wav': { extension: 'wav', kind: 'audio' },
  'audio/x-wav': { extension: 'wav', kind: 'audio' },
  'audio/wave': { extension: 'wav', kind: 'audio' },
  'audio/mp4': { extension: 'm4a', kind: 'audio' },
  'audio/x-m4a': { extension: 'm4a', kind: 'audio' },
  'audio/ogg': { extension: 'ogg', kind: 'audio' },
  'audio/webm': { extension: 'webm', kind: 'audio' },
  // Animation Lottie : type propre à l'application (le JSON des requêtes reste réservé à l'API).
  'application/x-lottie+json': { extension: 'json', kind: 'lottie' },
};

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  json: 'application/json',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
};

export const contentTypeFor = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return CONTENT_TYPES[extension] ?? 'application/octet-stream';
};

export const newProjectId = (title: string, suffix: string): string =>
  `${slugify(title).slice(0, 40) || 'projet'}-${suffix}`;

/** Nom de fichier unique et sûr pour un média importé, ex. « a1b2c3d4-schema.png ». */
export const assetFileName = (originalName: string, extension: string, suffix: string): string => {
  const base = slugify(originalName.replace(/\.[^.]+$/, '')).slice(0, 40) || 'media';
  return `${suffix}-${base}.${extension}`;
};

/** Plage d'octets demandée (en-tête HTTP « Range: bytes=début-fin »), bornée à la taille. */
export const parseRange = (header: string | undefined, size: number) => {
  const match = header ? /^bytes=(\d*)-(\d*)$/.exec(header.trim()) : null;
  if (!match || size === 0) return null;
  const [, startText = '', endText = ''] = match;
  if (startText === '' && endText === '') return null;
  // « bytes=-500 » : les 500 derniers octets.
  const start = startText === '' ? Math.max(0, size - Number(endText)) : Number(startText);
  const end = startText === '' || endText === '' ? size - 1 : Math.min(Number(endText), size - 1);
  return start <= end && start < size ? { start, end } : null;
};
