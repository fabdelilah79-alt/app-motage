import type { FC } from 'react';
import { Img } from 'remotion';
import type { ImageElement } from '../../shared/schema';
import { useProjectAssets } from '../ProjectAssetsContext';
import { resolveAssetSrc } from './resolveAssetSrc';

export const ImageElementView: FC<{ element: ImageElement }> = ({ element }) => {
  const location = useProjectAssets();
  const asset = location.assets.find((item) => item.id === element.assetId);
  if (!asset) {
    return null;
  }
  return (
    <Img
      src={resolveAssetSrc(asset, location)}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: element.fit }}
    />
  );
};
