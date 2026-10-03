import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Racine du dépôt (contient package.json, public/, src/, templates/). */
export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Données de l'utilisateur : ~/PhysiMotion/projets et ~/PhysiMotion/exports.
 * La variable PHYSIMOTION_DATA_DIR permet d'utiliser un autre dossier (tests e2e).
 */
const customDataDir = process.env.PHYSIMOTION_DATA_DIR;
export const DATA_DIR = customDataDir
  ? path.resolve(ROOT_DIR, customDataDir)
  : path.join(os.homedir(), 'PhysiMotion');
export const PROJECTS_DIR = path.join(DATA_DIR, 'projets');
export const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
