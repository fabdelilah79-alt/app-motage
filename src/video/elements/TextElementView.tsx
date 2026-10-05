import type { CSSProperties, FC } from 'react';
import type { TextElement } from '../../shared/schema';
import { animatedColor } from '../animations/frameStyles';
import type { AnimationFrame } from '../animations/types';
import { useProjectSettings } from '../ProjectSettingsContext';
import {
  backgroundBoxStyle,
  gradientFillStyle,
  highlightStyle,
  maskClipPath,
  strokeShadowStyles,
} from '../text/effectStyles';
import { fontStackFor } from '../text/fontStack';
import { countRuns } from '../text/counter';
import { RichText } from '../text/RichText';

const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

export const TextElementView: FC<{ element: TextElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const { digits } = useProjectSettings();
  const { lang, style } = element;
  const { effects } = style;
  const isArabic = lang === 'ar';
  const direction = element.direction === 'auto' ? (isArabic ? 'rtl' : 'ltr') : element.direction;
  const reveal = animation.reveal;
  const rtl = direction === 'rtl';
  const mask = reveal?.mode === 'mask' ? maskClipPath(reveal.progress, rtl) : undefined;

  const paragraph: CSSProperties = {
    margin: 0,
    fontFamily: fontStackFor(style, lang),
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    color: animatedColor(style.color, animation),
    lineHeight: style.lineHeight,
    textAlign: style.align,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    // Règles arabes : aucun espacement entre les lettres, aucune transformation de casse.
    letterSpacing: isArabic ? 0 : `${style.letterSpacing}em`,
    textTransform: isArabic ? 'none' : style.textTransform,
    ...strokeShadowStyles(effects, style.color),
    ...backgroundBoxStyle(effects.background),
  };
  const fill: CSSProperties = {
    ...(effects.highlight ? highlightStyle(effects.highlight.color) : {}),
  };

  return (
    <div
      lang={lang}
      dir={direction}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: JUSTIFY[style.align],
        clipPath: mask,
      }}
    >
      <p style={paragraph}>
        <span style={fill}>
          <span style={effects.gradient ? gradientFillStyle(effects.gradient) : undefined}>
            <RichText
              runs={
                animation.counter === undefined
                  ? element.content
                  : countRuns(element.content, animation.counter)
              }
              lang={lang}
              rtl={rtl}
              arabicIndicDigits={isArabic && digits === 'arabic-indic'}
              reveal={reveal?.mode === 'mask' ? undefined : reveal}
              mathColor={effects.gradient?.from}
            />
          </span>
        </span>
      </p>
    </div>
  );
};
