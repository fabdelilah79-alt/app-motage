import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';
import { loadLocalFonts } from './text/fonts';

// Point d'entrée du rendu serveur (bundle) : polices chargées avant la première image.
void loadLocalFonts();
registerRoot(RemotionRoot);
