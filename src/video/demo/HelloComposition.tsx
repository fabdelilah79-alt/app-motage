import type { CSSProperties, FC } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fadeInOpacity } from '../animations/fade';

// Composition de démonstration de la phase 0 : « Bonjour / مرحبا / Hello » en fondu.
export const HELLO_COMPOSITION = {
  durationInFrames: 150,
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

// Polices système provisoires : les polices locales (.woff2) arrivent en phase 1.
const LATIN_FONT = 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const ARABIC_FONT = '"Noto Naskh Arabic", "Segoe UI", Tahoma, "Geeza Pro", sans-serif';

type HelloLine = { text: string; lang: 'fr' | 'ar' | 'en'; dir: 'ltr' | 'rtl' };

const LINES: HelloLine[] = [
  { text: 'Bonjour', lang: 'fr', dir: 'ltr' },
  { text: 'مرحبا', lang: 'ar', dir: 'rtl' },
  { text: 'Hello', lang: 'en', dir: 'ltr' },
];

const containerStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 40,
};

const lineStyle: CSSProperties = {
  color: '#f8fafc',
  fontSize: 140,
  fontWeight: 700,
  lineHeight: 1.3,
  // Règle arabe : jamais d'espacement entre les lettres (cela casse les liaisons).
  letterSpacing: 0,
};

export const HelloComposition: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeDuration = fps;
  const delayBetweenLines = Math.round(fps / 2);

  return (
    <AbsoluteFill style={containerStyle}>
      {LINES.map((line, index) => (
        <div
          key={line.lang}
          lang={line.lang}
          dir={line.dir}
          style={{
            ...lineStyle,
            fontFamily: line.lang === 'ar' ? ARABIC_FONT : LATIN_FONT,
            opacity: fadeInOpacity(frame, index * delayBetweenLines, fadeDuration),
          }}
        >
          {line.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};
