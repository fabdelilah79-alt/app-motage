import { parseProject, type Project } from '../../shared/schema';

const FORMAT = { width: 480, height: 270, fps: 30 } as const;

/**
 * Petite scène d'exemple d'un thème (vignette du choix de thème) : titre arabe et latin,
 * une forme et une icône, toutes en couleurs du thème.
 */
export const themePreviewProject = (
  themeId: string,
  overrides: Record<string, string> = {},
): Project =>
  parseProject({
    schemaVersion: 1,
    id: `theme-${themeId}`,
    title: themeId,
    format: FORMAT,
    defaultLang: 'fr',
    themeId,
    themeOverrides: overrides,
    scenes: [
      {
        id: 'apercu',
        durationInFrames: 30,
        background: { type: 'theme' },
        elements: [
          {
            id: 'titre-ar',
            type: 'text',
            lang: 'ar',
            transform: { x: 20, y: 30, width: 440, height: 70 },
            timing: { from: 0, duration: 30 },
            animations: {},
            content: [{ kind: 'text', text: 'الطاقة الحركية' }],
            style: { fontSize: 40, fontWeight: 700, color: 'theme.text', align: 'center' },
          },
          {
            id: 'titre-fr',
            type: 'text',
            lang: 'fr',
            transform: { x: 20, y: 100, width: 440, height: 50 },
            timing: { from: 0, duration: 30 },
            animations: {},
            content: [{ kind: 'text', text: 'Énergie cinétique' }],
            style: { fontSize: 30, fontWeight: 700, color: 'theme.accent1', align: 'center' },
          },
          {
            id: 'forme',
            type: 'shape',
            shape: 'circle',
            transform: { x: 150, y: 170, width: 70, height: 70 },
            timing: { from: 0, duration: 30 },
            animations: {},
            fill: 'theme.accent2',
            stroke: 'theme.text',
            strokeWidth: 3,
          },
          {
            id: 'fleche',
            type: 'shape',
            shape: 'arrow',
            transform: { x: 240, y: 185, width: 100, height: 40 },
            timing: { from: 0, duration: 30 },
            animations: {},
            fill: 'none',
            stroke: 'theme.accent3',
            strokeWidth: 5,
          },
        ],
      },
    ],
  });
