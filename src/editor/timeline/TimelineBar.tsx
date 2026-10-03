import type { PointerEvent as ReactPointerEvent } from 'react';
import type { SceneElement } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { beginInteraction, endInteraction } from '../store/history';
import { cn } from '../ui/cn';
import { dragTiming, type TimingDragMode } from './timingDrag';

type Props = {
  element: SceneElement;
  sceneDuration: number;
  pixelsPerFrame: number;
  selected: boolean;
};

/** Barre d'un élément : glisser pour déplacer, tirer un bord pour changer le début ou la fin. */
export const TimelineBar = ({ element, sceneDuration, pixelsPerFrame, selected }: Props) => {
  const updateElement = useEditorStore((state) => state.updateElement);
  const selectElement = useEditorStore((state) => state.selectElement);
  const { from, duration } = element.timing;

  const startDrag = (mode: TimingDragMode) => (event: ReactPointerEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    selectElement(element.id);
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const initial = { ...element.timing };
    beginInteraction();

    const onMove = (moveEvent: PointerEvent) => {
      const delta = Math.round((moveEvent.clientX - startX) / pixelsPerFrame);
      updateElement(element.id, (draft) => {
        draft.timing = dragTiming(mode, initial, delta, sceneDuration);
      });
    };
    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      endInteraction();
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      data-testid="timeline-bar"
      className={cn(
        'absolute top-1 bottom-1 flex cursor-grab items-stretch rounded',
        selected ? 'bg-sky-500 ring-2 ring-sky-200' : 'bg-sky-800 hover:bg-sky-700',
      )}
      style={{ left: from * pixelsPerFrame, width: Math.max(4, duration * pixelsPerFrame) }}
      onPointerDown={startDrag('move')}
    >
      <span
        className="w-1.5 cursor-ew-resize rounded-s bg-white/30 hover:bg-white/70"
        onPointerDown={startDrag('start')}
      />
      <span className="flex-1" />
      <span
        className="w-1.5 cursor-ew-resize rounded-e bg-white/30 hover:bg-white/70"
        onPointerDown={startDrag('end')}
      />
    </div>
  );
};
