import { slugify } from '../render/outputFileName';

/** Identifiant de projet sûr pour un nom de dossier (lettres, chiffres, tirets). */
export const PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,80}$/;

export const IMAGE_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  json: 'application/json',
};

export const contentTypeFor = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return CONTENT_TYPES[extension] ?? 'application/octet-stream';
};

export const newProjectId = (title: string, suffix: string): string =>
  `${slugify(title).slice(0, 40) || 'projet'}-${suffix}`;

/** Nom de fichier unique et sûr pour un média importé, ex. « a1b2c3d4-schema.png ». */
export const assetFileName = (originalName: string, extension: string, suffix: string): string => {
  const base = slugify(originalName.replace(/\.[^.]+$/, '')).slice(0, 40) || 'image';
  return `${suffix}-${base}.${extension}`;
};
