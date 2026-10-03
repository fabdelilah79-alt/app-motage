import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import ar from '../../src/editor/i18n/ar.json';
import en from '../../src/editor/i18n/en.json';
import fr from '../../src/editor/i18n/fr.json';

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
  ...['left', 'right', 'top', 'bottom'].map((side) => `animation.sides.${side}`),
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
];

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
    const missing = [...used].filter((key) => !frKeys.includes(key));
    expect(missing).toEqual([]);
  });
});
