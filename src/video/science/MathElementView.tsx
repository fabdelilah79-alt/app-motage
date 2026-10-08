import { useMemo, type CSSProperties, type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import type { MathElement } from '../../shared/schema';
import { EASINGS } from '../animations/easings';
import { animatedColor } from '../animations/frameStyles';
import type { AnimationFrame } from '../animations/types';
import { mathStateAt, morphLayouts, termOpacities, type PlacedTerm } from './mathLayout';
import { texToLayout } from './mathSvg';

const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

/** Épaisseur du trait pendant le « Tracé » (unités MathJax). */
const DRAW_STROKE = 28;

/**
 * Équation animée : apparition terme par terme, tracé des glyphes, surbrillance ou
 * encadrement d'un terme, transformation d'une équation en une autre (étapes de calcul).
 * Toujours de gauche à droite, même dans un projet en arabe.
 */
export const MathElementView: FC<{ element: MathElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const frame = useCurrentFrame();
  const state = mathStateAt(element.latex, element.steps, frame);
  const fromLatex = state.kind === 'static' ? state.latex : state.from;
  const toLatex = state.kind === 'morph' ? state.to : null;
  const from = useMemo(() => texToLayout(fromLatex), [fromLatex]);
  const to = useMemo(() => (toLatex === null ? null : texToLayout(toLatex)), [toLatex]);
  const color = animatedColor(element.color, animation);

  if (!from) {
    // LaTeX invalide : affiché tel quel pour que l'enseignant voie l'erreur.
    return (
      <div dir="ltr" style={{ color, fontSize: element.fontSize * 0.5, fontFamily: 'monospace' }}>
        {fromLatex}
      </div>
    );
  }

  let placed: PlacedTerm[];
  let box = { width: from.width, minY: from.minY, height: from.height };
  if (state.kind === 'morph' && to) {
    const morph = morphLayouts(from, to, EASINGS.smooth(state.progress));
    placed = morph.placed;
    box = { width: morph.width, minY: morph.minY, height: morph.height };
  } else {
    const opacities = animation.reveal
      ? termOpacities(from.terms.length, animation.reveal.progress)
      : from.terms.map(() => 1);
    placed = from.terms.map((term, index) => ({
      key: `t-${index}`,
      term,
      x: term.x,
      y: term.y,
      opacity: opacities[index] ?? 1,
    }));
  }

  // Taille : 1000 unités MathJax = 1 em ; réduite si l'équation dépasse la boîte.
  const { width: boxWidth, height: boxHeight } = element.transform;
  const natural = { width: (box.width / 1000) * element.fontSize, height: (box.height / 1000) * element.fontSize };
  const fit = Math.min(1, boxWidth / natural.width, boxHeight / natural.height);
  const highlight = state.kind === 'static' ? animation.term : undefined;
  const target = highlight ? from.terms[highlight.index] : undefined;
  const draw = animation.draw;
  const drawStyle: CSSProperties = draw
    ? { strokeDasharray: 1, strokeDashoffset: 1 - draw.stroke, fillOpacity: draw.fill }
    : {};
  const pad = 60;

  return (
    <div
      dir="ltr"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: JUSTIFY[element.align],
        unicodeBidi: 'isolate',
        color,
      }}
    >
      <svg
        width={natural.width * fit}
        height={natural.height * fit}
        viewBox={`0 ${box.minY} ${box.width} ${box.height}`}
        style={{ overflow: 'visible' }}
      >
        {highlight && target && highlight.style === 'highlight' ? (
          <rect
            x={target.x - pad}
            y={box.minY}
            width={(target.width + pad * 2) * highlight.progress}
            height={box.height}
            rx={pad}
            fill={highlight.color}
            fillOpacity={0.45}
          />
        ) : null}
        <g
          stroke="currentColor"
          fill="currentColor"
          strokeWidth={draw ? DRAW_STROKE : 0}
          transform={from.rootTransform}
          style={drawStyle}
        >
          {placed.map((item) => (
            <g
              key={item.key}
              opacity={item.opacity}
              transform={`translate(${item.x},${item.y}) ${item.term.extraTransform}`}
              dangerouslySetInnerHTML={{ __html: item.term.svg }}
            />
          ))}
        </g>
        {highlight && target && highlight.style === 'box' ? (
          <rect
            x={target.x - pad}
            y={box.minY}
            width={target.width + pad * 2}
            height={box.height}
            rx={pad}
            fill="none"
            stroke={highlight.color}
            strokeWidth={50}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - highlight.progress}
          />
        ) : null}
      </svg>
    </div>
  );
};
