import Moveable, { type MoveableRefObject } from 'react-moveable';
import type { ProjectFormat, Transform } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { beginInteraction, endInteraction } from '../store/history';

type Props = {
  target: HTMLElement;
  elementId: string;
  scale: number;
  format: ProjectFormat;
  /** Autres éléments de la scène, utilisés comme guides magnétiques. */
  guides: MoveableRefObject<HTMLElement>[];
};

const ALL_DIRECTIONS = {
  top: true,
  left: true,
  bottom: true,
  right: true,
  center: true,
  middle: true,
};

/** Poignées : déplacer, redimensionner, pivoter (une seule étape d'annulation par geste). */
export const ElementMoveable = ({ target, elementId, scale, format, guides }: Props) => {
  const updateElement = useEditorStore((state) => state.updateElement);
  const toUnits = (pixels: number) => Math.round(pixels / scale);
  const update = (patch: Partial<Transform>) =>
    updateElement(elementId, (element) => {
      Object.assign(element.transform, patch);
    });
  const width = format.width * scale;
  const height = format.height * scale;

  return (
    <Moveable
      target={target}
      draggable
      resizable
      rotatable
      snappable
      origin={false}
      useResizeObserver
      useMutationObserver
      throttleDrag={0}
      throttleResize={0}
      throttleRotate={1}
      snapThreshold={6}
      snapDirections={ALL_DIRECTIONS}
      elementSnapDirections={ALL_DIRECTIONS}
      verticalGuidelines={[0, width / 2, width]}
      horizontalGuidelines={[0, height / 2, height]}
      elementGuidelines={guides}
      onDragStart={beginInteraction}
      onDrag={(event) => {
        event.target.style.left = `${event.left}px`;
        event.target.style.top = `${event.top}px`;
        update({ x: toUnits(event.left), y: toUnits(event.top) });
      }}
      onDragEnd={endInteraction}
      onResizeStart={beginInteraction}
      onResize={(event) => {
        const { left, top } = event.drag;
        Object.assign(event.target.style, {
          width: `${event.width}px`,
          height: `${event.height}px`,
          left: `${left}px`,
          top: `${top}px`,
        });
        update({
          x: toUnits(left),
          y: toUnits(top),
          width: Math.max(1, toUnits(event.width)),
          height: Math.max(1, toUnits(event.height)),
        });
      }}
      onResizeEnd={endInteraction}
      onRotateStart={beginInteraction}
      onRotate={(event) => {
        event.target.style.transform = event.transform;
        update({ rotation: Math.round(event.rotation) });
      }}
      onRotateEnd={endInteraction}
    />
  );
};
