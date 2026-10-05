import { useTranslation } from 'react-i18next';
import type { TextEffects, TextElement } from '../../../shared/schema';
import { useEditorStore } from '../../store/editorStore';
import { Field } from '../../ui/field';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';
import { ColorInput } from '../ColorInput';
import { EffectSection } from './EffectSection';

type EffectKey = keyof TextEffects;

/** Réglages proposés quand on active un effet. */
const DEFAULTS: { [K in EffectKey]-?: NonNullable<TextEffects[K]> } = {
  stroke: { color: '#ffffff', width: 4 },
  shadow: { color: '#0f172a', blur: 12, offsetX: 4, offsetY: 6 },
  glow: { color: '#38bdf8', radius: 18 },
  gradient: { from: '#2563eb', to: '#9333ea', angle: 90 },
  background: { kind: 'card', color: '#e0f2fe', padding: 24 },
  highlight: { color: '#fde047' },
  underline: { thickness: 6 },
};

const ORDER: readonly EffectKey[] = [
  'stroke',
  'shadow',
  'glow',
  'gradient',
  'background',
  'highlight',
  'underline',
];

/** Effets de texte : contour, ombre, lueur, dégradé, fond, surlignage, soulignement. */
export const TextEffectsEditor = ({ element }: { element: TextElement }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const { effects } = element.style;

  const setEffect = <K extends EffectKey>(key: K, value: TextEffects[K]) =>
    updateElement(element.id, (draft) => {
      if (draft.type === 'text') draft.style.effects[key] = value;
    });

  const color = (
    key: EffectKey,
    value: string,
    onChange: (next: string) => void,
    label = 'effects.color',
  ) => (
    <Field key={`${key}-${label}`} label={t(label)}>
      <ColorInput value={value} onChange={onChange} />
    </Field>
  );
  const number = (label: string, value: number, onChange: (next: number) => void, step = 1) => (
    <Field key={label} label={t(label)}>
      <NumberInput step={step} value={value} onValueChange={onChange} />
    </Field>
  );

  const settings = (key: EffectKey) => {
    switch (key) {
      case 'stroke': {
        const v = effects.stroke ?? DEFAULTS.stroke;
        return [
          color(key, v.color, (c) => setEffect(key, { ...v, color: c })),
          number('effects.width', v.width, (width) => setEffect(key, { ...v, width })),
        ];
      }
      case 'shadow': {
        const v = effects.shadow ?? DEFAULTS.shadow;
        return [
          color(key, v.color, (c) => setEffect(key, { ...v, color: c })),
          number('effects.blur', v.blur, (blur) => setEffect(key, { ...v, blur })),
          number('effects.offsetX', v.offsetX, (offsetX) => setEffect(key, { ...v, offsetX })),
          number('effects.offsetY', v.offsetY, (offsetY) => setEffect(key, { ...v, offsetY })),
        ];
      }
      case 'glow': {
        const v = effects.glow ?? DEFAULTS.glow;
        return [
          color(key, v.color, (c) => setEffect(key, { ...v, color: c })),
          number('effects.radius', v.radius, (radius) => setEffect(key, { ...v, radius })),
        ];
      }
      case 'gradient': {
        const v = effects.gradient ?? DEFAULTS.gradient;
        return [
          color(key, v.from, (from) => setEffect(key, { ...v, from }), 'effects.from'),
          color(key, v.to, (to) => setEffect(key, { ...v, to }), 'effects.to'),
          number('effects.angle', v.angle, (angle) => setEffect(key, { ...v, angle }), 15),
        ];
      }
      case 'background': {
        const v = effects.background ?? DEFAULTS.background;
        return [
          <Field key="kind" label={t('effects.kind')}>
            <NativeSelect
              value={v.kind}
              options={(['band', 'pill', 'card'] as const).map((kind) => ({
                value: kind,
                label: t(`effects.kinds.${kind}`),
              }))}
              onChange={(event) => {
                const kinds = ['band', 'pill', 'card'] as const;
                const kind = kinds.find((item) => item === event.target.value);
                if (kind) setEffect(key, { ...v, kind });
              }}
            />
          </Field>,
          color(key, v.color, (c) => setEffect(key, { ...v, color: c })),
          number('effects.padding', v.padding, (padding) => setEffect(key, { ...v, padding }), 4),
        ];
      }
      case 'highlight': {
        const v = effects.highlight ?? DEFAULTS.highlight;
        return [color(key, v.color, (c) => setEffect(key, { color: c }))];
      }
      case 'underline': {
        const v = effects.underline ?? DEFAULTS.underline;
        return [
          color(key, v.color ?? element.style.color, (c) => setEffect(key, { ...v, color: c })),
          number('effects.thickness', v.thickness, (thickness) =>
            setEffect(key, { ...v, thickness }),
          ),
        ];
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-slate-400">{t('text.effects')}</span>
      {ORDER.map((key) => (
        <EffectSection
          key={key}
          testId={`effect-${key}`}
          label={t(`effects.${key}`)}
          enabled={effects[key] !== undefined}
          onToggle={(enabled) => setEffect(key, enabled ? DEFAULTS[key] : undefined)}
        >
          {settings(key)}
        </EffectSection>
      ))}
    </div>
  );
};
