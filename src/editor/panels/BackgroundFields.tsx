import { useTranslation } from 'react-i18next';
import { textureSchema, type Background } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';
import { ColorInput } from './ColorInput';

type Props = { background: Background; onChange: (background: Background) => void };

const BACKGROUND_TYPES = [
  'theme',
  'color',
  'linear-gradient',
  'texture',
  'particles',
  'image',
  'video',
] as const;
type BackgroundType = (typeof BACKGROUND_TYPES)[number];

/** Nouveau fond d'un type donné, avec des valeurs de départ tirées du thème. */
const defaultBackground = (type: BackgroundType, assetId: string | undefined): Background => {
  switch (type) {
    case 'theme':
      return { type: 'theme' };
    case 'color':
      return { type: 'color', color: 'theme.background' };
    case 'linear-gradient':
      return {
        type: 'linear-gradient',
        angle: 135,
        stops: [
          { color: 'theme.background', position: 0 },
          { color: 'theme.surface', position: 100 },
        ],
      };
    case 'texture':
      return { type: 'texture', texture: 'grid', color: 'theme.background' };
    case 'particles':
      return {
        type: 'particles',
        color: 'theme.background',
        particleColor: 'theme.accent1',
        count: 60,
        seed: 'particules',
      };
    case 'image':
      return assetId ? { type: 'image', assetId, fit: 'cover' } : { type: 'theme' };
    case 'video':
      return assetId ? { type: 'video', assetId } : { type: 'theme' };
  }
};

/** Fond de scène : thème, couleur, dégradé, texture, particules, image ou vidéo. */
export const BackgroundFields = ({ background, onChange }: Props) => {
  const { t } = useTranslation();
  const assets = useEditorStore((state) => state.project?.assets ?? []);
  const images = assets.filter((asset) => asset.kind === 'image');
  const videos = assets.filter((asset) => asset.kind === 'video');

  const setType = (type: BackgroundType) => {
    const pool = type === 'image' ? images : videos;
    onChange(defaultBackground(type, pool[0]?.id));
  };

  const assetSelect = (kind: 'image' | 'video', assetId: string) => (
    <Field label={t(kind === 'image' ? 'background.image' : 'background.video')}>
      <NativeSelect
        value={assetId}
        onChange={(event) =>
          onChange(
            kind === 'image' && background.type === 'image'
              ? { ...background, assetId: event.target.value }
              : { type: 'video', assetId: event.target.value },
          )
        }
        options={(kind === 'image' ? images : videos).map((asset) => ({
          value: asset.id,
          label: asset.name || asset.id,
        }))}
      />
    </Field>
  );

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('scene.background')}>
        <NativeSelect
          data-testid="background-type"
          value={background.type}
          onChange={(event) => setType(event.target.value as BackgroundType)}
          options={BACKGROUND_TYPES.filter(
            (type) =>
              (type !== 'image' || images.length > 0) && (type !== 'video' || videos.length > 0),
          ).map((type) => ({ value: type, label: t(`background.types.${type}`) }))}
        />
      </Field>
      {background.type === 'theme' ? (
        <p className="text-xs text-slate-400">{t('background.themeHelp')}</p>
      ) : null}
      {background.type === 'color' ? (
        <Field label={t('fields.color')}>
          <ColorInput value={background.color} onChange={(color) => onChange({ type: 'color', color })} />
        </Field>
      ) : null}
      {background.type === 'linear-gradient' ? (
        <>
          {background.stops.slice(0, 2).map((stop, index) => (
            <Field key={index} label={t(index === 0 ? 'scene.colorFrom' : 'scene.colorTo')}>
              <ColorInput
                value={stop.color}
                onChange={(color) =>
                  onChange({
                    ...background,
                    stops: background.stops.map((item, i) => (i === index ? { ...item, color } : item)),
                  })
                }
              />
            </Field>
          ))}
          <Field label={t('scene.angle')}>
            <NumberInput
              step={15}
              value={background.angle}
              onValueChange={(angle) => onChange({ ...background, angle })}
            />
          </Field>
        </>
      ) : null}
      {background.type === 'texture' ? (
        <>
          <Field label={t('background.texture')}>
            <NativeSelect
              value={background.texture}
              onChange={(event) =>
                onChange({ ...background, texture: textureSchema.parse(event.target.value) })
              }
              options={textureSchema.options.map((texture) => ({
                value: texture,
                label: t(`background.textures.${texture}`),
              }))}
            />
          </Field>
          <Field label={t('fields.color')}>
            <ColorInput value={background.color} onChange={(color) => onChange({ ...background, color })} />
          </Field>
        </>
      ) : null}
      {background.type === 'particles' ? (
        <>
          <Field label={t('fields.color')}>
            <ColorInput value={background.color} onChange={(color) => onChange({ ...background, color })} />
          </Field>
          <Field label={t('background.particleColor')}>
            <ColorInput
              value={background.particleColor}
              onChange={(particleColor) => onChange({ ...background, particleColor })}
            />
          </Field>
          <Field label={t('background.particleCount')}>
            <NumberInput
              min={1}
              max={400}
              step={10}
              value={background.count}
              onValueChange={(count) => onChange({ ...background, count: Math.round(count) })}
            />
          </Field>
        </>
      ) : null}
      {background.type === 'image' ? (
        <>
          {assetSelect('image', background.assetId)}
          <Field label={t('fields.fit')}>
            <NativeSelect
              value={background.fit}
              onChange={(event) =>
                onChange({ ...background, fit: event.target.value === 'contain' ? 'contain' : 'cover' })
              }
              options={[
                { value: 'cover', label: t('media.fits.cover') },
                { value: 'contain', label: t('media.fits.contain') },
              ]}
            />
          </Field>
        </>
      ) : null}
      {background.type === 'video' ? assetSelect('video', background.assetId) : null}
    </div>
  );
};
