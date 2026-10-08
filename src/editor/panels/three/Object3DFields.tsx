import { useTranslation } from 'react-i18next';
import type { Object3D } from '../../../shared/schema';
import { Field } from '../../ui/field';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';
import { ExpressionInput } from '../science/ExpressionInput';
import { Vec3Input } from './Vec3Input';

type Props = { object: Object3D; onChange: (recipe: (object: Object3D) => void) => void };

const SHAPES = ['sphere', 'cube', 'cylinder', 'cone', 'plane'] as const;

/** Réglages propres à chaque type d'objet 3D (expressions, positions, tailles…). */
export const Object3DFields = ({ object, onChange }: Props) => {
  const { t } = useTranslation();
  const number = (label: string, value: number, apply: (next: number) => void, step = 0.5) => (
    <Field label={label}>
      <NumberInput step={step} value={value} onValueChange={apply} />
    </Field>
  );

  switch (object.kind) {
    case 'surface':
      return (
        <>
          <ExpressionInput label="z = f(x, y)" value={object.expr} onChange={(expr) => onChange((o) => void (o.kind === 'surface' && (o.expr = expr)))} />
          <div className="grid grid-cols-2 gap-2">
            {number('x min', object.xMin, (v) => onChange((o) => void (o.kind === 'surface' && (o.xMin = v))))}
            {number('x max', object.xMax, (v) => onChange((o) => void (o.kind === 'surface' && (o.xMax = v))))}
            {number('y min', object.yMin, (v) => onChange((o) => void (o.kind === 'surface' && (o.yMin = v))))}
            {number('y max', object.yMax, (v) => onChange((o) => void (o.kind === 'surface' && (o.yMax = v))))}
            {number(t('three.resolution'), object.resolution, (v) => onChange((o) => void (o.kind === 'surface' && (o.resolution = Math.min(120, Math.max(4, Math.round(v)))))), 4)}
            <label className="flex items-center gap-2 self-end pb-2 text-xs text-slate-300">
              <input type="checkbox" className="h-4 w-4 accent-sky-500" checked={object.heightColors} onChange={(event) => onChange((o) => void (o.kind === 'surface' && (o.heightColors = event.target.checked)))} />
              {t('three.heightColors')}
            </label>
          </div>
        </>
      );
    case 'curve':
      return (
        <>
          <ExpressionInput label="x(t)" value={object.x} onChange={(x) => onChange((o) => void (o.kind === 'curve' && (o.x = x)))} />
          <ExpressionInput label="y(t)" value={object.y} onChange={(y) => onChange((o) => void (o.kind === 'curve' && (o.y = y)))} />
          <ExpressionInput label="z(t)" value={object.z} onChange={(z) => onChange((o) => void (o.kind === 'curve' && (o.z = z)))} />
          <div className="grid grid-cols-3 gap-2">
            {number('t min', object.tMin, (v) => onChange((o) => void (o.kind === 'curve' && (o.tMin = v))))}
            {number('t max', object.tMax, (v) => onChange((o) => void (o.kind === 'curve' && (o.tMax = v))))}
            {number(t('three.radius'), object.radius, (v) => onChange((o) => void (o.kind === 'curve' && (o.radius = Math.max(0.005, v)))), 0.01)}
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-sky-500" checked={object.particle} onChange={(event) => onChange((o) => void (o.kind === 'curve' && (o.particle = event.target.checked)))} />
            {t('three.particle')}
          </label>
        </>
      );
    case 'vectorField':
      return (
        <>
          <ExpressionInput label="Fx(x, y, z)" value={object.fx} onChange={(fx) => onChange((o) => void (o.kind === 'vectorField' && (o.fx = fx)))} />
          <ExpressionInput label="Fy(x, y, z)" value={object.fy} onChange={(fy) => onChange((o) => void (o.kind === 'vectorField' && (o.fy = fy)))} />
          <ExpressionInput label="Fz(x, y, z)" value={object.fz} onChange={(fz) => onChange((o) => void (o.kind === 'vectorField' && (o.fz = fz)))} />
          <div className="grid grid-cols-3 gap-2">
            {number(t('three.count'), object.count, (v) => onChange((o) => void (o.kind === 'vectorField' && (o.count = Math.min(8, Math.max(2, Math.round(v)))))), 1)}
            {number(t('three.extent'), object.extent, (v) => onChange((o) => void (o.kind === 'vectorField' && (o.extent = Math.max(0.5, v)))))}
            {number(t('three.scale'), object.scale, (v) => onChange((o) => void (o.kind === 'vectorField' && (o.scale = Math.max(0.01, v)))), 0.1)}
          </div>
        </>
      );
    case 'solid':
      return (
        <>
          <Field label={t('three.shape')}>
            <NativeSelect
              value={object.shape}
              options={SHAPES.map((shape) => ({ value: shape, label: t(`three.shapes.${shape}`) }))}
              onChange={(event) => {
                const shape = SHAPES.find((item) => item === event.target.value);
                if (shape) onChange((o) => void (o.kind === 'solid' && (o.shape = shape)));
              }}
            />
          </Field>
          <Vec3Input label={t('three.position')} value={object.position} onChange={(position) => onChange((o) => void (o.kind === 'solid' && (o.position = position)))} />
          <Vec3Input label={t('three.rotation')} value={object.rotation} onChange={(rotation) => onChange((o) => void (o.kind === 'solid' && (o.rotation = rotation)))} />
          {number(t('three.size'), object.size, (v) => onChange((o) => void (o.kind === 'solid' && (o.size = Math.max(0.05, v)))))}
        </>
      );
    case 'arrow':
      return (
        <>
          <Vec3Input label={t('three.from')} value={object.from} onChange={(from) => onChange((o) => void (o.kind === 'arrow' && (o.from = from)))} />
          <Vec3Input label={t('three.to')} value={object.to} onChange={(to) => onChange((o) => void (o.kind === 'arrow' && (o.to = to)))} />
          {number(t('three.radius'), object.radius, (v) => onChange((o) => void (o.kind === 'arrow' && (o.radius = Math.max(0.005, v)))), 0.01)}
        </>
      );
    case 'label':
      return (
        <>
          <Vec3Input label={t('three.position')} value={object.position} onChange={(position) => onChange((o) => void (o.kind === 'label' && (o.position = position)))} />
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('fields.lang')}>
              <NativeSelect
                value={object.lang}
                options={(['fr', 'ar', 'en'] as const).map((lang) => ({ value: lang, label: t(`langs.${lang}`) }))}
                onChange={(event) => {
                  const lang = (['fr', 'ar', 'en'] as const).find((item) => item === event.target.value);
                  if (lang) onChange((o) => void (o.kind === 'label' && (o.lang = lang)));
                }}
              />
            </Field>
            {number(t('fields.fontSize'), object.fontSize, (v) => onChange((o) => void (o.kind === 'label' && (o.fontSize = Math.max(8, v)))), 2)}
          </div>
        </>
      );
  }
};
