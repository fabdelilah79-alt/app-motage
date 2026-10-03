import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './editor/App';
import './editor/i18n';
import './editor/styles.css';
import { loadLocalFonts } from './video/text/fonts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Élément #root introuvable dans index.html');
}

// Polices locales (Cairo, Inter) : utilisées par la vidéo et par l'interface.
void loadLocalFonts();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
