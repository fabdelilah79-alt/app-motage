import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { material3DSchema, type Object3D } from '../../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { Button } from '../../ui/button';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';
import { ColorInput } from '../ColorInput';
import { CurveParamsEditor } from '../science/CurveParamsEditor';
import { Object3DFields } from './Object3DFields';

type Props = {
  object: Object3D;
  fps: number;
  onChange: (recipe: (object: Object3D) => void) => void;
  onRemove: () => void;
};

/** Un objet 3D : réglages propres, couleur, matériau, apparition, nom et paramètres animés. */
export const Object3DItem = ({ object, fps, onChange, onRemove }: Props) => {
  const { t } = useTranslation();
  const usesParams = object.kind === 'surface' || object.kind === 'curve' || object.kind === 'vectorField';

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-700 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-200">{t(`three.kinds.${object.kind}`)}</span>
        <Button size="icon" variant="ghost" aria-label={t('three.removeObject')} onClick={onRemove}>
          <Trash2 size={14} aria-hidden />
        </Button>
      </div>
      {object.kind === 'label' ? (
        <Field label={t('three.text')}>
          <Input dir="auto" value={object.text} onChange={(event) => onChange((o) => void (o.kind === 'label' && (o.text = event.target.value)))} />
        </Field>
      ) : null}
      <Object3DFields object={object} onChange={onChange} />
      {usesParams ? (
        <CurveParamsEditor params={object.params} fps={fps} onChange={(recipe) => onChange((o) => recipe(o.params))} />
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('fields.color')}>
          <ColorInput compact value={object.color} onChange={(color) => onChange((o) => void (o.color = color))} />
        </Field>
        {object.kind === 'label' ? null : (
          <Field label={t('three.material')}>
            <NativeSelect
              value={object.material}
              options={material3DSchema.options.map((material) => ({ value: material, label: t(`three.materials.${material}`) }))}
              onChange={(event) => {
                const material = material3DSchema.options.find((item) => item === event.target.value);
                if (material) onChange((o) => void (o.material = material));
              }}
            />
          </Field>
        )}
        <Field label={t('fields.start')}>
          <NumberInput min={0} step={0.1} value={framesToSeconds(object.start, fps)} onValueChange={(s) => onChange((o) => void (o.start = Math.max(0, secondsToFrames(s, fps))))} />
        </Field>
        <Field label={t('three.appearDuration')}>
          <NumberInput min={0} step={0.1} value={framesToSeconds(object.duration, fps)} onValueChange={(s) => onChange((o) => void (o.duration = Math.max(0, secondsToFrames(s, fps))))} />
        </Field>
      </div>
      {object.kind === 'label' ? null : (
        <Field label={t('three.objectLabel')}>
          <Input dir="auto" value={object.label} onChange={(event) => onChange((o) => void (o.label = event.target.value))} />
        </Field>
      )}
    </div>
  );
};
