import {
  calloutKindSchema,
  chartKindSchema,
  langSchema,
  type CalloutElement,
  type ChartElement,
  type DiagramElement,
  type DimensionElement,
  type MathElement,
  type Plot2DElement,
  type VectorElement,
} from '../../shared/schema';
import type { FieldDescriptor } from './fieldDescriptors';
import { booleanField, colorField, numberField, selectField, textField } from './fieldHelpers';

const ALIGN = ['start', 'center', 'end'] as const;

export const MATH_FIELDS: FieldDescriptor<MathElement>[] = [
  colorField<MathElement>('color', 'fields.color', (e) => e.color, (e, v) => void (e.color = v)),
  numberField<MathElement>('fontSize', 'fields.fontSize', (e) => e.fontSize, (e, v) => void (e.fontSize = Math.max(8, v)), { min: 8, step: 4 }),
  selectField<MathElement, (typeof ALIGN)[number]>('align', 'fields.align', ALIGN, 'science.align', (e) => e.align, (e, v) => void (e.align = v)),
];

export const PLOT_FIELDS: FieldDescriptor<Plot2DElement>[] = [
  numberField<Plot2DElement>('axesFontSize', 'fields.fontSize', (e) => e.axes.fontSize, (e, v) => void (e.axes.fontSize = Math.max(8, v)), { min: 8, step: 2 }),
  colorField<Plot2DElement>('axesColor', 'science.axesColor', (e) => e.axes.color, (e, v) => void (e.axes.color = v)),
  colorField<Plot2DElement>('gridColor', 'science.gridColor', (e) => e.axes.gridColor, (e, v) => void (e.axes.gridColor = v)),
  booleanField<Plot2DElement>('grid', 'science.grid', (e) => e.axes.grid, (e, v) => void (e.axes.grid = v)),
  booleanField<Plot2DElement>('arrows', 'science.arrows', (e) => e.axes.arrows, (e, v) => void (e.axes.arrows = v)),
  booleanField<Plot2DElement>('showNumbers', 'science.showNumbers', (e) => e.axes.showNumbers, (e, v) => void (e.axes.showNumbers = v)),
];

export const CHART_FIELDS: FieldDescriptor<ChartElement>[] = [
  selectField<ChartElement, ChartElement['chartKind']>('chartKind', 'science.chartKind', chartKindSchema.options, 'science.chartKinds', (e) => e.chartKind, (e, v) => void (e.chartKind = v), 'content'),
  textField<ChartElement>('unit', 'science.unit', (e) => e.unit, (e, v) => void (e.unit = v)),
  booleanField<ChartElement>('showValues', 'science.showValues', (e) => e.showValues, (e, v) => void (e.showValues = v), 'content'),
  numberField<ChartElement>('growDuration', 'science.growDuration', (e) => e.growDuration, (e, v) => void (e.growDuration = Math.max(1, Math.round(v))), { tab: 'content', kind: 'seconds', min: 0.1, step: 0.1 }),
  numberField<ChartElement>('stagger', 'science.stagger', (e) => e.stagger, (e, v) => void (e.stagger = Math.max(0, Math.round(v))), { tab: 'content', kind: 'seconds', min: 0, step: 0.1 }),
  colorField<ChartElement>('textColor', 'fields.color', (e) => e.textColor, (e, v) => void (e.textColor = v)),
  numberField<ChartElement>('fontSize', 'fields.fontSize', (e) => e.fontSize, (e, v) => void (e.fontSize = Math.max(8, v)), { min: 8, step: 2 }),
];

export const VECTOR_FIELDS: FieldDescriptor<VectorElement>[] = [
  textField<VectorElement>('label', 'science.vectorLabel', (e) => e.label, (e, v) => void (e.label = v)),
  numberField<VectorElement>('value', 'science.vectorValue', (e) => e.value, (e, v) => void (e.value = Math.max(0, v)), { tab: 'content', min: 0, step: 0.5 }),
  textField<VectorElement>('unit', 'science.unit', (e) => e.unit, (e, v) => void (e.unit = v)),
  numberField<VectorElement>('angle', 'science.angle', (e) => e.angle, (e, v) => void (e.angle = v), { tab: 'content', step: 5 }),
  numberField<VectorElement>('pxPerUnit', 'science.pxPerUnit', (e) => e.pxPerUnit, (e, v) => void (e.pxPerUnit = Math.max(0.1, v)), { tab: 'content', min: 0.1, step: 1 }),
  booleanField<VectorElement>('showValue', 'science.showValue', (e) => e.showValue, (e, v) => void (e.showValue = v), 'content'),
  booleanField<VectorElement>('showComponents', 'science.showComponents', (e) => e.showComponents, (e, v) => void (e.showComponents = v), 'content'),
  booleanField<VectorElement>('showAngle', 'science.showAngle', (e) => e.showAngle, (e, v) => void (e.showAngle = v), 'content'),
  numberField<VectorElement>('originX', 'science.originX', (e) => e.originX, (e, v) => void (e.originX = Math.min(1, Math.max(0, v))), { kind: 'percent', min: 0, max: 100, step: 5 }),
  numberField<VectorElement>('originY', 'science.originY', (e) => e.originY, (e, v) => void (e.originY = Math.min(1, Math.max(0, v))), { kind: 'percent', min: 0, max: 100, step: 5 }),
  colorField<VectorElement>('color', 'fields.color', (e) => e.color, (e, v) => void (e.color = v)),
  colorField<VectorElement>('componentColor', 'science.componentColor', (e) => e.componentColor, (e, v) => void (e.componentColor = v)),
  numberField<VectorElement>('strokeWidth', 'media.strokeWidth', (e) => e.strokeWidth, (e, v) => void (e.strokeWidth = v), { min: 1, max: 20, step: 1 }),
];

export const DIMENSION_FIELDS: FieldDescriptor<DimensionElement>[] = [
  textField<DimensionElement>('label', 'science.dimensionLabel', (e) => e.label, (e, v) => void (e.label = v)),
  selectField<DimensionElement, DimensionElement['lang']>('lang', 'fields.lang', langSchema.options, 'langs', (e) => e.lang, (e, v) => void (e.lang = v), 'content'),
  colorField<DimensionElement>('color', 'fields.color', (e) => e.color, (e, v) => void (e.color = v)),
  numberField<DimensionElement>('strokeWidth', 'media.strokeWidth', (e) => e.strokeWidth, (e, v) => void (e.strokeWidth = v), { min: 1, max: 12, step: 1 }),
  numberField<DimensionElement>('fontSize', 'fields.fontSize', (e) => e.fontSize, (e, v) => void (e.fontSize = Math.max(8, v)), { min: 8, step: 2 }),
];

export const DIAGRAM_FIELDS: FieldDescriptor<DiagramElement>[] = [
  textField<DiagramElement>('label', 'science.diagramLabel', (e) => e.label, (e, v) => void (e.label = v)),
  colorField<DiagramElement>('color', 'fields.color', (e) => e.color, (e, v) => void (e.color = v)),
  colorField<DiagramElement>('accent', 'science.accent', (e) => e.accent, (e, v) => void (e.accent = v)),
  colorField<DiagramElement>('fill', 'shapes.fill', (e) => e.fill, (e, v) => void (e.fill = v)),
  numberField<DiagramElement>('strokeWidth', 'media.strokeWidth', (e) => e.strokeWidth, (e, v) => void (e.strokeWidth = v), { min: 1, max: 12, step: 0.5 }),
];

export const CALLOUT_FIELDS: FieldDescriptor<CalloutElement>[] = [
  selectField<CalloutElement, CalloutElement['calloutKind']>('calloutKind', 'science.calloutKind', calloutKindSchema.options, 'science.calloutKinds', (e) => e.calloutKind, (e, v) => void (e.calloutKind = v), 'content'),
  textField<CalloutElement>('title', 'science.calloutTitle', (e) => e.title, (e, v) => void (e.title = v)),
  selectField<CalloutElement, CalloutElement['lang']>('lang', 'fields.lang', langSchema.options, 'langs', (e) => e.lang, (e, v) => void (e.lang = v), 'content'),
  numberField<CalloutElement>('fontSize', 'fields.fontSize', (e) => e.fontSize, (e, v) => void (e.fontSize = Math.max(8, v)), { min: 8, step: 2 }),
];
