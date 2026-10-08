import type { FC } from 'react';
import type { Object3D } from '../../shared/schema';
import { progressAt } from '../science/plot/animatable';
import { Arrow3D } from './Arrow3D';
import { Curve3D } from './Curve3D';
import { fieldArrows } from './geometry3d';
import { Solid3D } from './Solid3D';
import { Surface3D } from './Surface3D';
import { scopeFromKey, scopeKeyAt } from './useScopeKey';

/** Un objet de la scène 3D à une frame donnée (apparition, paramètres animés). */
export const Object3DView: FC<{ object: Object3D; frame: number }> = ({ object, frame }) => {
  const progress = progressAt(frame, object.start, object.duration);
  const scopeKey = scopeKeyAt(object.params, frame);
  switch (object.kind) {
    case 'surface':
      return <Surface3D object={object} scopeKey={scopeKey} progress={progress} />;
    case 'curve':
      return <Curve3D object={object} scopeKey={scopeKey} progress={progress} />;
    case 'solid':
      return <Solid3D object={object} progress={progress} />;
    case 'arrow':
      return (
        <Arrow3D
          from={object.from}
          to={object.to}
          radius={object.radius}
          color={object.color}
          material={object.material}
          progress={progress}
        />
      );
    case 'vectorField':
      if (progress <= 0) return null;
      return (
        <>
          {fieldArrows(object, object.count, object.extent, object.scale, scopeFromKey(scopeKey)).map(
            (arrow, index) => (
              <Arrow3D
                key={index}
                from={arrow.from}
                to={arrow.to}
                radius={object.extent * 0.012}
                color={object.color}
                material={object.material}
                progress={progress}
              />
            ),
          )}
        </>
      );
    case 'label':
      return null; // étiquette dessinée en HTML par-dessus la 3D (Labels3D)
  }
};
