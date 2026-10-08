import type { Camera3D, Vec3 } from '../../shared/schema';
import { numberAt } from '../science/plot/animatable';

/** La caméra Three.js reste fixe sur l'axe z ; c'est la scène qui tourne et se rapproche. */
export const CAMERA_Z = 20;

export type CameraState = { azimuth: number; elevation: number; distance: number; fov: number };

/** Cadrage à une frame (relative à l'élément) : valeurs animées + orbite continue. */
export const cameraStateAt = (camera: Camera3D, frame: number, fps: number): CameraState => ({
  azimuth: numberAt(camera.azimuth, frame) + (camera.orbitSpeed * frame) / fps,
  elevation: Math.max(-89, Math.min(89, numberAt(camera.elevation, frame))),
  distance: Math.max(0.5, numberAt(camera.distance, frame)),
  fov: camera.fov,
});

/** Repère physique (z vertical) → repère Three.js (y vertical, z vers l'observateur). */
export const toThree = ([x, y, z]: Vec3): Vec3 => [x, z, -y];

const DEG = Math.PI / 180;

/** Rotation et échelle appliquées au monde pour simuler la caméra (voir Scene3DElementView). */
export const worldTransform = (state: CameraState) => ({
  rotationY: -state.azimuth * DEG,
  rotationX: state.elevation * DEG,
  scale: CAMERA_Z / state.distance,
});

/**
 * Position à l'écran (pixels) d'un point du repère : sert à placer les étiquettes en HTML
 * par-dessus la 3D (texte arabe parfaitement lié, mêmes polices que le reste de la vidéo).
 */
export const projectPoint = (point: Vec3, state: CameraState, width: number, height: number) => {
  const [x0, y0, z0] = toThree(point);
  const { rotationY, rotationX, scale } = worldTransform(state);
  // Rotation autour de y (azimut), puis autour de x (élévation), puis échelle.
  const x1 = x0 * Math.cos(rotationY) + z0 * Math.sin(rotationY);
  const z1 = -x0 * Math.sin(rotationY) + z0 * Math.cos(rotationY);
  const y2 = y0 * Math.cos(rotationX) - z1 * Math.sin(rotationX);
  const z2 = y0 * Math.sin(rotationX) + z1 * Math.cos(rotationX);
  const [x, y, z] = [x1 * scale, y2 * scale, z2 * scale];
  const depth = CAMERA_Z - z;
  const focal = height / 2 / Math.tan((state.fov * DEG) / 2);
  return {
    x: width / 2 + (x * focal) / depth,
    y: height / 2 - (y * focal) / depth,
    depth,
    visible: depth > 0.1,
  };
};
