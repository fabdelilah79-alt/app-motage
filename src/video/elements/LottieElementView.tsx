import { Lottie, type LottieAnimationData } from '@remotion/lottie';
import { useEffect, useRef, useState, type FC } from 'react';
import { useDelayRender } from 'remotion';
import type { LottieElement } from '../../shared/schema';
import { useProjectAssets } from '../ProjectAssetsContext';
import { resolveAssetSrc } from './resolveAssetSrc';

/** Animation Lottie (fichier JSON) : le rendu attend le chargement du fichier. */
export const LottieElementView: FC<{ element: LottieElement }> = ({ element }) => {
  const location = useProjectAssets();
  const asset = location.assets.find((item) => item.id === element.assetId);
  const src = asset ? resolveAssetSrc(asset, location) : null;
  // Fonctions de blocage du rendu, gardées en référence : rechargement seulement si `src` change.
  const delay = useRef(useDelayRender());
  const [data, setData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    if (!src) return;
    const { delayRender, continueRender, cancelRender } = delay.current;
    const handle = delayRender(`Chargement de l'animation Lottie ${src}`);
    let active = true;
    fetch(src)
      .then((response) => response.json() as Promise<LottieAnimationData>)
      .then((json) => {
        if (active) setData(json);
        continueRender(handle);
      })
      .catch((error: unknown) => cancelRender(error));
    return () => {
      active = false;
    };
  }, [src]);

  if (!data) {
    return null;
  }
  return (
    <Lottie
      animationData={data}
      loop={element.loop}
      playbackRate={element.playbackRate}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
