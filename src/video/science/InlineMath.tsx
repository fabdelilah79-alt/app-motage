import { useMemo, type CSSProperties } from 'react';
import { texToSvg } from './mathSvg';

type Props = { latex: string; color?: string; style?: CSSProperties };

/** Formule en ligne : toujours isolée de gauche à droite, même dans un texte arabe. */
export const InlineMath = ({ latex, color, style }: Props) => {
  const svg = useMemo(() => texToSvg(latex), [latex]);
  const css: CSSProperties = { unicodeBidi: 'isolate', display: 'inline-block', color, ...style };
  if (!svg) {
    // Formule invalide : affichée telle quelle, sans interprétation.
    return (
      <span dir="ltr" style={css}>
        {latex}
      </span>
    );
  }
  return (
    <span dir="ltr" data-latex={latex} style={css} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};
