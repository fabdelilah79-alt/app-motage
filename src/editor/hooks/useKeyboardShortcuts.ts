import { useEffect } from 'react';
import { usePlayerRef } from '../canvas/PlayerContext';
import { useEditorStore } from '../store/editorStore';
import { redo, undo } from '../store/history';

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/**
 * Raccourcis : Espace (lecture), Ctrl+Z / Ctrl+Y (annuler / rétablir), Ctrl+S (enregistrer),
 * Suppr (supprimer), Ctrl+D (dupliquer), Ctrl+C / Ctrl+V, flèches (déplacer, Maj = ×10).
 */
export const useKeyboardShortcuts = (saveNow: () => void) => {
  const playerRef = usePlayerRef();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      const store = useEditorStore.getState();
      const selected = store.selection.elementId;
      const ctrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      let handled = true;

      if (ctrl && key === 'z' && !event.shiftKey) undo();
      else if (ctrl && (key === 'y' || (key === 'z' && event.shiftKey))) redo();
      else if (ctrl && key === 's') saveNow();
      else if (ctrl && key === 'd' && selected) store.duplicateElement(selected);
      else if (ctrl && key === 'c' && selected) store.copyElement(selected);
      else if (ctrl && key === 'v') store.pasteElement();
      else if (event.key === ' ') playerRef.current?.toggle();
      else if ((event.key === 'Delete' || event.key === 'Backspace') && selected) {
        store.removeElement(selected);
      } else if (event.key in ARROWS && selected) {
        const [dx, dy] = ARROWS[event.key] ?? [0, 0];
        const step = event.shiftKey ? 10 : 1;
        store.updateElement(selected, (element) => {
          element.transform.x += dx * step;
          element.transform.y += dy * step;
        });
      } else handled = false;

      if (handled) event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playerRef, saveNow]);
};
