import type { PointerEvent, Ref } from 'react';
import type { SceneElement } from '../../shared/schema';
import { cn } from '../ui/cn';

type Props = {
  element: SceneElement;
  scale: number;
  selected: boolean;
  /** Contour pointillé discret : on repère chaque élément, même transparent. */
  outlined: boolean;
  boxRef: Ref<HTMLDivElement>;
  onSelect: (elementId: string) => void;
};

/** Zone cliquable invisible posée exactement sur un élément de la vidéo. */
export const ElementBox = ({ element, scale, selected, outlined, boxRef, onSelect }: Props) => {
  const { x, y, width, height, rotation } = element.transform;
  const onPointerDown = (event: PointerEvent) => {
    event.stopPropagation();
    onSelect(element.id);
  };

  return (
    <div
      ref={boxRef}
      data-testid="element-box"
      data-element-id={element.id}
      onPointerDown={onPointerDown}
      className={cn(
        'absolute cursor-move',
        selected ? '' : 'hover:outline hover:outline-1 hover:outline-sky-400/70',
        !selected && outlined ? 'outline outline-1 outline-dashed outline-slate-400/50' : '',
      )}
      style={{
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: height * scale,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
};
