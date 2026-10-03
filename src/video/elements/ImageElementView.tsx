import type { FC } from 'react';
import { Img } from 'remotion';
import type { ImageElement } from '../../shared/schema';
import { useProjectAsset } from '../ProjectAssetsContext';
import { resolveAssetSrc } from './resolveAssetSrc';

export const ImageElementView: FC<{ element: ImageElement }> = ({ element }) => {
  const asset = useProjectAsset(element.assetId);
  if (!asset) {
    return null;
  }
  return (
    <Img
      src={resolveAssetSrc(asset.src)}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: element.fit }}
    />
  );
};
