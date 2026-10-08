import type { FC } from 'react';
import type { Object3D } from '../../shared/schema';
import { toThree } from './camera';
import { Material3DView } from './Material3DView';

type Solid = Extract<Object3D, { kind: 'solid' }>;

const DEG = Math.PI / 180;

/** Solide : sphère, cube, cylindre, cône ou plan ; il grandit à son apparition. */
export const Solid3D: FC<{ object: Solid; progress: number }> = ({ object, progress }) => {
  if (progress <= 0) return null;
  const s = object.size;
  const [rx, ry, rz] = object.rotation;
  const geometry = (() => {
    switch (object.shape) {
      case 'sphere':
        return <sphereGeometry args={[s / 2, 48, 32]} />;
      case 'cube':
        return <boxGeometry args={[s, s, s]} />;
      case 'cylinder':
        return <cylinderGeometry args={[s / 2, s / 2, s, 48]} />;
      case 'cone':
        return <coneGeometry args={[s / 2, s, 48]} />;
      case 'plane':
        return <planeGeometry args={[s, s]} />;
    }
  })();
  return (
    <group position={toThree(object.position)} rotation={[rx * DEG, rz * DEG, -ry * DEG]} scale={progress}>
      {/* Un plan est horizontal (plan x, y du repère) avant sa propre rotation. */}
      <mesh rotation={object.shape === 'plane' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
        {geometry}
        <Material3DView kind={object.material} color={object.color} />
      </mesh>
    </group>
  );
};
