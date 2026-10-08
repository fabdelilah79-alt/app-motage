import type { FC } from 'react';
import { DoubleSide } from 'three';
import type { Material3D } from '../../shared/schema';

type Props = { kind: Material3D; color: string; opacity?: number; vertexColors?: boolean };

/** Matériaux harmonisés : mat, brillant, filaire, translucide. */
export const Material3DView: FC<Props> = ({ kind, color, opacity = 1, vertexColors = false }) => {
  const shown = vertexColors ? '#ffffff' : color;
  const common = { color: shown, vertexColors, side: DoubleSide };
  switch (kind) {
    case 'matte':
      return (
        <meshStandardMaterial {...common} roughness={0.85} metalness={0} transparent={opacity < 1} opacity={opacity} />
      );
    case 'glossy':
      return (
        <meshStandardMaterial {...common} roughness={0.22} metalness={0.2} transparent={opacity < 1} opacity={opacity} />
      );
    case 'wireframe':
      return <meshBasicMaterial {...common} wireframe transparent={opacity < 1} opacity={opacity} />;
    case 'translucent':
      return (
        <meshStandardMaterial {...common} roughness={0.4} transparent opacity={0.45 * opacity} depthWrite={false} />
      );
  }
};
