import { Video } from '@remotion/media';
import type { FC } from 'react';
import type { VideoElement } from '../../shared/schema';
import { mediaFrameStyle } from '../media/frameStyles';
import { useProjectAssets } from '../ProjectAssetsContext';
import { resolveAssetSrc } from './resolveAssetSrc';

/** Vidéo importée : découpage (début), vitesse, volume, muet, boucle. */
export const VideoElementView: FC<{ element: VideoElement }> = ({ element }) => {
  const location = useProjectAssets();
  const asset = location.assets.find((item) => item.id === element.assetId);
  if (!asset) {
    return null;
  }
  return (
    <div style={mediaFrameStyle(element)}>
      <Video
        src={resolveAssetSrc(asset, location)}
        trimBefore={element.trimStart > 0 ? element.trimStart : undefined}
        playbackRate={element.playbackRate}
        volume={element.volume}
        muted={element.muted}
        loop={element.loop}
        objectFit={element.fit}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
