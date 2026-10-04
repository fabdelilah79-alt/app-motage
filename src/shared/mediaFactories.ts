import { enterFade, randomId, type IdGenerator } from './factories';
import type {
  Asset,
  IconElement,
  ImageElement,
  ProjectFormat,
  SceneElement,
  ShapeElement,
  ShapeKind,
} from './schema';

const centeredTransform = (format: ProjectFormat, width: number, height: number) => ({
  x: Math.round((format.width - width) / 2),
  y: Math.round((format.height - height) / 2),
  width: Math.round(width),
  height: Math.round(height),
  rotation: 0,
  scale: 1,
  opacity: 1,
});

/** Taille d'un média centré : la moitié du plus petit côté, en respectant ses proportions. */
const mediaSize = (format: ProjectFormat, asset: Asset) => {
  const base = Math.min(format.width, format.height) * 0.5;
  const { width, height } = asset.meta;
  if (!width || !height) return { width: base, height: base };
  const ratio = width / height;
  return ratio >= 1 ? { width: base * ratio, height: base } : { width: base, height: base / ratio };
};

const baseFields = (prefix: string, name: string, newId: IdGenerator) => ({
  id: `${prefix}-${newId()}`,
  name,
  locked: false,
  hidden: false,
});

const mediaFrame = { mask: 'none' as const, cornerRadius: 32, shadow: false };

/** Image centrée, visible pendant toute la scène. */
export const createImageElement = (
  format: ProjectFormat,
  sceneDuration: number,
  asset: Asset,
  newId: IdGenerator = randomId,
): ImageElement => {
  const size = mediaSize(format, asset);
  return {
    ...baseFields('image', asset.name, newId),
    type: 'image',
    assetId: asset.id,
    fit: 'contain',
    ...mediaFrame,
    crop: { top: 0, right: 0, bottom: 0, left: 0 },
    kenBurns: { zoom: 1, panX: 0, panY: 0 },
    transform: centeredTransform(format, size.width, size.height),
    timing: { from: 0, duration: sceneDuration },
    animations: { enter: enterFade() },
  };
};

/** Élément adapté au type du média : image, GIF, vidéo ou animation Lottie. */
export const createMediaElement = (
  format: ProjectFormat,
  sceneDuration: number,
  asset: Asset,
  newId: IdGenerator = randomId,
): SceneElement | undefined => {
  const size = mediaSize(format, asset);
  const common = {
    assetId: asset.id,
    transform: centeredTransform(format, size.width, size.height),
    timing: { from: 0, duration: sceneDuration },
    animations: { enter: enterFade() },
  };
  switch (asset.kind) {
    case 'image':
      return createImageElement(format, sceneDuration, asset, newId);
    case 'gif':
      return {
        ...baseFields('gif', asset.name, newId),
        ...common,
        type: 'gif',
        fit: 'contain',
        playbackRate: 1,
      };
    case 'lottie':
      return {
        ...baseFields('lottie', asset.name, newId),
        ...common,
        type: 'lottie',
        loop: true,
        playbackRate: 1,
      };
    case 'video': {
      const seconds = asset.meta.durationInSeconds;
      const ownDuration = seconds ? Math.ceil(seconds * format.fps) : sceneDuration;
      const duration = Math.min(sceneDuration, ownDuration);
      return {
        ...baseFields('video', asset.name, newId),
        ...common,
        type: 'video',
        fit: 'cover',
        ...mediaFrame,
        timing: { from: 0, duration },
        trimStart: 0,
        playbackRate: 1,
        volume: 1,
        muted: false,
        loop: false,
      };
    }
    case 'audio':
      return undefined; // un son n'est pas un élément visuel (voix off ou musique)
  }
};

export const createIconElement = (
  format: ProjectFormat,
  sceneDuration: number,
  iconId: string,
  newId: IdGenerator = randomId,
): IconElement => {
  const size = Math.min(format.width, format.height) * 0.2;
  return {
    ...baseFields('icon', '', newId),
    type: 'icon',
    iconId,
    color: '#0f172a',
    strokeWidth: 2,
    transform: centeredTransform(format, size, size),
    timing: { from: 0, duration: sceneDuration },
    animations: { enter: enterFade() },
  };
};

export const createShapeElement = (
  format: ProjectFormat,
  sceneDuration: number,
  shape: ShapeKind,
  newId: IdGenerator = randomId,
): ShapeElement => {
  const size = Math.min(format.width, format.height) * 0.3;
  const flat = shape === 'line' || shape === 'arrow' || shape === 'curvedArrow';
  return {
    ...baseFields('shape', '', newId),
    type: 'shape',
    shape,
    fill: flat ? 'none' : '#38bdf8',
    stroke: '#0f172a',
    strokeWidth: flat ? 8 : 4,
    sides: shape === 'star' ? 5 : 6,
    transform: centeredTransform(format, size * (flat ? 1.6 : 1), flat ? size * 0.5 : size),
    timing: { from: 0, duration: sceneDuration },
    animations: { enter: enterFade() },
  };
};
