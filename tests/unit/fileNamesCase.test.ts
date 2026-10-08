import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const listFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });

/** Sans extension et en minuscules : deux fichiers identiques ainsi se confondent sous Windows. */
const key = (file: string) => file.replace(/\.[^./\\]+$/, '').toLowerCase();

describe('noms de fichiers compatibles Windows et macOS', () => {
  it('aucun fichier ne diffère d’un autre seulement par les majuscules', () => {
    const files = ['src', 'server', 'tests'].flatMap((dir) => listFiles(path.resolve(dir)));
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const file of files) {
      const other = seen.get(key(file));
      if (other) clashes.push(`${other} ↔ ${file}`);
      seen.set(key(file), file);
    }
    expect(clashes).toEqual([]);
  });
});
