import { create } from 'zustand';

/** Étapes du guide, dans l'ordre ; chacune désigne une zone marquée data-tour="…". */
export const TOUR_STEPS = ['library', 'canvas', 'properties', 'timeline', 'theme', 'export'] as const;
export type TourStep = (typeof TOUR_STEPS)[number];

const SEEN_KEY = 'physimotion.tourSeen';

/** Le guide a-t-il déjà été vu sur cet ordinateur ? (stockage local, facultatif) */
export const tourAlreadySeen = (): boolean => {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    window.localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Stockage indisponible (navigation privée) : le guide pourra réapparaître.
  }
};

type TourState = {
  index: number | null;
  start: () => void;
  next: () => void;
  previous: () => void;
  close: () => void;
};

export const useTourStore = create<TourState>((set) => ({
  index: null,
  start: () => set({ index: 0 }),
  next: () =>
    set((state) => {
      if (state.index === null) return state;
      if (state.index >= TOUR_STEPS.length - 1) {
        markSeen();
        return { index: null };
      }
      return { index: state.index + 1 };
    }),
  previous: () => set((state) => ({ index: state.index === null ? null : Math.max(0, state.index - 1) })),
  close: () => {
    markSeen();
    set({ index: null });
  },
}));
