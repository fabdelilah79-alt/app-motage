import type { FC } from 'react';
import type { Lang, SimulationElement } from '../../shared/schema';
import type { SimResult } from '../../shared/simulations/types';

export type SimColors = {
  main: string;
  accent: string;
  text: string;
  muted: string;
  surface: string;
  vectors: { velocity: string; acceleration: string; force: string };
};

/** Ce que reçoit la vue d'une simulation à une frame donnée. */
export type SimViewProps = {
  result: SimResult;
  /** Index de l'échantillon courant (frame, ralenti et pause pris en compte). */
  index: number;
  /** Paramètres résolus (bornés, valeurs par défaut). */
  p: (key: string) => number;
  display: SimulationElement['display'];
  width: number;
  height: number;
  colors: SimColors;
  fontFamily: string;
  fontSize: number;
  lang: Lang;
};

export type SimView = FC<SimViewProps>;

/** Valeur d'une grandeur à l'échantillon courant. */
export const valueAt = (result: SimResult, key: string, index: number) => result[key]?.[index] ?? 0;
