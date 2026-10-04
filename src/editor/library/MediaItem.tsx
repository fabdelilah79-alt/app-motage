import { FileJson, Film, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Asset } from '../../shared/schema';
import { resolveAssetSrc } from '../../video/elements/resolveAssetSrc';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';
import { Button } from '../ui/button';

type Props = { asset: Asset; onPlace: (asset: Asset) => void };

const ICONS = { video: Film, audio: Music, lottie: FileJson } as const;

/** Un média du projet : vignette, nom, et action selon son type. */
export const MediaItem = ({ asset, onPlace }: Props) => {
  const { t } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const updateProject = useEditorStore((state) => state.updateProject);
  const src = resolveAssetSrc(asset, { projectId: project.id, filesBaseUrl: '' });
  const visual = asset.kind === 'image' || asset.kind === 'gif';
  const Icon = asset.kind === 'image' || asset.kind === 'gif' ? null : ICONS[asset.kind];
  const seconds = asset.meta.durationInSeconds;

  const setAsMusic = () =>
    updateProject((draft) => {
      draft.audioTracks.push({
        id: `music-${asset.id}-${draft.audioTracks.length + 1}`,
        assetId: asset.id,
        volume: 0.4,
        fadeIn: draft.format.fps,
        fadeOut: Math.round(draft.format.fps * 1.5),
        loop: true,
        ducking: { enabled: true, level: 0.35 },
      });
    });
  const setAsVoice = () =>
    updateProject((draft) => {
      const target = draft.scenes.find((item) => item.id === scene?.id);
      if (target) target.voiceover = { assetId: asset.id, volume: 1, offset: 0 };
    });

  return (
    <div className="flex flex-col gap-1 rounded-md border border-slate-700 bg-slate-800 p-1.5">
      <button
        type="button"
        data-testid={`media-${asset.kind}`}
        title={asset.kind === 'audio' ? asset.name : t('library.addToScene')}
        disabled={asset.kind === 'audio'}
        onClick={() => onPlace(asset)}
        className="flex aspect-video items-center justify-center overflow-hidden rounded bg-slate-900 enabled:hover:ring-2 enabled:hover:ring-sky-400"
      >
        {visual ? (
          <img src={src} alt={asset.name} className="h-full w-full object-contain" />
        ) : Icon ? (
          <Icon size={28} className="text-slate-400" aria-hidden />
        ) : null}
      </button>
      <p className="truncate text-[11px] text-slate-300" dir="auto" title={asset.name}>
        {asset.name}
        {seconds ? <span className="text-slate-500"> · {seconds.toFixed(1)} s</span> : null}
      </p>
      {asset.kind === 'audio' ? (
        <div className="flex flex-col gap-1">
          <Button size="sm" variant="ghost" onClick={setAsMusic} data-testid="use-as-music">
            {t('media.useAsMusic')}
          </Button>
          <Button size="sm" variant="ghost" onClick={setAsVoice} disabled={!scene}>
            {t('media.useAsVoice')}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
