import type { FC } from 'react';
import type { TextElement } from '../../shared/schema';
import { DEFAULT_FONT_STACKS } from '../text/fonts';

export const TextElementView: FC<{ element: TextElement }> = ({ element }) => {
  const { lang, style } = element;
  const isArabic = lang === 'ar';
  const direction = element.direction === 'auto' ? (isArabic ? 'rtl' : 'ltr') : element.direction;

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
        fontFamily: style.fontFamily ?? DEFAULT_FONT_STACKS[lang],
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: style.color,
        lineHeight: style.lineHeight,
        textAlign: style.align,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        // Règle arabe : aucun espacement entre les lettres (sinon les liaisons cassent).
        letterSpacing: isArabic ? 0 : undefined,
      }}
    >
      <p style={{ margin: 0 }}>
        {element.content.map((run, index) => (
          <span key={index} style={{ color: run.style?.color, fontWeight: run.style?.fontWeight }}>
            {run.text}
          </span>
        ))}
      </p>
    </div>
  );
};
