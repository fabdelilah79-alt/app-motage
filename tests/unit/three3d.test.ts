import { Group, PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { camera3DSchema, sceneElementSchema, scene3dElementSchema, type Vec3 } from '../../src/shared/schema';
import { FORMAT_PRESETS } from '../../src/shared/formats';
import { createScene3DElement, SCENE3D_PRESETS } from '../../src/shared/threeFactories';
import { CAMERA_Z, cameraStateAt, projectPoint, toThree, worldTransform } from '../../src/video/three/camera';
import { curvePoints, fieldArrows, heightColor, surfaceData, visiblePoints } from '../../src/video/three/geometry3d';
import { isLatexLabel, labelsAt } from '../../src/video/three/labels3d';

const W = 1600;
const H = 900;
const view = (azimuth: number, elevation: number, distance = 16) =>
  cameraStateAt(
    camera3DSchema.parse({ azimuth: { value: azimuth }, elevation: { value: elevation }, distance: { value: distance } }),
    0,
    30,
  );

/** Même calcul avec Three.js (groupes imbriqués + caméra perspective), pour vérifier. */
const projectWithThree = (point: Vec3, state: ReturnType<typeof view>) => {
  const world = worldTransform(state);
  const outer = new Group();
  outer.rotation.x = world.rotationX;
  const inner = new Group();
  inner.rotation.y = world.rotationY;
  inner.scale.setScalar(world.scale);
  outer.add(inner);
  outer.updateMatrixWorld(true);
  const camera = new PerspectiveCamera(state.fov, W / H, 0.1, 500);
  camera.position.set(0, 0, CAMERA_Z);
  camera.updateMatrixWorld(true);
  const ndc = new Vector3(...toThree(point)).applyMatrix4(inner.matrixWorld).project(camera);
  return { x: ((ndc.x + 1) / 2) * W, y: ((1 - ndc.y) / 2) * H };
};

describe('caméra 3D', () => {
  it('orbite continue et valeurs animées', () => {
    const camera = camera3DSchema.parse({
      azimuth: { value: 0 },
      distance: { value: 20, to: 10, start: 0, duration: 60, easing: 'linear' },
      orbitSpeed: 30,
    });
    const state = cameraStateAt(camera, 60, 30);
    expect(state.azimuth).toBe(60);
    expect(state.distance).toBe(10);
    expect(cameraStateAt(camera3DSchema.parse({ elevation: { value: 120 } }), 0, 30).elevation).toBe(89);
  });

  it('les étiquettes sont placées exactement comme Three.js projette les points', () => {
    for (const state of [view(35, 25), view(0, 0), view(120, 60, 9), view(-40, -10, 25)]) {
      for (const point of [[0, 0, 0], [3, 0, 0], [0, 4, 0], [1, -2, 3]] as Vec3[]) {
        const ours = projectPoint(point, state, W, H);
        const three = projectWithThree(point, state);
        expect(ours.x).toBeCloseTo(three.x, 3);
        expect(ours.y).toBeCloseTo(three.y, 3);
      }
    }
  });

  it('vues de face, de dessus et zoom', () => {
    const front = view(0, 0);
    expect(projectPoint([0, 0, 0], front, W, H)).toMatchObject({ x: W / 2, y: H / 2 });
    expect(projectPoint([2, 0, 0], front, W, H).x).toBeGreaterThan(W / 2);
    expect(projectPoint([0, 0, 2], front, W, H).y).toBeLessThan(H / 2);
    expect(projectPoint([0, 2, 0], view(0, 89), W, H).y).toBeLessThan(H / 2);
    const far = projectPoint([2, 0, 0], view(0, 0, 20), W, H).x - W / 2;
    const near = projectPoint([2, 0, 0], view(0, 0, 10), W, H).x - W / 2;
    expect(near / far).toBeCloseTo(2);
  });
});

describe('géométrie 3D', () => {
  it('surface z = x·y : grille, triangles et valeurs', () => {
    const data = surfaceData('x*y', { xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, 4, {});
    expect(data.points).toHaveLength(25);
    expect(data.indices).toHaveLength(4 * 4 * 6);
    expect(data.points[0]).toEqual([-1, -1, 1]);
    expect(data.zMax).toBe(1);
    expect(data.zMin).toBe(-1);
    expect(surfaceData('ln(x)', { xMin: -1, xMax: 1, yMin: 0, yMax: 1 }, 2, {}).points[0]?.[2]).toBe(0);
  });

  it('hélice : rayon constant et montée régulière', () => {
    const points = curvePoints({ x: 'R*cos(omega*t)', y: 'R*sin(omega*t)', z: 'v*t' }, 0, 8, { R: 2, ω: 2.5, v: 1 }, 80);
    expect(points).toHaveLength(81);
    for (const [x, y, z] of points) expect(Math.hypot(x, y)).toBeCloseTo(2);
    expect(points[80]?.[2]).toBeCloseTo(8);
    expect(visiblePoints(points, 0.5)).toHaveLength(41);
    expect(visiblePoints(points, 0)).toHaveLength(2);
  });

  it('champ uniforme : flèches parallèles de longueur bornée', () => {
    const arrows = fieldArrows({ fx: '0', fy: '0', fz: '10' }, 3, 4, 1, {});
    expect(arrows).toHaveLength(27);
    for (const { from, to } of arrows) {
      expect(to[0]).toBe(from[0]);
      expect(to[1]).toBe(from[1]);
      expect(to[2] - from[2]).toBeCloseTo(4 * 0.9);
    }
    expect(fieldArrows({ fx: '0', fy: '0', fz: '0' }, 3, 4, 1, {})).toHaveLength(0);
  });

  it('couleurs selon la hauteur', () => {
    expect(heightColor(0)).toEqual([0.15, 0.3, 0.85]);
    heightColor(1).forEach((value, index) => expect(value).toBeCloseTo([0.9, 0.25, 0.2][index] ?? 0));
    expect(heightColor(2)).toEqual(heightColor(1));
  });
});

describe('scènes 3D', () => {
  const format = FORMAT_PRESETS.landscape;

  it.each(SCENE3D_PRESETS)('modèle « %s » valide', (preset) => {
    const element = createScene3DElement(format, 300, preset, () => 'x');
    expect(sceneElementSchema.parse(element)).toEqual(element);
  });

  it('étiquettes : axes, objets apparus, arabe', () => {
    const element = scene3dElementSchema.parse({
      ...createScene3DElement(format, 300, 'helix'),
      objects: [
        { id: 'a', kind: 'arrow', label: '\\vec{B}', start: 10, duration: 10 },
        { id: 'l', kind: 'label', text: 'مسار', lang: 'ar', duration: 0 },
      ],
    });
    expect(labelsAt(element, 0, '#fff').map((label) => label.key)).toEqual(['axis-0', 'axis-1', 'axis-2', 'l']);
    const later = labelsAt(element, 20, '#fff');
    expect(later.find((label) => label.key === 'a')?.position).toEqual([0, 0, 3]);
    expect(later.find((label) => label.key === 'l')?.lang).toBe('ar');
    expect(isLatexLabel('\\vec{B}')).toBe(true);
    expect(isLatexLabel('مسار حلزوني')).toBe(false);
  });
});
