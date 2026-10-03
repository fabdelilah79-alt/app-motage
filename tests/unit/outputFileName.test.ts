import { describe, expect, it } from 'vitest';
import { buildOutputFileName, slugify } from '../../server/render/outputFileName';

describe('nom du fichier exporté', () => {
  it('supprime accents, espaces et ponctuation', () => {
    expect(slugify('Démonstration — La chute libre')).toBe('demonstration-la-chute-libre');
  });

  it('ajoute la date et l’heure (« video » si le titre n’a aucune lettre latine)', () => {
    const date = new Date(2026, 9, 3, 14, 5, 9);
    const latin = buildOutputFileName('La chute libre', date);
    expect(latin).toBe('la-chute-libre_2026-10-03_14-05-09.mp4');
    const arabic = buildOutputFileName('السقوط الحر', date);
    expect(arabic).toBe('video_2026-10-03_14-05-09.mp4');
  });
});
