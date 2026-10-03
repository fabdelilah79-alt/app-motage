import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './editor/App';
import { loadLocalFonts } from './video/text/fonts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Élément #root introuvable dans index.html');
}

// Polices locales de la vidéo (Cairo, Inter), chargées dès l'ouverture de l'éditeur.
void loadLocalFonts();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
