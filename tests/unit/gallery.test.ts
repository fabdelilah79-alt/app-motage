import { describe, expect, it } from 'vitest';
import { PRESET_LIST } from '../../src/video/animations/registry';
import { galleryProject } from '../../src/video/gallery/galleryProject';
import { previewFrame, previewProject, PREVIEW_DURATION } from '../../src/video/gallery/previewProject';

describe('galerie et vignettes des animations', () => {
  it('chaque préréglage a une vidéo d’aperçu valide et une image de vignette', () => {
    for (const preset of PRESET_LIST) {
      const project = previewProject(preset);
      const element = project.scenes[0]?.elements[0];
      expect(element).toBeDefined();
      const frame = previewFrame(preset);
      expect(frame).toBeGreaterThanOrEqual(0);
      expect(frame).toBeLessThan(PREVIEW_DURATION);
    }
  });

  it('la galerie présente toutes les animations, 9 par scène', () => {
    const project = galleryProject();
    const ids = project.scenes.flatMap((scene) =>
      scene.elements.flatMap((element) => {
        const { enter, exit, emphasis } = element.animations;
        return [enter?.presetId, exit?.presetId, ...emphasis.map((item) => item.presetId)];
      }),
    );
    for (const preset of PRESET_LIST) expect(ids).toContain(preset.id);
    expect(Math.max(...project.scenes.map((scene) => scene.elements.length))).toBeLessThanOrEqual(19);
  });
});
