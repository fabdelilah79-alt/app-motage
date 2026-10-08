import type { FC } from 'react';
import type { DiagramElement } from '../../../shared/schema';
import { animatedColor } from '../../animations/frameStyles';
import type { AnimationFrame } from '../../animations/types';
import { fontStackFor } from '../../text/fontStack';
import { useProjectSettings } from '../../ProjectSettingsContext';
import { useTheme } from '../../themes/ThemeContext';
import { getDiagram } from './registry';

/** Schéma de la bibliothèque, dessiné à la taille de sa boîte, avec un nom facultatif. */
export const DiagramElementView: FC<{ element: DiagramElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const theme = useTheme();
  const { defaultLang } = useProjectSettings();
  const diagram = getDiagram(element.diagramId);
  if (!diagram) return null;
  const { width, height } = element.transform;
  const style = {
    color: animatedColor(element.color, animation),
    accent: element.accent,
    fill: element.fill,
    strokeWidth: element.strokeWidth,
    draw: animation.draw,
  };
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width={width} height={height} style={{ overflow: 'visible', display: 'block' }}>
        {diagram.render({ width, height, params: element.params, style })}
      </svg>
      {element.label ? (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            textAlign: 'center',
            marginTop: 8,
            color: style.color,
            fontFamily: fontStackFor({}, defaultLang, theme.fonts),
            fontSize: Math.max(20, Math.min(width, height) * 0.16),
            fontWeight: 700,
            unicodeBidi: 'plaintext',
          }}
        >
          {element.label}
        </div>
      ) : null}
    </div>
  );
};
