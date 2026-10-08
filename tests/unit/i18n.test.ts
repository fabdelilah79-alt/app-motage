import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import ar from '../../src/editor/i18n/ar.json';
import en from '../../src/editor/i18n/en.json';
import fr from '../../src/editor/i18n/fr.json';
import { PRESET_LIST } from '../../src/video/animations/registry';
import { SIMULATIONS } from '../../src/shared/simulations/registry';
import { DIAGRAM_LIST } from '../../src/video/science/diagrams/registry';

const flatKeys = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([key, child]) =>
        flatKeys(child, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix];

const valueAt = (tree: unknown, key: string): unknown =>
  key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        typeof node === 'object' && node !== null
          ? (node as Record<string, unknown>)[part]
          : undefined,
      tree,
    );

const listFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });

const NAMESPACES = Object.keys(fr).join('|');
const KEY_LITERAL = new RegExp(`['"\`]((?:${NAMESPACES})\\.[A-Za-z0-9_.-]+)['"\`]`, 'g');

// Clés construites dynamiquement dans le code (ex. t(`langs.${lang}`)).
const DYNAMIC_KEYS = [
  ...['fr', 'ar', 'en'].flatMap((lang) => [
    `langs.${lang}`,
    `uiLangs.${lang}`,
    `library.addText.${lang}`,
  ]),
  ...['landscape', 'portrait', 'square'].map((id) => `formats.${id}`),
  ...['bundling', 'rendering', 'done', 'error', 'cancelled'].map((s) => `export.status.${s}`),
  ...['saved', 'pending', 'saving', 'error'].map((s) => `topBar.save.${s}`),
  ...['none', 'fade', 'slide'].map((type) => `scene.transitions.${type}`),
  ...['from-left', 'from-right', 'from-top', 'from-bottom'].map((d) => `scene.directions.${d}`),
  ...['enter', 'emphasis', 'motion', 'exit'].map((c) => `animation.categories.${c}`),
  ...['smooth', 'snappy', 'bounce', 'elastic', 'linear', 'slow'].map((e) => `animation.easings.${e}`),
  ...['zoom', 'pan', 'travelling', 'reset'].map((kind) => `camera.kinds.${kind}`),
  ...['x', 'y', 'scale', 'rotation', 'opacity', 'color'].map((p) => `keyframes.properties.${p}`),
  ...['wipe', 'zoom', 'flip', 'clockWipe', 'iris'].map((type) => `scene.transitions.${type}`),
  'animation.enter',
  'animation.exit',
  'elementTypes.text',
  'elementTypes.image',
  ...['x', 'y', 'width', 'height'].map((key) => `fields.${key}`),
  ...['modern', 'classic', 'display', 'handwritten', 'mono'].map((c) => `fontCategories.${c}`),
  ...['stroke', 'shadow', 'glow', 'gradient', 'background', 'highlight', 'underline'].map(
    (key) => `effects.${key}`,
  ),
  ...['band', 'pill', 'card'].map((kind) => `effects.kinds.${kind}`),
  ...['video', 'gif', 'lottie', 'icon', 'shape'].map((type) => `elementTypes.${type}`),
  ...['contain', 'cover'].map((fit) => `media.fits.${fit}`),
  ...['none', 'rounded', 'circle'].map((mask) => `media.masks.${mask}`),
  ...['top', 'right', 'bottom', 'left'].map((side) => `media.crop.${side}`),
  ...['rectangle', 'circle', 'polygon', 'star', 'line', 'arrow', 'curvedArrow', 'bubble'].map(
    (shape) => `shapes.kinds.${shape}`,
  ),
  ...['whoosh', 'pop', 'click', 'ding'].map((sfx) => `sfx.${sfx}`),
  ...['background', 'surface', 'text', 'muted', 'accent1', 'accent2', 'accent3', 'grid'].map(
    (token) => `themes.tokens.${token}`,
  ),
  ...['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((c) => `brand.corners.${c}`),
  ...['saved', 'applied', 'missing', 'error'].map((status) => `brand.status.${status}`),
  ...['theme', 'color', 'linear-gradient', 'texture', 'particles', 'image', 'video'].map(
    (type) => `background.types.${type}`,
  ),
  ...['paper', 'slate', 'grid', 'lined', 'dots', 'blueprint'].map((x) => `background.textures.${x}`),
  ...['iso', 'front', 'side', 'top'].map((view) => `three.views.${view}`),
  ...['show', 'grid', 'labels'].map((flag) => `three.axesFlags.${flag}`),
  ...['xLabel', 'yLabel', 'zLabel'].map((name) => `three.axisNames.${name}`),
  ...['surface', 'curve', 'vectorField', 'solid', 'arrow', 'label'].map((k) => `three.kinds.${k}`),
  ...['sphere', 'cube', 'cylinder', 'cone', 'plane'].map((shape) => `three.shapes.${shape}`),
  ...['matte', 'glossy', 'wireframe', 'translucent'].map((m) => `three.materials.${m}`),
  ...['empty', 'surface', 'helix', 'field', 'solids'].map((id) => `three.presets.${id}`),
  ...['mechanics', 'waves', 'electricity', 'optics', 'misc'].map((c) => `simulation.categories.${c}`),
  ...['right', 'below'].map((position) => `simulation.positions.${position}`),
  ...['mp4', 'webm', 'gif', 'png'].map((format) => `exportSettings.formats.${format}`),
  ...['draft', 'standard', 'high'].map((quality) => `exportSettings.qualities.${quality}`),
  ...['all', 'scene', 'interval'].map((range) => `exportSettings.ranges.${range}`),
  ...['download', 'decode', 'transcribe'].map((stage) => `subtitles.stages.${stage}`),
  ...['library', 'canvas', 'properties', 'timeline', 'theme', 'export'].flatMap((step) => [
    `tour.steps.${step}.title`,
    `tour.steps.${step}.text`,
  ]),
  ...['left', 'centerX', 'right', 'top', 'centerY', 'bottom'].map((a) => `align.${a}`),
  'subtitles.unsupported',
  'subtitles.failed',
  ...['math', 'plot2d', 'chart', 'vector', 'dimension', 'diagram', 'callout', 'scene3d', 'simulation'].map(
    (type) => `elementTypes.${type}`,
  ),
  ...['xMin', 'xMax', 'yMin', 'yMax', 'xStep', 'yStep'].map((key) => `science.bounds.${key}`),
  ...['function', 'parametric', 'polar', 'data'].map((kind) => `science.seriesKinds.${kind}`),
  ...['none', 'linear', 'affine', 'quadratic', 'exponential'].map((fit) => `science.fits.${fit}`),
  ...['movingPoint', 'area', 'asymptote', 'point', 'annotation'].map(
    (kind) => `science.decorationKinds.${kind}`,
  ),
  ...['mechanics', 'electricity', 'optics', 'misc'].map((c) => `science.diagramCategories.${c}`),
  ...['structures', 'calculus', 'greek', 'operators', 'units', 'arrows'].map(
    (group) => `science.symbolGroups.${group}`,
  ),
];

/** Réglages et options des préréglages d'animation (métadonnées du registre). */
const presetKeys = PRESET_LIST.flatMap((item) =>
  (item.paramFields ?? []).flatMap((field) => [
    `animation.params.${field.key}`,
    ...(field.kind === 'select' ? field.options.map((option) => `animation.options.${option}`) : []),
  ]),
);
DYNAMIC_KEYS.push(...presetKeys);

/** Vecteurs proposés par les simulations. */
DYNAMIC_KEYS.push(...SIMULATIONS.flatMap((model) => model.vectors.map((v) => `simulation.vectors.${v}`)));

/** Réglages des schémas de la bibliothèque. */
DYNAMIC_KEYS.push(
  ...DIAGRAM_LIST.flatMap((diagram) =>
    diagram.params.flatMap((field) => [
      `science.diagramParams.${field.key}`,
      ...(field.kind === 'select'
        ? field.options.map((option) => `science.diagramOptions.${option}`)
        : []),
    ]),
  ),
);

describe('traductions de l’interface', () => {
  const frKeys = flatKeys(fr).sort();

  it('ont exactement les mêmes clés en fr, ar et en', () => {
    expect(flatKeys(ar).sort()).toEqual(frKeys);
    expect(flatKeys(en).sort()).toEqual(frKeys);
  });

  it('ne contiennent aucun texte vide', () => {
    for (const translations of [fr, ar, en]) {
      const texts = flatKeys(translations).map((key) => valueAt(translations, key));
      expect(texts.every((text) => typeof text === 'string' && text.trim() !== '')).toBe(true);
    }
  });

  it('définissent toutes les clés utilisées dans le code de l’éditeur', () => {
    const editorDir = path.resolve(process.cwd(), 'src/editor');
    const sources = listFiles(editorDir).filter((file) => /\.tsx?$/.test(file));
    const used = new Set(DYNAMIC_KEYS);
    for (const file of sources) {
      for (const match of readFileSync(file, 'utf8').matchAll(KEY_LITERAL)) {
        if (match[1]) used.add(match[1]);
      }
    }
    // Une clé peut aussi être un préfixe de groupe (ex. « media.fits », complété dans le code).
    const missing = [...used].filter(
      (key) => !frKeys.includes(key) && !frKeys.some((known) => known.startsWith(`${key}.`)),
    );
    expect(missing).toEqual([]);
  });
});
