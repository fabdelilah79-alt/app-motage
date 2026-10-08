import type { FC } from 'react';
import type { CalloutElement } from '../../shared/schema';
import type { AnimationFrame } from '../animations/types';
import { useProjectSettings } from '../ProjectSettingsContext';
import { fontStackFor } from '../text/fontStack';
import { RichText } from '../text/RichText';
import { useTheme } from '../themes/ThemeContext';
import { CALLOUT_STYLES, calloutTitle } from './calloutStyles';

/**
 * Encadré pédagogique (Définition, À retenir, Attention, Exemple, Méthode) : bande de
 * couleur du côté du début de lecture (à droite en arabe), icône, titre et texte riche.
 */
export const CalloutElementView: FC<{ element: CalloutElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const theme = useTheme();
  const { digits } = useProjectSettings();
  const style = CALLOUT_STYLES[element.calloutKind];
  const rtl = element.lang === 'ar';
  const f = element.fontSize;
  const { Icon } = style;

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      lang={element.lang}
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: f * 0.4,
        padding: f * 0.7,
        borderRadius: f * 0.4,
        background: theme.palette.surface,
        borderInlineStart: `${Math.round(f * 0.25)}px solid ${style.color}`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        fontFamily: fontStackFor({}, element.lang, theme.fonts),
        color: theme.palette.text,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: f * 0.4,
          color: style.color,
          fontWeight: 700,
          fontSize: f * 0.9,
        }}
      >
        <Icon width={f} height={f} strokeWidth={2.2} />
        <span>{calloutTitle(element.calloutKind, element.lang, element.title)}</span>
      </div>
      <p style={{ margin: 0, fontSize: f, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
        <RichText
          runs={element.content}
          lang={element.lang}
          rtl={rtl}
          arabicIndicDigits={rtl && digits === 'arabic-indic'}
          reveal={animation.reveal}
        />
      </p>
    </div>
  );
};
