import type { Lang } from '../schema';

/** Paramètre réglable d'une simulation, avec son unité et ses bornes. */
export type SimParam = {
  key: string;
  /** Symbole LaTeX (ex. « L », « \theta_0 »). */
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  name: Record<Lang, string>;
};

/** Grandeur calculée, affichable en valeur numérique ou en graphique synchronisé. */
export type Quantity = { key: string; symbol: string; unit: string; name: Record<Lang, string> };

export type SimCategory = 'mechanics' | 'waves' | 'electricity' | 'optics' | 'misc';

/** Résultat pré-calculé : une valeur par frame de la vidéo pour chaque grandeur (+ « t »). */
export type SimResult = Record<string, number[]>;

export type SimulationModel = {
  id: string;
  category: SimCategory;
  /** Simulation prioritaire de la v1 (★ du plan). */
  star: boolean;
  name: Record<Lang, string>;
  params: readonly SimParam[];
  quantities: readonly Quantity[];
  /** Vecteurs que la vue sait dessiner (vitesse, accélération, forces…). */
  vectors: readonly string[];
  /** Grandeur proposée par défaut pour le graphique synchronisé. */
  defaultGraph: string;
  /**
   * Calcule les grandeurs aux instants t = k × interval (k = 0 … count − 1), en secondes de
   * temps simulé. Intégration à pas fixe pour les équations différentielles.
   */
  compute: (params: Readonly<Record<string, number>>, interval: number, count: number) => SimResult;
};
