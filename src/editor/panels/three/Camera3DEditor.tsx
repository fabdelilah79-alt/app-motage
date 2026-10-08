import { useTranslation } from 'react-i18next';
import type { Scene3DElement } from '../../../shared/schema';
import { Button } from '../../ui/button';
import { Field } from '../../ui/field';
import { NumberInput } from '../../ui/number-input';
import { AnimatableField } from './AnimatableField';
import { useScene3DEdit } from './useScene3DEdit';

/** Vues toutes prêtes : azimut et élévation (degrés). */
const VIEWS = {
  iso: [35, 25],
  front: [0, 0],
  side: [90, 0],
  top: [0, 89],
} as const;

/** Caméra : vues prêtes, orbite continue, angles et distance animables (zoom, travelling). */
export const Camera3DEditor = ({ element, fps }: { element: Scene3DElement; fps: number }) => {
  const { t } = useTranslation();
  const edit = useScene3DEdit(element.id);
  const { camera } = element;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('three.camera')}</p>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(VIEWS) as (keyof typeof VIEWS)[]).map((view) => (
          <Button
            key={view}
            size="sm"
            data-testid={`view-${view}`}
            onClick={() =>
              edit((scene) => {
                const [azimuth, elevation] = VIEWS[view];
                scene.camera.azimuth = { ...scene.camera.azimuth, value: azimuth, to: undefined };
                scene.camera.elevation = { ...scene.camera.elevation, value: elevation, to: undefined };
                scene.camera.orbitSpeed = 0;
              })
            }
          >
            {t(`three.views.${view}`)}
          </Button>
        ))}
      </div>
      <AnimatableField label={t('three.azimuth')} step={5} fps={fps} value={camera.azimuth} onChange={(next) => edit((scene) => void (scene.camera.azimuth = next))} />
      <AnimatableField label={t('three.elevation')} step={5} fps={fps} value={camera.elevation} onChange={(next) => edit((scene) => void (scene.camera.elevation = next))} />
      <AnimatableField label={t('three.distance')} step={1} fps={fps} value={camera.distance} onChange={(next) => edit((scene) => void (scene.camera.distance = next))} />
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('three.orbitSpeed')}>
          <NumberInput step={5} value={camera.orbitSpeed} onValueChange={(speed) => edit((scene) => void (scene.camera.orbitSpeed = speed))} />
        </Field>
        <Field label={t('three.fov')}>
          <NumberInput min={10} max={100} step={5} value={camera.fov} onValueChange={(fov) => edit((scene) => void (scene.camera.fov = Math.min(100, Math.max(10, fov))))} />
        </Field>
      </div>
    </div>
  );
};
