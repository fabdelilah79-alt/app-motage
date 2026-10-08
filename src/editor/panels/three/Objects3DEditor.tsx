import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { randomId } from '../../../shared/factories';
import type { Object3D, Object3DKind, Scene3DElement } from '../../../shared/schema';
import { Button } from '../../ui/button';
import { Object3DItem } from './Object3DItem';
import { useScene3DEdit } from './useScene3DEdit';

const KINDS: readonly Object3DKind[] = ['surface', 'curve', 'vectorField', 'solid', 'arrow', 'label'];

/** Nouvel objet 3D avec des valeurs de départ parlantes. */
const newObject = (kind: Object3DKind, start: number): Object3D => {
  const base = { id: `obj-${randomId()}`, color: 'theme.accent1', material: 'glossy' as const, start, duration: 30, params: {}, label: '' };
  switch (kind) {
    case 'surface':
      return { ...base, kind, material: 'matte', expr: 'x^2/4 - y^2/4', xMin: -4, xMax: 4, yMin: -4, yMax: 4, resolution: 48, heightColors: true };
    case 'curve':
      return { ...base, kind, x: '2*cos(t)', y: '2*sin(t)', z: 't/2', tMin: 0, tMax: 12, radius: 0.06, particle: true, duration: 90 };
    case 'vectorField':
      return { ...base, kind, fx: 'x', fy: 'y', fz: 'z', count: 4, extent: 4, scale: 0.4 };
    case 'solid':
      return { ...base, kind, shape: 'sphere', position: [0, 0, 1], size: 2, rotation: [0, 0, 0] };
    case 'arrow':
      return { ...base, kind, from: [0, 0, 0], to: [2, 2, 2], radius: 0.06, label: '\\vec{u}' };
    case 'label':
      return { ...base, kind, color: 'theme.text', position: [0, 0, 3], text: 'A', lang: 'fr', fontSize: 36 };
  }
};

/** Objets de la scène 3D : surfaces, courbes, champs, solides, flèches, étiquettes. */
export const Objects3DEditor = ({ element, fps }: { element: Scene3DElement; fps: number }) => {
  const { t } = useTranslation();
  const edit = useScene3DEdit(element.id);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('three.objects')}</p>
      {element.objects.map((object, index) => (
        <Object3DItem
          key={object.id}
          object={object}
          fps={fps}
          onChange={(recipe) =>
            edit((scene) => {
              const current = scene.objects[index];
              if (current) recipe(current);
            })
          }
          onRemove={() => edit((scene) => void scene.objects.splice(index, 1))}
        />
      ))}
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((kind) => (
          <Button key={kind} size="sm" data-testid={`add-object-${kind}`} onClick={() => edit((scene) => void scene.objects.push(newObject(kind, 0)))}>
            <Plus size={14} aria-hidden />
            {t(`three.kinds.${kind}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};
