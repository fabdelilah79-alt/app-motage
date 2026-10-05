import { Video } from '@remotion/media';
import type { FC } from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Background } from '../../shared/schema';
import { resolveAssetSrc } from '../elements/resolveAssetSrc';
import { useProjectAssets } from '../ProjectAssetsContext';
import { useProjectSettings } from '../ProjectSettingsContext';
import { useTheme } from '../themes/ThemeContext';
import { particlesAt } from '../themes/particles';
import { resolveColor } from '../themes/themes';
import { backgroundStyle, concreteBackground } from './backgroundStyle';

const Particles: FC<{ count: number; seed: string; color: string }> = ({ count, seed, color }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {particlesAt(count, seed, frame, width, height).map((particle, index) => (
        <circle
          key={index}
          cx={particle.x}
          cy={particle.y}
          r={particle.radius}
          fill={color}
          opacity={particle.opacity}
          style={{ filter: `drop-shadow(0 0 ${particle.radius * 2}px ${color})` }}
        />
      ))}
    </svg>
  );
};

const MediaBackground: FC<{ background: Background }> = ({ background }) => {
  const location = useProjectAssets();
  if (background.type !== 'image' && background.type !== 'video') return null;
  const asset = location.assets.find((item) => item.id === background.assetId);
  if (!asset) return null;
  const src = resolveAssetSrc(asset, location);
  const fill = { width: '100%', height: '100%' };
  if (background.type === 'image') {
    return <Img src={src} style={{ ...fill, objectFit: background.fit }} />;
  }
  return <Video src={src} muted loop objectFit="cover" style={fill} />;
};

/** Fond d'une scène : couleur, dégradé, texture, particules, image ou vidéo (muette, en boucle). */
export const SceneBackground: FC<{ background: Background }> = ({ background }) => {
  const theme = useTheme();
  const { width } = useVideoConfig();
  const { defaultLang } = useProjectSettings();
  const concrete = concreteBackground(background, theme);
  const style = backgroundStyle(background, {
    theme,
    unit: width / 1920,
    rtl: defaultLang === 'ar',
  });
  return (
    <AbsoluteFill style={style}>
      {concrete.type === 'particles' ? (
        <Particles
          count={concrete.count}
          seed={concrete.seed}
          color={resolveColor(concrete.particleColor, theme)}
        />
      ) : null}
      <MediaBackground background={concrete} />
    </AbsoluteFill>
  );
};
