import { MusicSection } from './MusicSection';
import { SfxSection } from './SfxSection';
import { VoiceoverSection } from './VoiceoverSection';

/** Onglet Audio de la bibliothèque : voix off de la scène, musique de fond, effets sonores. */
export const AudioPanel = () => (
  <div className="flex flex-col gap-5">
    <VoiceoverSection />
    <MusicSection />
    <SfxSection />
  </div>
);
