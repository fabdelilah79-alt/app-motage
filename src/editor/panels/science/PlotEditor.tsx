import type { Plot2DElement } from '../../../shared/schema';
import { AxesEditor } from './AxesEditor';
import { DecorationsEditor } from './DecorationsEditor';
import { SeriesListEditor } from './SeriesListEditor';

/** Repère : axes, courbes, décorations. */
export const PlotEditor = ({ element, fps }: { element: Plot2DElement; fps: number }) => (
  <div className="flex flex-col gap-4">
    <AxesEditor element={element} />
    <SeriesListEditor element={element} fps={fps} />
    <DecorationsEditor element={element} fps={fps} />
  </div>
);
