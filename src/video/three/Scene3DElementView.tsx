import { ThreeCanvas } from '@remotion/three';
import type { FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { Scene3DElement } from '../../shared/schema';
import type { AnimationFrame } from '../animations/types';
import { useProjectSettings } from '../ProjectSettingsContext';
import { useTheme } from '../themes/ThemeContext';
import { Axes3DView } from './Axes3DView';
import { CAMERA_Z, cameraStateAt, worldTransform } from './camera';
import { Labels3D } from './Labels3D';
import { labelsAt } from './labelAnchors3d';
import { Object3DView } from './Objects3D';

/**
 * Scène 3D (Three.js via @remotion/three). La caméra Three.js est fixe : la scène tourne
 * (orbite, vues de face / dessus / profil) et se rapproche (zoom) selon la frame courante,
 * sans aucune animation autonome. Éclairage aux couleurs du thème.
 */
export const Scene3DElementView: FC<{ element: Scene3DElement; animation: AnimationFrame }> = ({
  element,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { defaultLang, previewScale } = useProjectSettings();
  // Aperçu réduit dans l'éditeur : moins de pixels à calculer (l'export reste en pleine résolution).
  const dpr = previewScale ? Math.max(0.25, Math.min(1, previewScale * 1.25)) : 1;
  const { width, height } = element.transform;
  const camera = cameraStateAt(element.camera, frame, fps);
  const world = worldTransform(camera);
  const { palette } = theme;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: element.background }}>
      <ThreeCanvas
        key={camera.fov}
        width={width}
        height={height}
        camera={{ position: [0, 0, CAMERA_Z], fov: camera.fov, near: 0.1, far: 500 }}
        dpr={dpr}
        gl={{ alpha: true, antialias: !previewScale, preserveDrawingBuffer: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <hemisphereLight args={['#ffffff', palette.background, 0.9]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[8, 12, 10]} intensity={1.4} />
        <directionalLight position={[-6, -4, -8]} intensity={0.35} color={palette.accent1} />
        <group rotation={[world.rotationX, 0, 0]}>
          <group rotation={[0, world.rotationY, 0]} scale={world.scale}>
            <Axes3DView
              axes={element.axes}
              colors={[palette.accent1, palette.accent2, palette.accent3]}
              gridColor={palette.grid}
            />
            {element.objects.map((object) => (
              <Object3DView key={object.id} object={object} frame={frame} />
            ))}
          </group>
        </group>
      </ThreeCanvas>
      <Labels3D
        labels={labelsAt(element, frame, palette.text)}
        camera={camera}
        width={width}
        height={height}
        defaultLang={defaultLang}
      />
    </div>
  );
};
