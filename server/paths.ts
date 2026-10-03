import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Racine du dépôt (contient package.json, public/, src/, templates/). */
export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Données de l'utilisateur : ~/PhysiMotion/projets et ~/PhysiMotion/exports. */
export const DATA_DIR = path.join(os.homedir(), 'PhysiMotion');
export const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
