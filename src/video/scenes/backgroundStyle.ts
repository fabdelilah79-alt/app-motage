import type { CSSProperties } from 'react';
import type { Background } from '../../shared/schema';
import { textureStyle } from '../themes/textures';
import { DEFAULT_THEME_ID, resolveColor, resolveTheme, type Theme } from '../themes/themes';

export type BackgroundContext = {
  theme: Theme;
  /** Échelle des motifs (largeur de la vidéo / 1920). */
  unit: number;
  /** Projet en arabe : marge du cahier à droite. */
  rtl: boolean;
};

const DEFAULT_CONTEXT: BackgroundContext = {
  theme: resolveTheme(DEFAULT_THEME_ID),
  unit: 1,
  rtl: false,
};

/** Fond « theme » remplacé par le fond du thème du projet. */
export const concreteBackground = (background: Background, theme: Theme) =>
  background.type === 'theme' ? theme.background : background;

/**
 * Convertit le fond d'une scène en style CSS (fonction pure). Les particules, images et
 * vidéos sont dessinées par-dessus ce style (voir SceneBackground).
 */
export const backgroundStyle = (
  background: Background,
  context: BackgroundContext = DEFAULT_CONTEXT,
): CSSProperties => {
  const { theme } = context;
  const color = (value: string) => resolveColor(value, theme);
  const concrete = concreteBackground(background, theme);
  switch (concrete.type) {
    case 'color':
      return { backgroundColor: color(concrete.color) };
    case 'linear-gradient': {
      const stops = concrete.stops
        .map((stop) => `${color(stop.color)} ${stop.position}%`)
        .join(', ');
      return { backgroundImage: `linear-gradient(${concrete.angle}deg, ${stops})` };
    }
    case 'texture':
      return textureStyle(concrete.texture, color(concrete.color), {
        lineColor: theme.palette.grid,
        unit: context.unit,
        rtl: context.rtl,
      });
    case 'particles':
      return { backgroundColor: color(concrete.color) };
    case 'image':
    case 'video':
      return { backgroundColor: '#000000' };
  }
};
