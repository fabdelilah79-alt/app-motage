import { useLayoutEffect, useRef, useState } from 'react';
import type { MoveableRefObject } from 'react-moveable';
import type { ProjectFormat, Scene } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { ElementBox } from './ElementBox';
import { ElementMoveable } from './ElementMoveable';

type Props = { scene: Scene; scale: number; format: ProjectFormat };
type BoxRef = MoveableRefObject<HTMLElement> & { attach: (node: HTMLDivElement | null) => void };

/** Calque transparent au-dessus du lecteur : clic pour sélectionner, poignées pour modifier. */
export const SelectionOverlay = ({ scene, scale, format }: Props) => {
  const selectedId = useEditorStore((state) => state.selection.elementId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  // Une référence stable par élément : cible des poignées et guides magnétiques.
  const boxes = useRef(new Map<string, BoxRef>());

  const boxFor = (elementId: string): BoxRef => {
    let box = boxes.current.get(elementId);
    if (!box) {
      const created: BoxRef = {
        current: null,
        attach: (node) => {
          created.current = node;
        },
      };
      boxes.current.set(elementId, created);
      box = created;
    }
    return box;
  };

  const visible = scene.elements.filter((element) => !element.hidden);
  const selected = visible.find((element) => element.id === selectedId);
  const guides = visible
    .filter((element) => element.id !== selectedId)
    .map((element) => boxFor(element.id));

  // Après l'affichage, les poignées se placent sur la zone de l'élément sélectionné.
  useLayoutEffect(() => {
    setTarget(selectedId ? (boxes.current.get(selectedId)?.current ?? null) : null);
  }, [selectedId, scene]);

  return (
    <div
      className="absolute inset-0"
      // Seul un clic sur une zone vide désélectionne (pas un clic sur les poignées).
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) selectElement(null);
      }}
    >
      {visible.map((element) => (
        <ElementBox
          key={element.id}
          element={element}
          scale={scale}
          selected={element.id === selectedId}
          boxRef={boxFor(element.id).attach}
          onSelect={selectElement}
        />
      ))}
      {selected && !selected.locked && target ? (
        <ElementMoveable
          key={selected.id}
          target={target}
          elementId={selected.id}
          scale={scale}
          format={format}
          guides={guides}
        />
      ) : null}
    </div>
  );
};
