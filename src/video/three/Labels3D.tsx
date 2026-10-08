import type { FC } from 'react';
import type { Lang } from '../../shared/schema';
import { InlineMath } from '../science/InlineMath';
import { fontStackFor } from '../text/fontStack';
import { useTheme } from '../themes/ThemeContext';
import type { CameraState } from './camera';
import { projectPoint } from './camera';
import { isLatexLabel, type Label3D } from './labels3d';

type Props = {
  labels: readonly Label3D[];
  camera: CameraState;
  width: number;
  height: number;
  defaultLang: Lang;
};

/**
 * Étiquettes 2D placées par projection des points 3D à l'écran : le texte arabe reste lié et
 * utilise les mêmes polices que le reste de la vidéo.
 */
export const Labels3D: FC<Props> = ({ labels, camera, width, height, defaultLang }) => {
  const theme = useTheme();
  return (
    <>
      {labels.map((label) => {
        const point = projectPoint(label.position, camera, width, height);
        if (!point.visible) return null;
        const lang = label.lang ?? defaultLang;
        return (
          <div
            key={label.key}
            lang={lang}
            dir={lang === 'ar' && !isLatexLabel(label.text) ? 'rtl' : 'ltr'}
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -120%)',
              color: label.color,
              opacity: label.opacity,
              fontSize: label.fontSize,
              fontWeight: 700,
              fontFamily: fontStackFor({}, lang, theme.fonts),
              whiteSpace: 'nowrap',
              textShadow: `0 0 6px ${theme.palette.background}`,
              pointerEvents: 'none',
            }}
          >
            {isLatexLabel(label.text) ? <InlineMath latex={label.text} color={label.color} /> : label.text}
          </div>
        );
      })}
    </>
  );
};
