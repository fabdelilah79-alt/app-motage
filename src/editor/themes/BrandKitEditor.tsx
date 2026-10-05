import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrandScene } from '../../shared/brandScenes';
import { brandSchema, type Brand } from '../../shared/schema';
import { api } from '../api/client';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
type Status = 'idle' | 'saved' | 'applied' | 'missing' | 'error';

/** Kit de marque : logo sur toutes les scènes, couleurs personnelles, intro / conclusion. */
export const BrandKitEditor = () => {
  const { t } = useTranslation();
  const project = useProject();
  const updateProject = useEditorStore((state) => state.updateProject);
  const addAsset = useEditorStore((state) => state.addAsset);
  const [newColor, setNewColor] = useState('#2563eb');
  const [status, setStatus] = useState<Status>('idle');
  const brand: Brand = project.brand ?? brandSchema.parse({});
  const images = project.assets.filter((asset) => asset.kind === 'image');

  const setBrand = (patch: Partial<Brand>) =>
    updateProject((draft) => {
      draft.brand = { ...brand, ...patch };
    });

  const addScene = (kind: 'intro' | 'outro') =>
    updateProject((draft) => {
      const scene = createBrandScene(draft, kind);
      if (kind === 'intro') draft.scenes.unshift(scene);
      else draft.scenes.push(scene);
    });

  const run = async (action: () => Promise<Status>) => {
    try {
      setStatus(await action());
    } catch {
      setStatus('error');
    }
  };

  const saveKit = () =>
    run(async () => {
      await api.saveBrandKit(project.id, brand);
      return 'saved';
    });

  const applyKit = () =>
    run(async () => {
      const kit = await api.getBrandKit();
      if (!kit) return 'missing';
      const result = await api.applyBrandKit(project.id);
      if (result.asset) addAsset(result.asset);
      updateProject((draft) => {
        draft.brand = result.brand;
      });
      return 'applied';
    });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-400">{t('brand.help')}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label={t('brand.logo')} hint={images.length === 0 ? t('brand.noImage') : undefined}>
          <NativeSelect
            data-testid="brand-logo"
            value={brand.logoAssetId ?? ''}
            onChange={(event) => setBrand({ logoAssetId: event.target.value || undefined })}
            options={[
              { value: '', label: t('brand.noLogo') },
              ...images.map((asset) => ({ value: asset.id, label: asset.name || asset.id })),
            ]}
          />
        </Field>
        <Field label={t('brand.corner')}>
          <NativeSelect
            value={brand.logoCorner}
            onChange={(event) =>
              setBrand({ logoCorner: brandSchema.shape.logoCorner.parse(event.target.value) })
            }
            options={CORNERS.map((corner) => ({
              value: corner,
              label: t(`brand.corners.${corner}`),
            }))}
          />
        </Field>
        <Field label={t('brand.size')}>
          <NumberInput
            min={3}
            max={50}
            step={1}
            value={Math.round(brand.logoSize * 100)}
            onValueChange={(percent) =>
              setBrand({ logoSize: Math.min(50, Math.max(3, percent)) / 100 })
            }
          />
        </Field>
      </div>

      <Field label={t('brand.colors')}>
        <div className="flex flex-wrap items-center gap-2">
          {brand.colors.map((color, index) => (
            <span
              key={`${color}-${index}`}
              className="flex items-center gap-1 rounded-full border border-slate-700 py-0.5 ps-0.5 pe-1.5"
            >
              <span className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
              <button
                type="button"
                aria-label={t('brand.removeColor')}
                className="text-slate-400 hover:text-white"
                onClick={() => setBrand({ colors: brand.colors.filter((_, i) => i !== index) })}
              >
                <X size={12} aria-hidden />
              </button>
            </span>
          ))}
          <input
            type="color"
            aria-label={t('brand.newColor')}
            className="h-8 w-10 rounded border border-slate-700 bg-slate-900 p-0.5"
            value={newColor}
            onChange={(event) => setNewColor(event.target.value)}
          />
          <Button size="sm" onClick={() => setBrand({ colors: [...brand.colors, newColor] })}>
            <Plus size={14} aria-hidden />
            {t('brand.addColor')}
          </Button>
        </div>
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => addScene('intro')} data-testid="brand-intro">
          {t('brand.addIntro')}
        </Button>
        <Button size="sm" onClick={() => addScene('outro')}>
          {t('brand.addOutro')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void saveKit()}>
          {t('brand.saveKit')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void applyKit()}>
          {t('brand.applyKit')}
        </Button>
      </div>
      {status === 'idle' ? null : (
        <p role="status" className="text-xs text-slate-300">
          {t(`brand.status.${status}`)}
        </p>
      )}
    </div>
  );
};
