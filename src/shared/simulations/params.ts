import type { SimParam } from './types';

/** Valeur d'un paramètre : celle du projet (bornée), sinon la valeur par défaut. */
export const paramValue = (
  fields: readonly SimParam[],
  params: Readonly<Record<string, number>>,
  key: string,
): number => {
  const field = fields.find((item) => item.key === key);
  const raw = params[key];
  if (!field) return raw ?? 0;
  const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : field.default;
  return Math.min(field.max, Math.max(field.min, value));
};

/** Lecteur des paramètres d'un modèle. */
export const reader = (fields: readonly SimParam[], params: Readonly<Record<string, number>>) =>
  (key: string) => paramValue(fields, params, key);

/** Valeurs par défaut de tous les paramètres. */
export const defaultParams = (fields: readonly SimParam[]): Record<string, number> =>
  Object.fromEntries(fields.map((field) => [field.key, field.default]));

const DEG = Math.PI / 180;
export const toRadians = (degrees: number) => degrees * DEG;
export const toDegrees = (radians: number) => radians / DEG;

/** Champ de pesanteur commun (m/s²). */
export const gravityParam = (fallback = 9.81): SimParam => ({
  key: 'g',
  symbol: 'g',
  unit: 'm/s²',
  min: 0.1,
  max: 30,
  step: 0.01,
  default: fallback,
  name: { fr: 'Pesanteur', ar: 'شدة الثقالة', en: 'Gravity' },
});

export const massParam = (fallback = 1): SimParam => ({
  key: 'm',
  symbol: 'm',
  unit: 'kg',
  min: 0.01,
  max: 100,
  step: 0.1,
  default: fallback,
  name: { fr: 'Masse', ar: 'الكتلة', en: 'Mass' },
});
