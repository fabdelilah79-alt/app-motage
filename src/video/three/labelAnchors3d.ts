import type { Lang, Object3D, Scene3DElement, Vec3 } from '../../shared/schema';
import { scopeAt } from '../science/plot/animatable';
import { curvePoints, visiblePoints } from './geometry3d';

export type Label3D = {
  key: string;
  position: Vec3;
  text: string;
  color: string;
  lang: Lang | undefined;
  fontSize: number;
  opacity: number;
};

const progressOf = (object: Object3D, frame: number) =>
  object.duration <= 0
    ? frame >= object.start
      ? 1
      : 0
    : Math.min(1, Math.max(0, (frame - object.start) / object.duration));

/** Point où afficher le nom d'un objet (bout de la flèche, haut du solide, bout de la courbe…). */
const anchorOf = (object: Object3D, frame: number): Vec3 | null => {
  switch (object.kind) {
    case 'arrow':
      return object.to;
    case 'solid':
      return [object.position[0], object.position[1], object.position[2] + object.size * 0.75];
    case 'label':
      return object.position;
    case 'surface':
      return [object.xMax, object.yMax, 0];
    case 'curve': {
      const points = curvePoints(object, object.tMin, object.tMax, scopeAt(object.params, frame), 200);
      const visible = visiblePoints(points, progressOf(object, frame));
      return visible[visible.length - 1] ?? null;
    }
    case 'vectorField':
      return [object.extent, object.extent, object.extent];
  }
};

/** Étiquettes à afficher : noms des axes et des objets, textes libres. */
export const labelsAt = (element: Scene3DElement, frame: number, axisColor: string): Label3D[] => {
  const labels: Label3D[] = [];
  const { axes } = element;
  if (axes.show && axes.labels) {
    const tip = axes.size * 1.2;
    const axisLabels: [string, Vec3][] = [
      [axes.xLabel, [tip, 0, 0]],
      [axes.yLabel, [0, tip, 0]],
      [axes.zLabel, [0, 0, tip]],
    ];
    axisLabels.forEach(([text, position], index) => {
      if (text) labels.push({ key: `axis-${index}`, position, text, color: axisColor, lang: undefined, fontSize: 32, opacity: 1 });
    });
  }
  for (const object of element.objects) {
    const text = object.kind === 'label' ? object.text : object.label;
    if (!text) continue;
    const position = anchorOf(object, frame);
    const opacity = progressOf(object, frame);
    if (!position || opacity <= 0) continue;
    labels.push({
      key: object.id,
      position,
      text,
      color: object.color,
      lang: object.kind === 'label' ? object.lang : undefined,
      fontSize: object.kind === 'label' ? object.fontSize : 34,
      opacity,
    });
  }
  return labels;
};

/** Une étiquette contenant du LaTeX (\vec{B}, B_0, v^2…) est rendue par MathJax. */
export const isLatexLabel = (text: string) => /[\\^_]/.test(text);
