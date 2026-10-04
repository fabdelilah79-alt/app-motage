import { Trash2, Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { usedAssetIds } from '../../shared/assets';
import { createMediaElement } from '../../shared/mediaFactories';
import type { Asset } from '../../shared/schema';
import { api } from '../api/client';
import { measureMedia } from '../media/measureMedia';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MediaItem } from './MediaItem';

const ACCEPTED = 'image/*,video/mp4,video/webm,video/quicktime,audio/*,.json,.mp3,.wav,.m4a';

/** Médias du projet : import (bouton ou glisser-déposer), recherche, nettoyage. */
export const MediaLibrary = () => {
  const { t } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addAsset = useEditorStore((state) => state.addAsset);
  const addElement = useEditorStore((state) => state.addElement);
  const updateProject = useEditorStore((state) => state.updateProject);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const used = usedAssetIds(project);
  const unusedCount = project.assets.filter((asset) => !used.has(asset.id)).length;
  const visible = project.assets.filter((asset) =>
    asset.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const place = (asset: Asset) => {
    if (!scene) return;
    const element = createMediaElement(project.format, scene.durationInFrames, asset);
    if (element) addElement(element);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setFailed(false);
    try {
      for (const file of Array.from(files)) {
        const asset = await api.uploadMedia(project.id, file, file.name, await measureMedia(file));
        addAsset(asset);
        if (asset.kind !== 'audio') place(asset);
      }
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    void upload(event.dataTransfer.files);
  };

  return (
    <div
      className="flex flex-col gap-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        hidden
        data-testid="upload-media"
        onChange={(event) => void upload(event.target.files)}
      />
      <Button variant="primary" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload size={16} aria-hidden />
        {busy ? t('library.uploading') : t('media.import')}
      </Button>
      <p className="text-xs text-slate-400">{t('media.dropHelp')}</p>
      {failed ? <p className="text-xs text-rose-400">{t('errors.upload')}</p> : null}
      {project.assets.length > 3 ? (
        <Input
          type="search"
          placeholder={t('media.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {visible.map((asset) => (
          <MediaItem key={asset.id} asset={asset} onPlace={place} />
        ))}
      </div>
      {unusedCount > 0 ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            updateProject((draft) => {
              const stillUsed = usedAssetIds(draft);
              draft.assets = draft.assets.filter((asset) => stillUsed.has(asset.id));
            })
          }
        >
          <Trash2 size={14} aria-hidden />
          {t('media.removeUnused', { count: unusedCount })}
        </Button>
      ) : null}
    </div>
  );
};
