import type { Scene3DElement } from '../../../shared/schema';
import { Axes3DEditor } from './Axes3DEditor';
import { Camera3DEditor } from './Camera3DEditor';
import { Objects3DEditor } from './Objects3DEditor';

/** Scène 3D : caméra, repère, objets. */
export const Scene3DEditor = ({ element, fps }: { element: Scene3DElement; fps: number }) => (
  <div className="flex flex-col gap-4">
    <Camera3DEditor element={element} fps={fps} />
    <Axes3DEditor element={element} />
    <Objects3DEditor element={element} fps={fps} />
  </div>
);
