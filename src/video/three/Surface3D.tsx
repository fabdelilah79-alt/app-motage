import { useEffect, useMemo, type FC } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { Object3D } from '../../shared/schema';
import { toThree } from './camera';
import { heightColor, surfaceData } from './geometry3d';
import { Material3DView } from './Material3DView';
import { scopeFromKey } from './useScopeKey';

type Surface = Extract<Object3D, { kind: 'surface' }>;

/** Surface z = f(x, y), colorée selon la hauteur ; elle « pousse » depuis le plan z = 0. */
export const Surface3D: FC<{ object: Surface; scopeKey: string; progress: number }> = ({
  object,
  scopeKey,
  progress,
}) => {
  const { expr, xMin, xMax, yMin, yMax, resolution, heightColors } = object;
  const geometry = useMemo(() => {
    const data = surfaceData(expr, { xMin, xMax, yMin, yMax }, resolution, scopeFromKey(scopeKey));
    const positions = data.points.flatMap((point) => toThree(point));
    const span = data.zMax - data.zMin || 1;
    const colors = data.points.flatMap(([, , z]) => heightColor((z - data.zMin) / span));
    const built = new BufferGeometry();
    built.setAttribute('position', new Float32BufferAttribute(positions, 3));
    built.setAttribute('color', new Float32BufferAttribute(colors, 3));
    built.setIndex(data.indices);
    built.computeVertexNormals();
    return built;
  }, [expr, xMin, xMax, yMin, yMax, resolution, scopeKey]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  if (progress <= 0) return null;
  return (
    <mesh geometry={geometry} scale={[1, Math.max(0.001, progress), 1]}>
      <Material3DView kind={object.material} color={object.color} vertexColors={heightColors} />
    </mesh>
  );
};
