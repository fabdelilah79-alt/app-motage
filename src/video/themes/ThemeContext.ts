import { createContext, useContext } from 'react';
import { DEFAULT_THEME_ID, resolveTheme, type Theme } from './themes';

/** Thème du projet en cours, accessible à tous les éléments de la vidéo. */
export const ThemeContext = createContext<Theme>(resolveTheme(DEFAULT_THEME_ID));

export const useTheme = (): Theme => useContext(ThemeContext);
