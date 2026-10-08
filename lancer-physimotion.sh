#!/bin/bash
# PhysiMotion Studio — lanceur Linux (double-clic ou ./lancer-physimotion.sh). Laissez la fenêtre ouverte pendant le travail.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js n'est pas installé sur cet ordinateur."
  echo "Installez-le depuis https://nodejs.org (bouton LTS), puis relancez ce fichier."
  xdg-open "https://nodejs.org" >/dev/null 2>&1
  read -r -p "Appuyez sur Entrée pour fermer…"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Première installation : quelques minutes, une connexion Internet est nécessaire…"
  if ! npm install; then
    echo "L'installation a échoué. Vérifiez votre connexion Internet puis relancez ce fichier."
    read -r -p "Appuyez sur Entrée pour fermer…"
    exit 1
  fi
fi

echo "PhysiMotion Studio démarre… Laissez cette fenêtre ouverte pendant votre travail."
npm start
