import type { ReactNode } from 'react';
import type { Lang } from '../../../shared/schema';

export type DiagramParamValue = number | string | boolean;
export type DiagramParams = Readonly<Record<string, DiagramParamValue>>;

/** Réglage d'un schéma proposé dans l'interface (libellé traduit par l'éditeur). */
export type DiagramParamField =
  | { key: string; kind: 'number'; min: number; max: number; step: number; default: number }
  | { key: string; kind: 'boolean'; default: boolean }
  | { key: string; kind: 'select'; options: readonly string[]; default: string };

/** Couleurs et trait du schéma ; `draw` (0 → 1) pour l'animation « Tracé ». */
export type DiagramStyle = {
  color: string;
  accent: string;
  fill: string;
  strokeWidth: number;
  draw: { stroke: number; fill: number } | undefined;
};

export type DiagramRenderProps = {
  width: number;
  height: number;
  params: DiagramParams;
  style: DiagramStyle;
};

export type DiagramCategory = 'mechanics' | 'electricity' | 'optics' | 'misc';

export type DiagramDefinition = {
  id: string;
  category: DiagramCategory;
  name: Record<Lang, string>;
  /** Taille conseillée à l'ajout (pixels pour une vidéo 1920 × 1080). */
  size: { width: number; height: number };
  params: readonly DiagramParamField[];
  render: (props: DiagramRenderProps) => ReactNode;
};
