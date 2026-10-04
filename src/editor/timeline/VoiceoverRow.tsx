import type { PointerEvent as ReactPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Scene } from '../../shared/schema';
import { resolveAssetSrc } from '../../video/elements/resolveAssetSrc';
import { useWaveform } from '../audio/useWaveform';
import { useEditorStore } from '../store/editorStore';
import { beginInteraction, endInteraction } from '../store/history';
import { useProject } from '../store/selectors';

type Props = { scene: Scene; pixelsPerFrame: number };

/** Forme d'onde de la voix off dans la timeline ; glisser pour décaler son début. */
export const VoiceoverRow = ({ scene, pixelsPerFrame }: Props) => {
  const { t } = useTranslation();
  const project = useProject();
  const updateScene = useEditorStore((state) => state.updateScene);
  const voice = scene.voiceover;
  const asset = voice ? project.assets.find((item) => item.id === voice.assetId) : undefined;
  const src = asset ? resolveAssetSrc(asset, { projectId: project.id, filesBaseUrl: '' }) : null;
  const peaks = useWaveform(src);
  if (!voice) return null;

  const seconds = asset?.meta.durationInSeconds ?? 0;
  const durationFrames = Math.max(1, Math.round(seconds * project.format.fps));
  const width = Math.min(durationFrames, scene.durationInFrames - voice.offset) * pixelsPerFrame;

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const initial = voice.offset;
    beginInteraction();
    const onMove = (moveEvent: PointerEvent) => {
      const delta = Math.round((moveEvent.clientX - startX) / pixelsPerFrame);
      const offset = Math.max(0, Math.min(scene.durationInFrames - 1, initial + delta));
      updateScene(scene.id, (draft) => {
        if (draft.voiceover) draft.voiceover.offset = offset;
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
    <div className="relative h-8 border-b border-slate-800/60" title={t('timeline.voiceover')}>
      <div
        data-testid="voiceover-wave"
        className="absolute top-1 bottom-1 flex cursor-grab items-center overflow-hidden rounded bg-emerald-900/70"
        style={{ left: voice.offset * pixelsPerFrame, width: Math.max(4, width) }}
        onPointerDown={startDrag}
      >
        {peaks ? (
          <svg
            className="h-full shrink-0"
            style={{ width: durationFrames * pixelsPerFrame }}
            viewBox={`0 0 ${peaks.length} 100`}
            preserveAspectRatio="none"
          >
            {peaks.map((peak, index) => (
              <rect
                key={index}
                x={index}
                y={50 - peak * 45}
                width={0.8}
                height={Math.max(1, peak * 90)}
                fill="#6ee7b7"
              />
            ))}
          </svg>
        ) : null}
      </div>
    </div>
  );
};
