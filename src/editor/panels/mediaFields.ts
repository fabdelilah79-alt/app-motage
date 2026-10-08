import {
  shapeKindSchema,
  type ElementType,
  type GifElement,
  type IconElement,
  type ImageElement,
  type LottieElement,
  type SceneElement,
  type ShapeElement,
  type VideoElement,
} from '../../shared/schema';
import type { FieldDescriptor } from './fieldDescriptors';
import { booleanField, colorField, numberField, selectField } from './fieldHelpers';
import {
  CALLOUT_FIELDS,
  CHART_FIELDS,
  DIAGRAM_FIELDS,
  DIMENSION_FIELDS,
  MATH_FIELDS,
  PLOT_FIELDS,
  VECTOR_FIELDS,
} from './scienceFields';
import { TEXT_FIELDS } from './textFields';

type Framed = ImageElement | VideoElement;

const FIT = ['contain', 'cover'] as const;
const MASKS = ['none', 'rounded', 'circle'] as const;

/** Cadre commun aux images et vidéos : ajustement, masque, coins, ombre. */
const FRAME_FIELDS: FieldDescriptor<Framed>[] = [
  selectField<Framed, (typeof FIT)[number]>(
    'fit',
    'fields.fit',
    FIT,
    'media.fits',
    (e) => e.fit,
    (e, v) => void (e.fit = v),
  ),
  selectField<Framed, (typeof MASKS)[number]>(
    'mask',
    'media.mask',
    MASKS,
    'media.masks',
    (e) => e.mask,
    (e, v) => void (e.mask = v),
  ),
  numberField<Framed>(
    'cornerRadius',
    'media.cornerRadius',
    (e) => e.cornerRadius,
    (e, v) => void (e.cornerRadius = Math.max(0, v)),
    { min: 0, step: 4 },
  ),
  booleanField<Framed>('shadow', 'media.shadow', (e) => e.shadow, (e, v) => void (e.shadow = v)),
];

const IMAGE_FIELDS: FieldDescriptor<ImageElement>[] = [
  ...FRAME_FIELDS,
  ...(['top', 'right', 'bottom', 'left'] as const).map((side) =>
    numberField<ImageElement>(
      `crop-${side}`,
      `media.crop.${side}`,
      (e) => e.crop[side],
      (e, v) => void (e.crop[side] = v),
      { min: 0, max: 90, step: 1 },
    ),
  ),
  numberField<ImageElement>(
    'kenBurnsZoom',
    'media.kenBurnsZoom',
    (e) => e.kenBurns.zoom,
    (e, v) => void (e.kenBurns.zoom = v),
    { min: 1, max: 2, step: 0.05 },
  ),
  numberField<ImageElement>(
    'kenBurnsPanX',
    'media.kenBurnsPanX',
    (e) => e.kenBurns.panX,
    (e, v) => void (e.kenBurns.panX = v),
    { min: -1, max: 1, step: 0.1 },
  ),
  numberField<ImageElement>(
    'kenBurnsPanY',
    'media.kenBurnsPanY',
    (e) => e.kenBurns.panY,
    (e, v) => void (e.kenBurns.panY = v),
    { min: -1, max: 1, step: 0.1 },
  ),
];

const VIDEO_FIELDS: FieldDescriptor<VideoElement>[] = [
  numberField<VideoElement>(
    'trimStart',
    'media.trimStart',
    (e) => e.trimStart,
    (e, v) => void (e.trimStart = Math.max(0, Math.round(v))),
    { tab: 'content', kind: 'seconds', min: 0, step: 0.1 },
  ),
  numberField<VideoElement>(
    'playbackRate',
    'media.playbackRate',
    (e) => e.playbackRate,
    (e, v) => void (e.playbackRate = v),
    { tab: 'content', min: 0.25, max: 4, step: 0.25 },
  ),
  numberField<VideoElement>(
    'volume',
    'media.volume',
    (e) => e.volume,
    (e, v) => void (e.volume = v),
    { tab: 'content', kind: 'percent', min: 0, max: 100, step: 5 },
  ),
  booleanField<VideoElement>(
    'muted',
    'media.muted',
    (e) => e.muted,
    (e, v) => void (e.muted = v),
    'content',
  ),
  booleanField<VideoElement>(
    'loop',
    'media.loop',
    (e) => e.loop,
    (e, v) => void (e.loop = v),
    'content',
  ),
  ...FRAME_FIELDS,
];

const GIF_FIELDS: FieldDescriptor<GifElement>[] = [
  selectField<GifElement, (typeof FIT)[number]>(
    'fit',
    'fields.fit',
    FIT,
    'media.fits',
    (e) => e.fit,
    (e, v) => void (e.fit = v),
  ),
  numberField<GifElement>(
    'playbackRate',
    'media.playbackRate',
    (e) => e.playbackRate,
    (e, v) => void (e.playbackRate = v),
    { tab: 'content', min: 0.25, max: 4, step: 0.25 },
  ),
];

const LOTTIE_FIELDS: FieldDescriptor<LottieElement>[] = [
  booleanField<LottieElement>(
    'loop',
    'media.loop',
    (e) => e.loop,
    (e, v) => void (e.loop = v),
    'content',
  ),
  numberField<LottieElement>(
    'playbackRate',
    'media.playbackRate',
    (e) => e.playbackRate,
    (e, v) => void (e.playbackRate = v),
    { tab: 'content', min: 0.25, max: 4, step: 0.25 },
  ),
];

const ICON_FIELDS: FieldDescriptor<IconElement>[] = [
  colorField<IconElement>('color', 'fields.color', (e) => e.color, (e, v) => void (e.color = v)),
  numberField<IconElement>(
    'strokeWidth',
    'media.strokeWidth',
    (e) => e.strokeWidth,
    (e, v) => void (e.strokeWidth = v),
    { min: 0.5, max: 6, step: 0.25 },
  ),
];

const SHAPE_FIELDS: FieldDescriptor<ShapeElement>[] = [
  selectField<ShapeElement, ShapeElement['shape']>(
    'shape',
    'shapes.kind',
    shapeKindSchema.options,
    'shapes.kinds',
    (e) => e.shape,
    (e, v) => void (e.shape = v),
  ),
  colorField<ShapeElement>(
    'fill',
    'shapes.fill',
    (e) => (e.fill === 'none' ? '#ffffff' : e.fill),
    (e, v) => void (e.fill = v),
  ),
  colorField<ShapeElement>(
    'stroke',
    'shapes.stroke',
    (e) => e.stroke,
    (e, v) => void (e.stroke = v),
  ),
  numberField<ShapeElement>(
    'strokeWidth',
    'media.strokeWidth',
    (e) => e.strokeWidth,
    (e, v) => void (e.strokeWidth = v),
    { min: 0, max: 40, step: 1 },
  ),
  numberField<ShapeElement>(
    'sides',
    'shapes.sides',
    (e) => e.sides,
    (e, v) => void (e.sides = Math.round(v)),
    { min: 3, max: 12, step: 1 },
  ),
];

/** Champs propres à chaque type d'élément (les champs communs sont ajoutés ensuite). */
export const ELEMENT_FIELDS: {
  [Type in ElementType]: FieldDescriptor<Extract<SceneElement, { type: Type }>>[];
} = {
  text: TEXT_FIELDS,
  image: IMAGE_FIELDS,
  video: VIDEO_FIELDS,
  gif: GIF_FIELDS,
  lottie: LOTTIE_FIELDS,
  icon: ICON_FIELDS,
  shape: SHAPE_FIELDS,
  math: MATH_FIELDS,
  plot2d: PLOT_FIELDS,
  chart: CHART_FIELDS,
  vector: VECTOR_FIELDS,
  dimension: DIMENSION_FIELDS,
  diagram: DIAGRAM_FIELDS,
  callout: CALLOUT_FIELDS,
};
