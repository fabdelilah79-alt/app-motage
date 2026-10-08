import { describe, expect, it } from 'vitest';
import { exportOptionsSchema, exportedSeconds, exportFrameRange, renderSettings } from '../../src/shared/exportOptions';
import { estimateRemainingSeconds } from '../../src/shared/render';
import { parseProject } from '../../src/shared/schema';
import { buildOutputFileName } from '../../server/render/outputFileName';
import { srtPathFor } from '../../server/render/renderProject';
import { makeProjectInput } from './fixtures';

const project = parseProject(
  makeProjectInput({
    scenes: [
      { id: 'a', durationInFrames: 90 },
      { id: 'b', durationInFrames: 120, transitionIn: { type: 'fade', durationInFrames: 30 } },
      { id: 'c', durationInFrames: 60 },
    ],
  }),
);
const options = (input: object) => exportOptionsSchema.parse(input);

describe('options d’export', () => {
  it('MP4 par défaut : H.264, qualité standard, toute la vidéo', () => {
    expect(renderSettings(project, options({}))).toEqual({
      kind: 'video',
      codec: 'h264',
      crf: 23,
      scale: 1,
      frameRange: null,
      everyNthFrame: 1,
      extension: 'mp4',
    });
  });

  it('WebM, GIF léger, brouillon en demi-taille, 4K', () => {
    expect(renderSettings(project, options({ format: 'webm', quality: 'high' }))).toMatchObject({ codec: 'vp8', crf: 13, extension: 'webm' });
    expect(renderSettings(project, options({ format: 'gif' }))).toMatchObject({ codec: 'gif', crf: null, scale: 0.5, everyNthFrame: 2 });
    expect(renderSettings(project, options({ quality: 'draft' }))).toMatchObject({ scale: 0.5, crf: 32 });
    expect(renderSettings(project, options({ size: 'double' }))).toMatchObject({ scale: 2 });
  });

  it('miniature PNG à un instant (bornée à la durée)', () => {
    expect(renderSettings(project, options({ format: 'png', stillFrame: 45 }))).toEqual({ kind: 'still', frame: 45, scale: 1, extension: 'png' });
    expect(renderSettings(project, options({ format: 'png', stillFrame: 9999 }))).toMatchObject({ frame: 239 });
  });

  it('une seule scène (transitions comprises) ou un intervalle', () => {
    // Durée totale : 90 + 120 − 30 + 60 = 240 ; la scène b commence à 60.
    expect(exportFrameRange(project, { kind: 'scene', sceneId: 'b' })).toEqual([60, 179]);
    expect(exportFrameRange(project, { kind: 'scene', sceneId: 'c' })).toEqual([180, 239]);
    expect(exportFrameRange(project, { kind: 'interval', from: 200, to: 50 })).toEqual([50, 200]);
    expect(exportFrameRange(project, { kind: 'interval', from: 100, to: 5000 })).toEqual([100, 239]);
    expect(exportFrameRange(project, { kind: 'scene', sceneId: 'inconnue' })).toBeNull();
    expect(exportedSeconds(project, options({ range: { kind: 'scene', sceneId: 'b' } }))).toBe(4);
  });

  it('noms des fichiers exportés', () => {
    const date = new Date(2026, 9, 8, 9, 5, 0);
    expect(buildOutputFileName('Énergie', date, 'gif')).toBe('energie_2026-10-08_09-05-00.gif');
    expect(srtPathFor('/exports/energie_2026.mp4')).toBe('/exports/energie_2026.srt');
  });

  it('temps restant estimé', () => {
    expect(estimateRemainingSeconds(0.5, 0, 60_000)).toBe(60);
    expect(estimateRemainingSeconds(0.25, 0, 30_000)).toBe(90);
    expect(estimateRemainingSeconds(0.01, 0, 1000)).toBeNull();
    expect(estimateRemainingSeconds(0.5, null, 1000)).toBeNull();
  });
});
