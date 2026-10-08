import { useEffect, useRef, useState, type FC } from 'react';
import { useDelayRender } from 'remotion';
import type { Scene3DElement } from '../../shared/schema';
import type { AnimationFrame } from '../animations/types';

type Props = { element: Scene3DElement; animation: AnimationFrame };
type View = FC<Props>;

let loaded: View | null = null;
let loading: Promise<View> | null = null;

/** Charge le module 3D (Three.js) une seule fois, au premier besoin. */
const loadView = (): Promise<View> => {
  loading ??= import('./Scene3DElementView').then((module) => {
    loaded = module.Scene3DElementView;
    return loaded;
  });
  return loading;
};

/**
 * Scène 3D chargée à la demande : les projets sans 3D n'embarquent pas Three.js. Le rendu
 * attend la fin du chargement (delayRender) : aucune image n'est rendue sans la 3D.
 */
export const LazyScene3DElementView: FC<Props> = (props) => {
  const [View, setView] = useState<View | null>(() => loaded);
  // Fonctions de blocage gardées en référence (identité stable) : un seul chargement.
  const delayFunctions = useDelayRender();
  const delay = useRef(delayFunctions);
  const [handle] = useState(() =>
    loaded ? null : delayFunctions.delayRender('Chargement de la 3D'),
  );

  useEffect(() => {
    if (handle === null) return;
    const { continueRender, cancelRender } = delay.current;
    let active = true;
    loadView().then(
      (view) => {
        if (active) setView(() => view);
        continueRender(handle);
      },
      (error: unknown) => cancelRender(error),
    );
    return () => {
      active = false;
    };
  }, [handle]);

  return View ? <View {...props} /> : null;
};
