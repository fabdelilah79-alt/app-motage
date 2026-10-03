# CLAUDE.md — PhysiMotion Studio

## Contexte
Application locale de création de vidéos explicatives en motion design pour un **enseignant de physique non spécialiste du montage**. Textes fr / ar / en, médias, équations, courbes 2D/3D, schémas, simulations physiques, animations choisies dans des menus, export MP4.
Le plan complet est dans **`PLAN.md`** : le lire avant toute tâche importante.

## Façon de travailler
- Travailler **une seule phase de `PLAN.md` à la fois**, dans l'ordre, sans anticiper les phases suivantes.
- Commencer chaque phase en **mode plan** et attendre la validation de l'utilisateur avant de coder.
- L'utilisateur n'est pas développeur : expliquer en français simple, sans jargon, ce qu'il doit faire pour tester.
- Avant d'utiliser une API Remotion dont tu n'es pas sûr, consulter les **skills Remotion** (docs à jour) plutôt que de deviner.
- En cas de doute sur un choix produit (ergonomie, comportement), **demander** plutôt que supposer.
- À la fin de chaque phase : typecheck + lint + tests au vert, critères de validation prouvés, mise à jour du **Journal d'avancement** ci-dessous, commit `phase N: <titre>`.
- **Consigne de l'utilisateur (2026-10-03)** : Claude écrit le code pas à pas mais **n'exécute pas lui-même** les tests, le lint, le typecheck ni l'application ; c'est l'utilisateur qui teste. Donner à chaque fois la liste précise des commandes à lancer.

## Commandes
| Commande | Rôle |
|---|---|
| `npm run dev` | Lance l'éditeur (Vite, :5173) et le serveur local (Fastify, :3210) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint + Prettier |
| `npm run format` | Corrige automatiquement la mise en forme (Prettier) |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests bout en bout (Playwright) |
| `npm run render:demo` | Rend `templates/demo.json` en MP4 dans `~/PhysiMotion/exports/` |

(Créer ces scripts en phase 0–1 et tenir ce tableau à jour.)

## Règles d'architecture (invariants — ne jamais enfreindre)
1. **Le projet est un JSON validé par zod** (`src/shared/schema`). Les types TypeScript sont dérivés des schémas. Toute nouvelle fonctionnalité = schéma (avec valeur par défaut) + rendu (`src/video`) + interface (`src/editor`) + tests.
2. **`src/video` ne dépend jamais de `src/editor`.** Ce dossier est partagé entre l'aperçu (`<Player>`) et le rendu serveur (`bundle` + `renderMedia`).
3. **Rendu 100 % déterministe** dans `src/video` : tout dépend de `useCurrentFrame()`. Interdits : `Date.now()`, `Math.random()` (utiliser `random(seed)`), `setTimeout`/`setInterval`, transitions et animations CSS, `requestAnimationFrame`.
4. **Simulations et courbes pré-calculées** à pas fixe et mémorisées (`useMemo` sur les paramètres), puis lues à l'index de la frame.
5. **Médias** uniquement via les composants Remotion (`@remotion/media`, `Img`, `@remotion/lottie`…), jamais `<img>`/`<video>`/`<audio>` bruts.
6. **Polices locales** (`public/fonts`, `.woff2`) chargées et attendues avant le rendu (`@remotion/fonts` / `delayRender`).
7. **Versions Remotion** : `remotion` et tous les `@remotion/*` à la même version exacte, sans `^`. Mise à jour uniquement avec `npx remotion upgrade`.
8. **Pas de Tailwind dans `src/video`** (styles en ligne / objets de style). Tailwind + shadcn uniquement dans `src/editor`.
9. **Temps** stocké en frames, affiché en secondes dans l'interface.
10. **Schéma versionné** : toute rupture = nouvelle `schemaVersion` + fonction de migration + test de migration.
11. **Préréglages d'animation = fonctions pures** enregistrées dans un registre avec métadonnées (nom traduit, catégorie, durée par défaut, schéma de paramètres, compatibilité arabe).

## Règles arabe / RTL (obligatoires)
- Ne **jamais** animer un mot arabe lettre par lettre avec des `<span>` séparés : cela casse les liaisons. Repli automatique sur « mot par mot ».
- Machine à écrire = sous-chaînes de graphèmes (`Intl.Segmenter`), pas de découpage en éléments.
- `letter-spacing: 0` et aucun `text-transform` sur l'arabe.
- Formules, nombres avec unités et termes latins dans un texte arabe : isolés en LTR (`unicode-bidi: isolate`).
- Masques de révélation dans le sens de lecture (droite → gauche en arabe).
- Interface : aucune chaîne en dur, tout passe par i18n (`fr`, `ar`, `en`) ; chaque nouveau panneau est vérifié en RTL.
- Vérifier visuellement le rendu arabe par captures `renderStill` à plusieurs frames, pas seulement dans l'aperçu.

## Conventions de code
- TypeScript strict, pas de `any` (utiliser `unknown` + validation zod).
- Composants fonctionnels React, fichiers courts (≈ 200 lignes max), un composant par fichier.
- Noms de code en anglais ; commentaires et messages de commit en français acceptés.
- Tout texte visible par l'utilisateur est traduit dans les 3 langues.

## Ajouter un nouvel élément / animation / simulation (checklist)
1. Schéma zod + valeurs par défaut + types dérivés.
2. Composant de rendu dans `src/video/...` + enregistrement dans le registre correspondant.
3. Entrée dans la bibliothèque de l'éditeur + panneau de propriétés + traductions fr/ar/en.
4. Vignette d'aperçu.
5. Tests unitaires (et tests physiques pour une simulation).
6. Vérification d'un rendu `renderStill` ou MP4 court.

## Définition de « terminé »
- `npm run typecheck`, `npm run lint`, `npm test` passent (et `npm run test:e2e` quand il existe).
- Les critères de validation de la phase dans `PLAN.md` sont vérifiés, avec preuve.
- L'aperçu et l'export MP4 sont identiques.
- Le Journal d'avancement est à jour et un commit est fait.

## Journal d'avancement
<!-- Claude Code : ajouter une ligne par phase terminée : date, phase, ce qui a été fait, points en suspens. -->
- **2026-10-03 — Phase 0 (Fondations)** : Vite + React 19 + TypeScript strict, ESLint (règles d'invariants sur `src/video` : pas d'import de l'éditeur, pas de `Math.random`/`Date.now`/minuteurs, pas de `<img>`/`<video>`/`<audio>`), Prettier, Vitest, Playwright ; Remotion 4.0.532 épinglé (`remotion`, `@remotion/player`) ; skills Remotion installés dans `.claude/skills` ; arborescence de la section 4 ; serveur Fastify minimal (`/api/health`, port 3210, relayé par Vite) ; `npm run dev` lance les deux ; page avec `<Player>` « Bonjour / مرحبا / Hello » en fondu. Tests écrits : `fade`, `/api/health`, e2e de la page d'accueil. **En suspens** : code non exécuté par Claude (consigne utilisateur) → validation par l'utilisateur ; pas encore de `package-lock.json` (créé au premier `npm install`) ; polices système provisoires (polices locales en phase 1).
- **2026-10-03 — Phase 1 (Moteur vidéo minimal + export MP4)** : schéma zod `Project` v1 (`src/shared/schema` : projet, format, médias, scènes, fonds couleur/dégradé, transitions, éléments Texte et Image, animations) + `migrateProject`/`parseProject` (table de migrations vide, testée) ; `templates/demo.json` (3 scènes fr / ar / en, image SVG `public/demo/chute-libre.svg`) ; `ProjectVideo` (`TransitionSeries` : coupe, fondu, glissement), registre d'éléments, registre de préréglages (`enter.fade`, `enter.slide`, `exit.fade`, `exit.slide`) avec accélérations `smooth`/`snappy`/`linear` ; polices locales Cairo (arabe) + Inter (latin) via `@remotion/fonts` ; `calculateMetadata` (durée = scènes − transitions) ; serveur : `POST /api/render`, `GET /api/render/:id`, `GET /api/render/:id/events` (SSE), `DELETE /api/render/:id` (annulation) ; `npm run render:demo`. Tests écrits : schéma, migrations, durée, animations (0 / 0,5 / 1), fonds, suivi des rendus, routes, nom de fichier, e2e. **En suspens** : code non exécuté par Claude (consigne utilisateur) → validation MP4 / arabe par l'utilisateur ; captures `renderStill` à faire ; le bundle Remotion est construit une fois par démarrage du serveur (redémarrer `npm run dev` après une modification de `src/video` pour l'export) ; bouton Exporter dans l'interface prévu en phase 2.
- **2026-10-03 — Phase 2 (Éditeur de base)** : Tailwind v4 + composants maison style shadcn (Radix Tabs / Dialog / Direction) ; i18n fr / ar / en (`src/editor/i18n`, bascule RTL de toute la page, langue mémorisée) ; accueil (projets récents, nouveau projet, ouvrir, dupliquer) avec navigation `#/projet/<id>` ; disposition 6.1 : barre du haut (nom, annuler/rétablir, état de sauvegarde, « Voir toute la vidéo », langue, Exporter), bibliothèque (textes fr/ar/en, import d'images par bouton ou glisser-déposer), canevas (`<Player>` + calque `react-moveable` : déplacer, redimensionner, pivoter, guides magnétiques), propriétés générées à partir de descripteurs de champs validés par zod (Contenu / Style / Animation ; scène : durée, fond couleur/dégradé, transition), bande des scènes (`@dnd-kit`, vignettes `Thumbnail`, ajouter/dupliquer/supprimer), timeline de scène (barres déplaçables/redimensionnables, règle, tête de lecture, temps en secondes, toujours de gauche à droite) ; store zustand + immer + zundo (un geste = une étape d'annulation) ; sauvegarde auto 5 s + Ctrl+S + avertissement à la fermeture ; raccourcis clavier ; serveur : `/api/projects` (liste, création, lecture, sauvegarde, duplication, import d'image) et `/files/<projet>/…` (protégé contre la sortie du dossier) ; schéma : champ `storage` des médias (`public` | `project`, défaut `public`, sans rupture) ; export relié (fenêtre de progression SSE + annulation). Tests écrits : traductions (mêmes clés, clés utilisées présentes), temps, fabriques, mutations, store/historique, timeline, stockage disque, routes, e2e « créer → 2 scènes → texte arabe + image → exporter » et e2e RTL. **En suspens** : code non exécuté par Claude (consigne utilisateur) ; vérification visuelle de l'interface arabe à faire par l'utilisateur ; texte riche, polices, effets → phase 3 ; aperçu animé au survol des animations → phase 5 ; assistant complet → phase 10.
