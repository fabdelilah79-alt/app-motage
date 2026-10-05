import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { brandSchema, type Asset, type Brand } from '../../src/shared/schema';
import { contentTypeFor } from '../projects/fileNames';
import type { ProjectStore } from '../projects/projectStore';

/** Kit de marque enregistré une fois pour toutes (réutilisable dans tous les projets). */
export const brandKitSchema = z.object({
  logoCorner: brandSchema.shape.logoCorner,
  logoSize: brandSchema.shape.logoSize,
  colors: z.array(z.string()).default([]),
  logo: z.object({ file: z.string().min(1), name: z.string() }).optional(),
});
export type BrandKit = z.infer<typeof brandKitSchema>;

const KIT_FILE = 'brand.json';

/** Le kit est rangé dans <données>/marque : brand.json + le fichier du logo. */
export const createBrandStore = (brandDir: string, projects: ProjectStore) => {
  const get = async (): Promise<BrandKit | null> => {
    try {
      const raw = await readFile(path.join(brandDir, KIT_FILE), 'utf8');
      return brandKitSchema.parse(JSON.parse(raw));
    } catch {
      return null;
    }
  };

  /** Enregistre le kit d'un projet (copie du logo comprise) comme kit par défaut. */
  const saveFromProject = async (projectId: string, brand: Brand): Promise<BrandKit> => {
    const project = await projects.read(projectId);
    await mkdir(brandDir, { recursive: true });
    const logoAsset = project.assets.find((asset) => asset.id === brand.logoAssetId);
    let logo: BrandKit['logo'];
    if (logoAsset && logoAsset.storage === 'project') {
      const source = projects.resolveFile(projectId, logoAsset.src);
      if (source) {
        const file = `logo${path.extname(source).toLowerCase()}`;
        await copyFile(source, path.join(brandDir, file));
        logo = { file, name: logoAsset.name || file };
      }
    }
    const kit: BrandKit = {
      logoCorner: brand.logoCorner,
      logoSize: brand.logoSize,
      colors: brand.colors,
      logo,
    };
    await writeFile(path.join(brandDir, KIT_FILE), `${JSON.stringify(kit, null, 2)}\n`);
    return kit;
  };

  /** Copie le kit dans un projet : le logo devient un média du projet. */
  const applyToProject = async (
    projectId: string,
  ): Promise<{ brand: Brand; asset: Asset | null } | null> => {
    const kit = await get();
    if (!kit) return null;
    let asset: Asset | null = null;
    if (kit.logo) {
      const data = await readFile(path.join(brandDir, kit.logo.file));
      asset = await projects.addAsset(projectId, kit.logo.name, contentTypeFor(kit.logo.file), data);
    }
    const brand = brandSchema.parse({
      logoCorner: kit.logoCorner,
      logoSize: kit.logoSize,
      colors: kit.colors,
      logoAssetId: asset?.id,
    });
    return { brand, asset };
  };

  return { get, saveFromProject, applyToProject };
};

export type BrandStore = ReturnType<typeof createBrandStore>;
