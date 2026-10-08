import { useMemo, type FC } from 'react';
import { Quaternion, Vector3 } from 'three';
import type { Material3D, Vec3 } from '../../shared/schema';
import { toThree } from './camera';
import { Material3DView } from './Material3DView';

type Props = {
  from: Vec3;
  to: Vec3;
  radius: number;
  color: string;
  material?: Material3D;
  /** Croissance de la flèche (0 → 1). */
  progress?: number;
};

const UP = new Vector3(0, 1, 0);

/** Flèche 3D : tige (cylindre) + pointe (cône), orientée de `from` vers `to`. */
export const Arrow3D: FC<Props> = ({ from, to, radius, color, material = 'glossy', progress = 1 }) => {
  const geometry = useMemo(() => {
    const start = new Vector3(...toThree(from));
    const direction = new Vector3(...toThree(to)).sub(start);
    const length = direction.length() * Math.max(0, Math.min(1, progress));
    if (length < 1e-6) return null;
    direction.normalize();
    const head = Math.min(length * 0.35, radius * 5);
    const shaft = length - head;
    const quaternion = new Quaternion().setFromUnitVectors(UP, direction);
    const shaftCenter = start.clone().addScaledVector(direction, shaft / 2);
    const headCenter = start.clone().addScaledVector(direction, shaft + head / 2);
    return { quaternion, shaft, head, shaftCenter, headCenter };
  }, [from, to, radius, progress]);

  if (!geometry) return null;
  return (
    <>
      <mesh position={geometry.shaftCenter} quaternion={geometry.quaternion}>
        <cylinderGeometry args={[radius, radius, geometry.shaft, 16]} />
        <Material3DView kind={material} color={color} />
      </mesh>
      <mesh position={geometry.headCenter} quaternion={geometry.quaternion}>
        <coneGeometry args={[radius * 2.4, geometry.head, 24]} />
        <Material3DView kind={material} color={color} />
      </mesh>
    </>
  );
};
