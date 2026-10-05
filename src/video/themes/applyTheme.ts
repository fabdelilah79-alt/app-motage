import { resolveColor, type Theme } from './themes';

/**
 * Remplace, partout dans une valeur (scènes, éléments, réglages d'animation), les références
 * « theme.accent1 »… par la couleur réelle du thème. Fonction pure : la valeur d'origine
 * n'est pas modifiée. Les objets inchangés sont conservés tels quels.
 */
export const applyThemeColors = <T>(value: T, theme: Theme): T => resolveDeep(value, theme) as T;

const resolveDeep = (value: unknown, theme: Theme): unknown => {
  if (typeof value === 'string') {
    return resolveColor(value, theme);
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item: unknown) => {
      const resolved = resolveDeep(item, theme);
      if (resolved !== item) changed = true;
      return resolved;
    });
    return changed ? next : value;
  }
  if (value !== null && typeof value === 'object') {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const resolved = resolveDeep(item, theme);
      if (resolved !== item) changed = true;
      next[key] = resolved;
    }
    return changed ? next : value;
  }
  return value;
};
