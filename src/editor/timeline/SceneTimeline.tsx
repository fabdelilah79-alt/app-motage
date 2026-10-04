import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { SceneElement } from '../../shared/schema';
import { plainText } from '../../shared/textContent';
import { usePreviewProject } from '../canvas/usePreviewProject';
import { useElementSize } from '../hooks/useElementSize';
import { usePlayerState } from '../hooks/usePlayerFrame';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene } from '../store/selectors';
import { cn } from '../ui/cn';
import { PlaybackControls } from './PlaybackControls';
import { TimelineBar } from './TimelineBar';
import { TimelineRuler } from './TimelineRuler';
import { VoiceoverRow } from './VoiceoverRow';

const LABEL_WIDTH = 150;

/** Libellé d'un élément : son nom, sinon le début de son texte, sinon son type. */
const useElementLabel = () => {
  const { t } = useTranslation();
  return (element: SceneElement) => {
    if (element.name) return element.name;
    if (element.type === 'text') return plainText(element.content).slice(0, 30);
    return t(`elementTypes.${element.type}`);
  };
};

/** Timeline de la scène : une barre par élément ; le temps s'écoule toujours vers la droite. */
export const SceneTimeline = () => {
  const { t } = useTranslation();
  const scene = useCurrentScene();
  const preview = usePreviewProject();
  const selectedId = useEditorStore((state) => state.selection.elementId);
  const selectElement = useEditorStore((state) => state.selectElement);
  const { frame, playing } = usePlayerState();
  const trackRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(trackRef);
  const label = useElementLabel();
  const { fps } = preview.project.format;
  const duration = preview.durationInFrames;
  const pixelsPerFrame = width > 0 ? width / duration : 1;
  const sceneMode = preview.mode === 'scene' && scene;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <PlaybackControls frame={frame} playing={playing} durationInFrames={duration} fps={fps} />
        {sceneMode ? null : (
          <span className="text-xs text-slate-400">{t('timeline.fullPreview')}</span>
        )}
      </div>
      <div dir="ltr" className="flex min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        <div className="shrink-0" style={{ width: LABEL_WIDTH }}>
          <div className="h-6" />
          {sceneMode && sceneMode.voiceover ? (
            <p className="h-8 truncate pe-2 text-start text-xs leading-8 text-emerald-300">
              {t('timeline.voiceover')}
            </p>
          ) : null}
          {sceneMode
            ? sceneMode.elements.map((element) => (
                <button
                  key={element.id}
                  type="button"
                  dir="auto"
                  onClick={() => selectElement(element.id)}
                  className={cn(
                    'block h-8 w-full truncate pe-2 text-start text-xs',
                    element.id === selectedId ? 'text-sky-300' : 'text-slate-300',
                  )}
                >
                  {label(element)}
                </button>
              ))
            : null}
        </div>
        <div ref={trackRef} className="relative min-w-0 flex-1">
          <TimelineRuler durationInFrames={duration} fps={fps} pixelsPerFrame={pixelsPerFrame} />
          {sceneMode ? <VoiceoverRow scene={sceneMode} pixelsPerFrame={pixelsPerFrame} /> : null}
          {sceneMode
            ? sceneMode.elements.map((element) => (
                <div key={element.id} className="relative h-8 border-b border-slate-800/60">
                  <TimelineBar
                    element={element}
                    sceneDuration={sceneMode.durationInFrames}
                    pixelsPerFrame={pixelsPerFrame}
                    selected={element.id === selectedId}
                  />
                </div>
              ))
            : null}
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-rose-400"
            style={{ left: frame * pixelsPerFrame }}
          />
        </div>
      </div>
      {sceneMode && sceneMode.elements.length === 0 ? (
        <p className="px-3 pb-3 text-xs text-slate-500">{t('timeline.empty')}</p>
      ) : null}
    </div>
  );
};
