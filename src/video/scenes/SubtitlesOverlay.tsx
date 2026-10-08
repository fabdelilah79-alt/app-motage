import type { FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { SubtitleCue } from '../../shared/schema';
import { activeCue } from '../../shared/subtitles';
import { useProjectSettings } from '../ProjectSettingsContext';
import { containsArabic } from '../text/bidi';
import { toArabicIndicDigits } from '../text/digits';
import { fontStackFor } from '../text/fontStack';
import { useTheme } from '../themes/ThemeContext';

/**
 * Sous-titres incrustés (style du thème) : sens d'écriture détecté pour chaque phrase,
 * texte arabe jamais découpé, nombres et formules isolés par l'algorithme bidi du navigateur.
 */
export const SubtitlesOverlay: FC<{ cues: readonly SubtitleCue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const theme = useTheme();
  const { subtitleStyle, digits } = useProjectSettings();
  if (!subtitleStyle?.burnIn) return null;
  const cue = activeCue(cues, frame);
  if (!cue || !cue.text.trim()) return null;
  const arabic = containsArabic(cue.text);
  const text = arabic && digits === 'arabic-indic' ? toArabicIndicDigits(cue.text) : cue.text;
  const size = subtitleStyle.fontSize * (width / 1920);
  return (
    <div
      style={{
        position: 'absolute',
        left: '8%',
        right: '8%',
        [subtitleStyle.position]: '5%',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <p
        dir={arabic ? 'rtl' : 'auto'}
        lang={arabic ? 'ar' : undefined}
        style={{
          margin: 0,
          padding: subtitleStyle.background ? `${size * 0.2}px ${size * 0.5}px` : 0,
          borderRadius: size * 0.25,
          background: subtitleStyle.background ? `color-mix(in srgb, ${theme.palette.background} 78%, transparent)` : 'transparent',
          color: theme.palette.text,
          fontFamily: fontStackFor({}, arabic ? 'ar' : 'fr', theme.fonts),
          fontSize: size,
          fontWeight: 600,
          lineHeight: 1.35,
          textAlign: 'center',
          letterSpacing: 0,
          unicodeBidi: 'plaintext',
          textShadow: subtitleStyle.background ? undefined : `0 0 ${size * 0.15}px ${theme.palette.background}`,
        }}
      >
        {text}
      </p>
    </div>
  );
};
