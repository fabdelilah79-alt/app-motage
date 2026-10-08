import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

/** Commande qui ouvre un dossier dans l'explorateur de fichiers du système. */
export const openCommand = (platform: NodeJS.Platform): string =>
  platform === 'win32' ? 'explorer' : platform === 'darwin' ? 'open' : 'xdg-open';

/** Ouvre le dossier (créé au besoin) sans bloquer le serveur ; une erreur est ignorée. */
export const openInFileExplorer = (dir: string) => {
  try {
    mkdirSync(dir, { recursive: true });
    const child = spawn(openCommand(process.platform), [dir], { detached: true, stdio: 'ignore' });
    child.on('error', () => undefined);
    child.unref();
  } catch {
    // Pas d'explorateur disponible (serveur sans écran) : rien à faire.
  }
};
