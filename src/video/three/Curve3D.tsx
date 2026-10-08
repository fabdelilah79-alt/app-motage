import { useEffect, useMemo, type FC } from 'react';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import type { Object3D } from '../../shared/schema';
import { toThree } from './camera';
import { curvePoints, visiblePoints } from './geometry3d';
import { Material3DView } from './Material3DView';
import { scopeFromKey } from './useScopeKey';

type Curve = Extract<Object3D, { kind: 'curve' }>;

/**
 * Courbe paramétrée 3D (hélice, trajectoire) en tube, tracée progressivement, avec une
 * particule à son extrémité pendant le tracé.
 */
export const Curve3D: FC<{ object: Curve; scopeKey: string; progress: number }> = ({
  object,
  scopeKey,
  progress,
}) => {
  const { x, y, z, tMin, tMax, radius } = object;
  const points = useMemo(
    () => curvePoints({ x, y, z }, tMin, tMax, scopeFromKey(scopeKey)),
    [x, y, z, tMin, tMax, scopeKey],
  );
  const count = visiblePoints(points, progress).length;
  const geometry = useMemo(() => {
    const visible = points.slice(0, count);
    if (visible.length < 2) return null;
    const curve = new CatmullRomCurve3(visible.map((point) => new Vector3(...toThree(point))));
    return new TubeGeometry(curve, Math.max(8, visible.length), radius, 10, false);
  }, [points, count, radius]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (progress <= 0 || !geometry) return null;
  const tip = points[count - 1];
  return (
    <>
      <mesh geometry={geometry}>
        <Material3DView kind={object.material} color={object.color} />
      </mesh>
      {object.particle && tip ? (
        <mesh position={toThree(tip)}>
          <sphereGeometry args={[radius * 3, 24, 16]} />
          <meshStandardMaterial color={object.color} emissive={object.color} emissiveIntensity={0.6} />
        </mesh>
      ) : null}
    </>
  );
};
