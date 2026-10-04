import type { FC } from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import type { ImageElement } from '../../shared/schema';
import { cropInnerStyle, kenBurnsTransform, mediaFrameStyle } from '../media/frameStyles';
import { useProjectAssets } from '../ProjectAssetsContext';
import { resolveAssetSrc } from './resolveAssetSrc';

/** Image : recadrage, masque, bordure, ombre et effet Ken Burns. */
export const ImageElementView: FC<{ element: ImageElement }> = ({ element }) => {
  const frame = useCurrentFrame();
  const location = useProjectAssets();
  const asset = location.assets.find((item) => item.id === element.assetId);
  if (!asset) {
    return null;
  }
  const progress = interpolate(frame, [0, Math.max(1, element.timing.duration - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={mediaFrameStyle(element)}>
      <div style={cropInnerStyle(element.crop)}>
        <Img
          src={resolveAssetSrc(asset, location)}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: element.fit,
            transform: kenBurnsTransform(element.kenBurns, progress),
          }}
        />
      </div>
    </div>
  );
};
