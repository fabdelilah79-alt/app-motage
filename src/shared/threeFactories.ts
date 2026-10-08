import { enterFade, randomId, type IdGenerator } from './factories';
import type { Object3D, ProjectFormat, Scene3DElement } from './schema';

export const SCENE3D_PRESETS = ['empty', 'surface', 'helix', 'field', 'solids'] as const;
export type Scene3DPreset = (typeof SCENE3D_PRESETS)[number];

const fixed = (value: number) => ({ value, start: 0, duration: 60, easing: 'smooth' as const });

const objectBase = (id: string, color: string, start = 0, duration = 30) => ({
  id,
  color,
  material: 'glossy' as const,
  start,
  duration,
  params: {},
  label: '',
});

/** Objets de départ selon le modèle choisi dans la bibliothèque. */
const presetObjects = (preset: Scene3DPreset, newId: IdGenerator): Object3D[] => {
  const id = (prefix: string) => `${prefix}-${newId()}`;
  switch (preset) {
    case 'empty':
      return [];
    case 'surface':
      return [
        {
          ...objectBase(id('surface'), 'theme.accent1', 0, 45),
          kind: 'surface',
          material: 'matte',
          expr: '2*sin(x)*cos(y)',
          xMin: -4,
          xMax: 4,
          yMin: -4,
          yMax: 4,
          resolution: 48,
          heightColors: true,
        },
      ];
    case 'helix':
      // Particule chargée dans un champ magnétique uniforme B (selon z) : trajectoire en hélice.
      return [
        {
          ...objectBase(id('field'), 'theme.accent3', 0, 20),
          kind: 'vectorField',
          material: 'translucent',
          fx: '0',
          fy: '0',
          fz: '1',
          count: 3,
          extent: 4,
          scale: 2,
        },
        {
          ...objectBase(id('b'), 'theme.accent3', 0, 20),
          kind: 'arrow',
          from: [4.5, -4.5, -2],
          to: [4.5, -4.5, 3],
          radius: 0.08,
          label: '\\vec{B}',
        },
        {
          ...objectBase(id('helix'), 'theme.accent1', 20, 160),
          kind: 'curve',
          x: 'R*cos(omega*t)',
          y: 'R*sin(omega*t)',
          z: 'v*t - 4',
          tMin: 0,
          tMax: 8,
          radius: 0.07,
          particle: true,
          params: { R: fixed(2), omega: fixed(2.5), v: fixed(1) },
          label: 'q',
        },
      ];
    case 'field':
      return [
        {
          ...objectBase(id('field'), 'theme.accent2', 0, 30),
          kind: 'vectorField',
          fx: '-y',
          fy: 'x',
          fz: '0',
          count: 5,
          extent: 4,
          scale: 0.5,
        },
      ];
    case 'solids':
      return [
        { ...objectBase(id('sphere'), 'theme.accent1'), kind: 'solid', shape: 'sphere', position: [-2.5, 0, 1], size: 2, rotation: [0, 0, 0] },
        { ...objectBase(id('cube'), 'theme.accent2', 10), kind: 'solid', shape: 'cube', position: [0, 0, 0.8], size: 1.6, rotation: [0, 0, 20] },
        { ...objectBase(id('cone'), 'theme.accent3', 20), kind: 'solid', shape: 'cone', position: [2.5, 0, 1], size: 2, rotation: [0, 0, 0] },
      ];
  }
};

/** Scène 3D centrée, avec repère et caméra en vue « 3/4 » ; l'hélice tourne en orbite. */
export const createScene3DElement = (
  format: ProjectFormat,
  duration: number,
  preset: Scene3DPreset,
  newId: IdGenerator = randomId,
): Scene3DElement => {
  const width = Math.round(format.width * 0.7);
  const height = Math.round(format.height * 0.8);
  return {
    id: `scene3d-${newId()}`,
    name: '',
    locked: false,
    hidden: false,
    type: 'scene3d',
    transform: {
      x: Math.round((format.width - width) / 2),
      y: Math.round((format.height - height) / 2),
      width,
      height,
      rotation: 0,
      scale: 1,
      opacity: 1,
    },
    timing: { from: 0, duration },
    animations: { enter: enterFade(), emphasis: [] },
    camera: {
      azimuth: fixed(35),
      elevation: fixed(25),
      distance: fixed(16),
      orbitSpeed: preset === 'helix' ? 20 : 0,
      fov: 40,
    },
    axes: { show: true, size: 5, grid: true, labels: true, xLabel: 'x', yLabel: 'y', zLabel: 'z' },
    objects: presetObjects(preset, newId),
    background: 'transparent',
  };
};
