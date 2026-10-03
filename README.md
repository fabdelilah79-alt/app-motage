# PhysiMotion Studio

Application de création de vidéos explicatives de physique en motion design (français / arabe / anglais).
Le plan complet est dans [`PLAN.md`](PLAN.md), les règles de travail dans [`CLAUDE.md`](CLAUDE.md).

## Installation (une seule fois)

1. Installer **Node.js version 22 ou plus récente** depuis <https://nodejs.org> (bouton « LTS »).
2. Télécharger ce dépôt (bouton vert **Code → Download ZIP** sur GitHub, puis décompresser), ou `git clone`.
3. Ouvrir un terminal **dans le dossier du projet** et taper :

```bash
npm install
```

## Lancer l'application

```bash
npm run dev
```

Puis ouvrir <http://localhost:5173> dans le navigateur. Pour arrêter : `Ctrl + C` dans le terminal.

## Créer la vidéo de démonstration (MP4)

```bash
npm run render:demo
```

La vidéo est enregistrée dans le dossier `PhysiMotion/exports` de votre dossier personnel
(le chemin exact s'affiche à la fin). La toute première fois, un navigateur spécial (Chrome
Headless, environ 100 Mo) est téléchargé automatiquement : il faut donc une connexion Internet
une seule fois.

## Vérifications

| Commande                                        | Ce qu'elle vérifie                               |
| ----------------------------------------------- | ------------------------------------------------ |
| `npm run typecheck`                             | Le code TypeScript ne contient pas d'erreur      |
| `npm run lint`                                  | Règles de qualité et mise en forme du code       |
| `npm run format`                                | Corrige automatiquement la mise en forme du code |
| `npm test`                                      | Tests unitaires                                  |
| `npx playwright install chromium` (une fois)    | Installe le navigateur des tests bout en bout    |
| `npm run test:e2e`                              | Tests bout en bout (ouvre l'application)         |
