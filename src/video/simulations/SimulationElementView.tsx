import { useMemo, type FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { SimulationElement } from '../../shared/schema';
import { reader } from '../../shared/simulations/params';
import { getSimulation, runSimulation } from '../../shared/simulations/registry';
import type { AnimationFrame } from '../animations/types';
import { useProjectSettings } from '../ProjectSettingsContext';
import { fontStackFor } from '../text/fontStack';
import { useTheme } from '../themes/ThemeContext';
import { SimGraph } from './SimGraph';
import { EnergyBars, SimValues } from './SimOverlays';
import { simulationIndex, simulationSampling } from './timing';
import { SIM_VIEWS } from './views';

/**
 * Simulation physique : modèle pré-calculé une fois (mémorisé), puis lu à l'index de la
 * frame ; graphique synchronisé à droite ou en dessous, valeurs et énergies en surimpression.
 */
export const SimulationElementView: FC<{ element: SimulationElement; animation: AnimationFrame }> = ({ element }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const { defaultLang } = useProjectSettings();
  const model = getSimulation(element.simId);
  const { interval, count } = simulationSampling(element.timing.duration, fps, element.playbackRate);
  const result = useMemo(
    () => (model ? runSimulation(model, element.params, interval, count) : {}),
    [model, element.params, interval, count],
  );
  const View = SIM_VIEWS[element.simId];
  if (!model || !View) return null;

  const index = simulationIndex(frame, count, element.freezeAt);
  const { width, height } = element.transform;
  const quantity = model.quantities.find((item) => item.key === element.graph.quantity);
  const side = element.graph.position === 'right';
  const simBox = quantity ? (side ? { width: width * 0.5, height } : { width, height: height * 0.55 }) : { width, height };
  const graphBox = side ? { width: width * 0.5, height } : { width, height: height * 0.45 };
  const { palette } = theme;
  const fontFamily = fontStackFor({}, defaultLang, theme.fonts);
  const colors = {
    main: element.color,
    accent: element.accent,
    text: element.textColor,
    muted: palette.muted,
    surface: palette.surface,
    vectors: { velocity: palette.accent2, acceleration: palette.accent3, force: '#ef4444' },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: side ? 'row' : 'column', direction: 'ltr' }}>
      <div style={{ position: 'relative', width: simBox.width, height: simBox.height, fontFamily }}>
        <View
          result={result}
          index={index}
          p={reader(model.params, element.params)}
          display={element.display}
          width={simBox.width}
          height={simBox.height}
          colors={colors}
          fontFamily={fontFamily}
          fontSize={element.fontSize}
          lang={defaultLang}
        />
        {element.display.values ? (
          <div style={{ position: 'absolute', left: 8, top: 8 }}>
            <SimValues result={result} quantities={model.quantities} index={index} color={element.textColor} fontSize={element.fontSize * 0.8} lang={defaultLang} />
          </div>
        ) : null}
        {element.display.energyBars && result.em ? (
          <div style={{ position: 'absolute', right: 8, top: 8 }}>
            <EnergyBars result={result} index={index} colors={[palette.accent2, palette.accent3, palette.accent1]} textColor={element.textColor} fontSize={element.fontSize * 0.8} />
          </div>
        ) : null}
      </div>
      {quantity ? (
        <SimGraph
          result={result}
          quantity={quantity}
          index={index}
          width={graphBox.width}
          height={graphBox.height}
          color={element.accent}
          textColor={element.textColor}
          gridColor={palette.grid}
          fontFamily={fontFamily}
          fontSize={element.fontSize * 0.8}
          lang={defaultLang}
        />
      ) : null}
    </div>
  );
};
