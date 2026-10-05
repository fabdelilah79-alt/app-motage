import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createBrandStore } from '../../server/brand/brandStore';
import { createProjectStore } from '../../server/projects/projectStore';
import { usedAssetIds } from '../../src/shared/assets';
import { createBrandScene } from '../../src/shared/brandScenes';
import { parseProject, sceneSchema } from '../../src/shared/schema';
import { logoPosition } from '../../src/video/brand/BrandLogo';
import { makeProjectInput } from './fixtures';

let counter = 0;
const newId = () => `id${String(++counter).padStart(4, '0')}`;
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');

describe('kit de marque', () => {
  let dir = '';
  beforeAll(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'physimotion-brand-'));
  });
  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('place le logo dans le coin choisi', () => {
    expect(logoPosition('top-right', 40)).toEqual({ position: 'absolute', top: 40, right: 40 });
    expect(logoPosition('bottom-left', 10)).toEqual({ position: 'absolute', bottom: 10, left: 10 });
  });

  it('crée des scènes d’introduction et de conclusion valides', () => {
    const project = parseProject(
      makeProjectInput({
        title: 'La gravitation',
        assets: [{ id: 'logo', kind: 'image', storage: 'public', src: 'demo/chute-libre.svg' }],
        brand: { logoAssetId: 'logo' },
      }),
    );
    const intro = createBrandScene(project, 'intro', newId);
    expect(sceneSchema.parse(intro)).toEqual(intro);
    expect(intro.elements.map((element) => element.type)).toEqual(['image', 'text']);
    const text = intro.elements[1];
    const run = text?.type === 'text' ? text.content[0] : undefined;
    expect(run?.kind === 'text' ? run.text : '').toBe('La gravitation');
    const outro = createBrandScene({ ...project, brand: undefined }, 'outro', newId);
    expect(outro.elements.map((element) => element.type)).toEqual(['text']);
  });

  it('enregistre le kit d’un projet et le réutilise dans un autre', async () => {
    const projects = createProjectStore(path.join(dir, 'projets'), newId);
    const brands = createBrandStore(path.join(dir, 'marque'), projects);
    expect(await brands.get()).toBeNull();
    expect(await brands.applyToProject('inexistant')).toBeNull();

    const input = { formatId: 'landscape' as const, defaultLang: 'fr' as const };
    const first = await projects.create({ title: 'Premier', ...input });
    const logo = await projects.addAsset(first.id, 'logo.svg', 'image/svg+xml', svg);
    const brand = { logoAssetId: logo.id, logoCorner: 'bottom-left' as const, logoSize: 0.2 };
    const kit = await brands.saveFromProject(first.id, { ...brand, colors: ['#ff0000'] });
    expect(kit).toMatchObject({ logoCorner: 'bottom-left', colors: ['#ff0000'] });
    expect(kit.logo?.file).toBe('logo.svg');

    const second = await projects.create({ title: 'Second', ...input });
    const applied = await brands.applyToProject(second.id);
    expect(applied?.asset?.kind).toBe('image');
    expect(applied?.brand).toEqual({
      logoAssetId: applied?.asset?.id,
      logoCorner: 'bottom-left',
      logoSize: 0.2,
      colors: ['#ff0000'],
    });
  });
});

describe('médias utilisés par les fonds et le logo', () => {
  it('ne considère pas une image de fond ni le logo comme inutilisés', () => {
    const project = parseProject(
      makeProjectInput({
        assets: [
          { id: 'fond', kind: 'image', src: 'a.png' },
          { id: 'logo', kind: 'image', src: 'b.png' },
          { id: 'libre', kind: 'image', src: 'c.png' },
        ],
        brand: { logoAssetId: 'logo' },
        scenes: [{ id: 's', durationInFrames: 30, background: { type: 'image', assetId: 'fond' } }],
      }),
    );
    expect([...usedAssetIds(project)].sort()).toEqual(['fond', 'logo']);
  });
});
