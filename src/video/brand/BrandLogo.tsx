import type { CSSProperties, FC } from 'react';
import { Img, useVideoConfig } from 'remotion';
import type { Brand } from '../../shared/schema';
import { resolveAssetSrc } from '../elements/resolveAssetSrc';
import { useProjectAssets } from '../ProjectAssetsContext';

/** Position du logo dans un coin, avec une marge de 3 % de la largeur. */
export const logoPosition = (corner: Brand['logoCorner'], margin: number): CSSProperties => {
  const [vertical, horizontal] = corner.split('-') as ['top' | 'bottom', 'left' | 'right'];
  return { position: 'absolute', [vertical]: margin, [horizontal]: margin };
};

/** Logo du kit de marque, affiché sur toutes les scènes (au-dessus des transitions). */
export const BrandLogo: FC<{ brand: Brand }> = ({ brand }) => {
  const { width } = useVideoConfig();
  const location = useProjectAssets();
  const asset = brand.logoAssetId
    ? location.assets.find((item) => item.id === brand.logoAssetId)
    : undefined;
  if (!asset) return null;
  return (
    <Img
      src={resolveAssetSrc(asset, location)}
      style={{
        ...logoPosition(brand.logoCorner, Math.round(width * 0.03)),
        width: Math.round(width * brand.logoSize),
        height: 'auto',
      }}
    />
  );
};
