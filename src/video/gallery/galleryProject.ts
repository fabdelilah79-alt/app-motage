import { parseProject, type Project, type SceneInput } from '../../shared/schema';
import { PRESET_LIST } from '../animations/registry';
import type { AnimationCategory, AnimationPreset } from '../animations/types';
import { sampleElement } from './sampleElement';

const COLUMNS = 3;
const ROWS = 3;
const TILE_WIDTH = 640;
const TILE_HEIGHT = 330;
const SCENE_DURATION = 120;

const CATEGORY_TITLES: Record<AnimationCategory, string> = {
  enter: 'Apparitions',
  emphasis: 'Mises en valeur',
  motion: 'Mouvements',
  exit: 'Disparitions',
};

const tileScene = (category: AnimationCategory, presets: readonly AnimationPreset[], page: number) => {
  const elements = presets.flatMap((preset, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const left = column * TILE_WIDTH;
    const top = 60 + row * TILE_HEIGHT;
    const box = { x: left + 200, y: top + 50, width: 240, height: 140 };
    return [
      sampleElement(preset, `${preset.id}-exemple`, box, SCENE_DURATION),
      {
        id: `${preset.id}-nom`,
        type: 'text' as const,
        lang: 'fr' as const,
        transform: { x: left + 20, y: top + 230, width: TILE_WIDTH - 40, height: 70 },
        timing: { from: 0, duration: SCENE_DURATION },
        content: [{ kind: 'text' as const, text: `${preset.name.fr} — ${preset.id}` }],
        style: { fontSize: 30, color: '#334155', align: 'center' as const },
      },
    ];
  });
  const scene: SceneInput = {
    id: `galerie-${category}-${page}`,
    name: `${CATEGORY_TITLES[category]} (${page + 1})`,
    durationInFrames: SCENE_DURATION,
    background: { type: 'color', color: '#ffffff' },
    transitionIn: { type: 'fade', durationInFrames: 10 },
    elements: [
      {
        id: `titre-${category}-${page}`,
        type: 'text',
        lang: 'fr',
        transform: { x: 40, y: 0, width: 1840, height: 60 },
        timing: { from: 0, duration: SCENE_DURATION },
        content: [{ kind: 'text', text: `${CATEGORY_TITLES[category]} (${page + 1})` }],
        style: { fontSize: 40, fontWeight: 700, color: '#0f172a', align: 'center' },
      },
      ...elements,
    ],
  };
  return scene;
};

/** Vidéo « galerie » : toutes les animations du registre, 9 par scène, avec leur nom. */
export const galleryProject = (): Project => {
  const scenes: SceneInput[] = [];
  for (const category of ['enter', 'emphasis', 'motion', 'exit'] as const) {
    const presets = PRESET_LIST.filter((preset) => preset.category === category);
    for (let page = 0; page * COLUMNS * ROWS < presets.length; page++) {
      const slice = presets.slice(page * COLUMNS * ROWS, (page + 1) * COLUMNS * ROWS);
      scenes.push(tileScene(category, slice, page));
    }
  }
  return parseProject({
    schemaVersion: 1,
    id: 'galerie-animations',
    title: 'Galerie des animations',
    format: { width: 1920, height: 1080, fps: 30 },
    defaultLang: 'fr',
    scenes,
  });
};
