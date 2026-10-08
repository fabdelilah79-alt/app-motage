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

## Vérifier le rendu du texte (captures)

```bash
npm run stills:typography
```

Crée des images PNG de la scène de test `templates/typography-test.json` (arabe + formule +
nombre avec unité, toutes les animations de texte) à plusieurs instants, dans
`PhysiMotion/exports/captures-typographie_…`. Les lettres arabes doivent rester liées sur
toutes les images.

## Utiliser l'éditeur (en bref)

1. **Nouveau projet** : choisir un nom, un format (16:9, 9:16, 1:1) et la langue principale.
2. **Bibliothèque** (à gauche) : cliquer sur « Texte en arabe / français / anglais » ou importer une image.
3. **Canevas** (au centre) : cliquer sur un élément pour le sélectionner, puis le déplacer,
   l'agrandir ou le faire pivoter avec les poignées.
4. **Propriétés** (à droite) : onglets Contenu, Style et Animation (apparition / disparition).
   Sans élément sélectionné : durée, fond et transition de la scène.
5. **En bas** : les scènes (glisser pour les réordonner) et la timeline de la scène (glisser une
   barre pour changer le moment d'apparition, tirer ses bords pour changer sa durée).
6. **Médias** : importer images, GIF, vidéos, sons et animations Lottie (bouton ou glisser-déposer).
   Un son peut devenir la musique de fond ou la voix off de la scène.
7. **Audio** : écrire le texte de la voix off, l'enregistrer au micro, puis « Caler la durée de la
   scène sur la voix ». La musique baisse automatiquement pendant la voix.
8. **Exporter la vidéo** (en haut à droite) : le fichier MP4 est rangé dans `PhysiMotion/exports`.

9. **Thème** (en haut) : choisir l'allure de toute la vidéo en un clic (tableau noir, cahier,
   blueprint, néon…), modifier les couleurs du thème, et préparer son **kit de marque** (logo
   dans un coin de toutes les scènes, couleurs personnelles, scènes d'introduction et de
   conclusion). « Enregistrer comme mon kit » le rend disponible dans tous les projets.

10. **Sciences** (onglet de la bibliothèque) : équations (avec palette de symboles et étapes de
    calcul qui se transforment), repères et courbes (y = f(x), paramétrique, polaire, mesures
    collées depuis un tableur avec modélisation), graphiques (barres, secteurs, histogramme),
    vecteurs, cotations, encadrés (Définition, À retenir…) et schémas de mécanique, électricité
    et optique.

11. **3D** (onglet de la bibliothèque) : repère 3D, surfaces z = f(x, y), courbes 3D (hélice),
    champs de vecteurs, solides, flèches et étiquettes ; caméra en orbite, zoom, vues de face /
    dessus / profil.

Les projets sont enregistrés automatiquement (5 s après chaque modification) dans
`PhysiMotion/projets` de votre dossier personnel.

Raccourcis : Espace (lecture), Ctrl+Z / Ctrl+Y (annuler / rétablir), Ctrl+S (enregistrer),
Suppr (supprimer), Ctrl+D (dupliquer), Ctrl+C / Ctrl+V (copier / coller), flèches (déplacer,
Maj = ×10).

## Voir toutes les animations (galerie)

```bash
npm run render:gallery
```

Fabrique une vidéo MP4 qui présente chaque animation (apparitions, mises en valeur, mouvements,
disparitions) avec son nom, dans `PhysiMotion/exports`.

## Comparer les 9 thèmes (captures)

```bash
npm run render:themes
```

Rend la même scène (`templates/theme-test.json`) dans les 9 thèmes, en images PNG, dans
`PhysiMotion/exports/captures-themes_…`. Seul le thème change : fond, couleurs, polices et style
des formes doivent suivre.

## Vidéo de validation « Énergie cinétique »

```bash
npm run render:science
```

Formule qui s'écrit terme par terme puis se calcule, courbe Ec = f(v) tracée avec un point
mobile et sa tangente, chariot avec son vecteur vitesse, encadrés en français et en arabe.

## Vidéo de validation 3D

```bash
npm run render:3d
```

Hélice d'une particule chargée dans un champ magnétique, caméra en orbite, en 1080p.

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

Après la mise à jour vers la phase 8, relancer `npm install` (nouveaux paquets 3D).

Avant `npm run test:e2e`, arrêter `npm run dev` : les tests lancent leur propre copie de
l'application, avec un dossier de données séparé (`.e2e-data`). Le test d'export fabrique un
vrai MP4 et peut prendre quelques minutes.
