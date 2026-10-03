import { Player } from '@remotion/player';
import type { CSSProperties, FC } from 'react';
import demoTemplate from '../../templates/demo.json';
import { parseProject } from '../shared/schema';
import { computeProjectDuration } from '../shared/timeline';
import { ProjectVideo } from '../video/ProjectVideo';

// Phase 1 : aperçu du projet de démonstration. La vraie disposition de l'éditeur arrive en phase 2.
const demoProject = parseProject(demoTemplate);
const inputProps = { project: demoProject };

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  padding: 24,
  boxSizing: 'border-box',
  background: '#0b1120',
  color: '#e2e8f0',
  fontFamily: 'system-ui, sans-serif',
};

const playerWrapperStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
};

export const App: FC = () => (
  <main style={pageStyle}>
    <h1 style={{ textAlign: 'center', fontWeight: 600 }}>PhysiMotion Studio</h1>
    <div style={playerWrapperStyle}>
      <Player
        component={ProjectVideo}
        inputProps={inputProps}
        durationInFrames={computeProjectDuration(demoProject)}
        fps={demoProject.format.fps}
        compositionWidth={demoProject.format.width}
        compositionHeight={demoProject.format.height}
        style={{ width: '100%' }}
        controls
        loop
      />
    </div>
  </main>
);
