import type { FC } from 'react';
import { AnimatedImage } from 'remotion';
import type { GifElement } from '../../shared/schema';
import { useProjectAssets } from '../ProjectAssetsContext';
import { resolveAssetSrc } from './resolveAssetSrc';

/** GIF animé, synchronisé image par image avec la vidéo. */
export const GifElementView: FC<{ element: GifElement }> = ({ element }) => {
  const location = useProjectAssets();
  const asset = location.assets.find((item) => item.id === element.assetId);
  if (!asset) {
    return null;
  }
  return (
    <AnimatedImage
      src={resolveAssetSrc(asset, location)}
      fit={element.fit}
      playbackRate={element.playbackRate}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
