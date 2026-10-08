import { Player } from '@remotion/player';
import { useEffect, useMemo, useRef } from 'react';
import { ProjectVideo } from '../../video/ProjectVideo';
import { useElementSize } from '../hooks/useElementSize';
import { useCurrentScene } from '../store/selectors';
import { usePlayerRef } from './PlayerContext';
import { PreviewError } from './PreviewError';
import { SelectionOverlay } from './SelectionOverlay';
import { usePreviewProject } from './usePreviewProject';

/** Lecteur Remotion ajusté à la place disponible, avec le calque de sélection par-dessus. */
export const CanvasArea = () => {
  const playerRef = usePlayerRef();
  const preview = usePreviewProject();
  const scene = useCurrentScene();
  const containerRef = useRef<HTMLDivElement>(null);
  const available = useElementSize(containerRef);
  const { width, height, fps } = preview.project.format;
  const scale = Math.max(0, Math.min(available.width / width, available.height / height));
  // Échelle arrondie : l'aperçu n'est pas recalculé à chaque pixel de redimensionnement.
  const previewScale = Math.round(scale * 10) / 10 || 0.1;
  const inputProps = useMemo(
    () => ({ project: preview.project, filesBaseUrl: '', previewScale }),
    [preview.project, previewScale],
  );

  // Nouvelle scène sélectionnée : retour au début.
  useEffect(() => {
    playerRef.current?.seekTo(0);
  }, [playerRef, scene?.id, preview.mode]);

  return (
    <main
      ref={containerRef}
      data-tour="canvas"
      dir="ltr"
      className="flex min-w-0 flex-1 items-center justify-center bg-slate-950 p-6"
    >
      <div
        className="relative shadow-2xl ring-1 ring-slate-700"
        style={{ width: width * scale, height: height * scale }}
      >
        <Player
          ref={playerRef}
          component={ProjectVideo}
          inputProps={inputProps}
          durationInFrames={preview.durationInFrames}
          fps={fps}
          compositionWidth={width}
          compositionHeight={height}
          style={{ width: '100%', height: '100%' }}
          controls={preview.mode === 'full'}
          clickToPlay={preview.mode === 'full'}
          acknowledgeRemotionLicense
          errorFallback={({ error }) => <PreviewError error={error} />}
        />
        {preview.mode === 'scene' && scene ? (
          <SelectionOverlay scene={scene} scale={scale} format={preview.project.format} />
        ) : null}
      </div>
    </main>
  );
};
