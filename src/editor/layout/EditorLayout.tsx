import type { PlayerRef } from '@remotion/player';
import { useRef } from 'react';
import { CanvasArea } from '../canvas/CanvasArea';
import { PlayerRefContext } from '../canvas/PlayerContext';
import { useAutosave } from '../hooks/useAutosave';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { LibraryPanel } from '../library/LibraryPanel';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { useEditorStore } from '../store/editorStore';
import { SceneTimeline } from '../timeline/SceneTimeline';
import { ScenesStrip } from '../timeline/ScenesStrip';
import { TopBar } from './TopBar';

const Workspace = () => {
  const project = useEditorStore((state) => state.project);
  const { status, saveNow } = useAutosave(project);
  useKeyboardShortcuts(() => void saveNow());

  return (
    <div className="flex h-full flex-col">
      <TopBar saveStatus={status} onSave={() => void saveNow()} />
      <div className="flex min-h-0 flex-1">
        <LibraryPanel />
        <CanvasArea />
        <PropertiesPanel />
      </div>
      <div className="flex h-72 shrink-0 flex-col border-t border-slate-800 bg-slate-900">
        <ScenesStrip />
        <SceneTimeline />
      </div>
    </div>
  );
};

/** Éditeur : barre du haut, bibliothèque, canevas, propriétés, scènes et timeline. */
export const EditorLayout = () => {
  const playerRef = useRef<PlayerRef>(null);
  return (
    <PlayerRefContext.Provider value={playerRef}>
      <Workspace />
    </PlayerRefContext.Provider>
  );
};
