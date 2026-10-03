import { Player } from '@remotion/player';
import type { CSSProperties, FC } from 'react';
import { HELLO_COMPOSITION, HelloComposition } from '../video/demo/HelloComposition';

// Phase 0 : simple page d'aperçu. La vraie disposition de l'éditeur arrive en phase 2.
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
        component={HelloComposition}
        durationInFrames={HELLO_COMPOSITION.durationInFrames}
        fps={HELLO_COMPOSITION.fps}
        compositionWidth={HELLO_COMPOSITION.width}
        compositionHeight={HELLO_COMPOSITION.height}
        style={{ width: '100%' }}
        controls
        loop
      />
    </div>
  </main>
);
