import { beforeEach, describe, expect, it } from 'vitest';
import { alignElement } from '../../src/editor/panels/alignment';
import { useEditorStore } from '../../src/editor/store/editorStore';
import { parseProject } from '../../src/shared/schema';
import { layoutFrame } from '../../src/video/animations/layoutFrame';
import { makeProjectInput } from './fixtures';

const fade = (duration: number, delay = 0) => ({ presetId: 'enter.fade', duration, delay, easing: 'smooth' as const, params: {}, repeat: 1 });

describe('vue de placement du canevas', () => {
  it('montre chaque élément entièrement développé, avant sa disparition', () => {
    expect(layoutFrame({ enter: fade(15), emphasis: [] }, 150)).toBe(149);
    expect(layoutFrame({ enter: fade(15), emphasis: [], exit: fade(20, 10) }, 150)).toBe(119);
    expect(layoutFrame({ emphasis: [], exit: fade(200) }, 150)).toBe(0);
    expect(layoutFrame({ emphasis: [] }, 1)).toBe(0);
  });

  beforeEach(() => {
    useEditorStore.getState().loadProject(parseProject(makeProjectInput()));
  });

  it('revient à la vue de placement quand on sélectionne un élément ou une scène', () => {
    const store = () => useEditorStore.getState();
    store().setLayoutView(false);
    expect(store().layoutView).toBe(false);
    store().selectElement('un-element');
    expect(store().layoutView).toBe(true);
    store().setLayoutView(false);
    store().selectScene('scene-1');
    expect(store().layoutView).toBe(true);
  });
});

describe('alignement sur l’image', () => {
  const format = { width: 1920, height: 1080, fps: 30 as const };
  const transform = { x: 300, y: 200, width: 400, height: 100, rotation: 0, scale: 1, opacity: 1 };

  it('place l’élément au bord (avec une marge) ou au centre', () => {
    expect(alignElement(transform, format, 'left').x).toBe(43);
    expect(alignElement(transform, format, 'centerX').x).toBe(760);
    expect(alignElement(transform, format, 'right').x).toBe(1920 - 400 - 43);
    expect(alignElement(transform, format, 'top').y).toBe(43);
    expect(alignElement(transform, format, 'centerY').y).toBe(490);
    expect(alignElement(transform, format, 'bottom').y).toBe(1080 - 100 - 43);
    expect(alignElement(transform, format, 'centerX').y).toBe(200);
  });
});
