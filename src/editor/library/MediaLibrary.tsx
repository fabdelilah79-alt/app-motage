import { Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createImageElement } from '../../shared/factories';
import type { Asset } from '../../shared/schema';
import { resolveAssetSrc } from '../../video/elements/resolveAssetSrc';
import { api } from '../api/client';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';
import { Button } from '../ui/button';

const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

/** Import d'images (bouton ou glisser-déposer) et images déjà présentes dans le projet. */
export const MediaLibrary = () => {
  const { t } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addAsset = useEditorStore((state) => state.addAsset);
  const addElement = useEditorStore((state) => state.addElement);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const images = project.assets.filter((asset) => asset.kind === 'image');
  const location = { projectId: project.id, filesBaseUrl: '' };

  const place = (asset: Asset) => {
    if (scene) addElement(createImageElement(project.format, scene.durationInFrames, asset));
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setFailed(false);
    try {
      for (const file of Array.from(files)) {
        const asset = await api.uploadImage(project.id, file);
        addAsset(asset);
        place(asset);
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
        data-testid="upload-image"
        onChange={(event) => void upload(event.target.files)}
      />
      <Button variant="primary" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload size={16} aria-hidden />
        {busy ? t('library.uploading') : t('library.importImage')}
      </Button>
      <p className="text-xs text-slate-400">{t('library.dropHelp')}</p>
      {failed ? <p className="text-xs text-rose-400">{t('errors.upload')}</p> : null}
      <div className="grid grid-cols-2 gap-2">
        {images.map((asset) => (
          <button
            key={asset.id}
            type="button"
            title={t('library.addToScene')}
            onClick={() => place(asset)}
            className="aspect-square overflow-hidden rounded-md border border-slate-700 bg-slate-800 p-1 hover:border-sky-400"
          >
            <img
              src={resolveAssetSrc(asset, location)}
              alt={asset.name}
              className="h-full w-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
