import type { PlayerRef } from '@remotion/player';
import { createContext, useContext, type RefObject } from 'react';

/** Accès au lecteur Remotion (lecture, pause, déplacement) depuis toute l'interface. */
export const PlayerRefContext = createContext<RefObject<PlayerRef | null> | null>(null);

export const usePlayerRef = (): RefObject<PlayerRef | null> => {
  const ref = useContext(PlayerRefContext);
  if (!ref) {
    throw new Error('PlayerRefContext manquant');
  }
  return ref;
};
