# PhysiMotion Studio — Plan de réalisation

> **Document de référence pour Claude Code.** Il décrit *quoi* construire, *avec quoi* et *dans quel ordre*.
> Les règles de travail permanentes sont dans `CLAUDE.md` (à lire en premier).
> *PhysiMotion Studio* est un nom provisoire, à remplacer librement.

---

## 1. Vision

Une application (exécutée en local sur l'ordinateur, interface dans le navigateur) qui permet à un **enseignant de physique sans aucune compétence en montage ni en animation** de produire des **vidéos explicatives en motion design de qualité professionnelle** :

- textes en **français, arabe et anglais**, avec des polices adaptées et un sens d'écriture correct ;
- images, vidéos, animations Lottie, sons, voix off ;
- **équations**, **courbes 2D et 3D animées**, **schémas** et **simulations physiques** ;
- animations **choisies dans des menus** (jamais programmées par l'utilisateur) ;
- **export MP4** prêt pour YouTube, WhatsApp, Google Classroom, réseaux sociaux (16:9, 9:16, 1:1).

**Utilisateur cible** : enseignant de physique-chimie (collège, lycée, université). L'interface n'utilise aucun jargon de montage : on dit « Apparition », « Mise en valeur », « Disparition », pas « keyframe » ou « easing ».

**Promesse produit** : une vidéo explicative d'une minute en moins de 20 minutes de travail.

---

## 2. Principes de conception

1. **Tout est préréglé, tout est modifiable.** Chaque élément ajouté arrive avec un style et une animation par défaut cohérents avec le thème choisi. L'utilisateur ne change que ce qu'il veut.
2. **Des scènes comme des diapositives.** La vidéo est une suite de scènes (logique PowerPoint). Chaque scène possède sa petite timeline. Pas de montage multipiste complexe.
3. **Aperçu instantané.** Toute modification est visible immédiatement dans le lecteur.
4. **Mode Simple / Mode Avancé.** Le mode Avancé (images clés, courbes d'accélération) est masqué par défaut.
5. **Rendu déterministe.** L'aperçu et la vidéo exportée sont identiques, image par image.
6. **Hors ligne.** Polices, icônes, modèles et thèmes sont embarqués ; aucune connexion n'est nécessaire pour créer et exporter.
7. **Trilingue et RTL natif.** L'arabe est traité dès le départ, pas ajouté à la fin.
8. **Le projet est un document JSON** validé par un schéma : lisible, sauvegardable, versionné, et générable automatiquement plus tard (par exemple par une IA).

---

## 3. Choix techniques

| Besoin | Choix | Pourquoi |
|---|---|---|
| Langage | TypeScript (mode strict) | Fiabilité, refactorisation sûre |
| Interface | React + Vite | Standard, rapide, compatible Remotion |
| **Moteur vidéo** | **Remotion 4.x** : `remotion`, `@remotion/player`, `@remotion/bundler`, `@remotion/renderer` | Vidéo décrite en composants React ; aperçu dans le navigateur ; rendu MP4 image par image (Chrome headless + FFmpeg) ; skills officiels pour Claude Code |
| Transitions de scènes | `@remotion/transitions` | Fondu, glissement, balayage, retournement, horloge, iris… |
| Médias | `@remotion/media` (vidéo/audio), `@remotion/media-utils` (forme d'onde), `@remotion/gif`, `@remotion/lottie` | Import de médias variés |
| Tracés animés | `@remotion/paths`, `@remotion/shapes` | Effet « dessin » des courbes, formes, flèches |
| 3D | `@remotion/three` + `three` + `@react-three/fiber` + `@react-three/drei` | Surfaces, courbes, champs, solides en 3D |
| Polices | Fichiers `.woff2` locaux + `@remotion/fonts` | Hors ligne, chargées avant chaque rendu |
| Équations | **MathJax en sortie SVG** | Chemins SVG animables (tracé, apparition terme par terme, surbrillance) |
| Expressions mathématiques | `mathjs` (parse + compile) | L'utilisateur tape `A*sin(w*t)` |
| Style « dessiné à la main » | `roughjs` (graine fixe) | Thèmes tableau noir / cahier |
| État de l'éditeur | `zustand` + `immer` + `zundo` | Store simple, annuler/rétablir |
| Schéma & migrations | `zod` | Validation du projet JSON, types dérivés |
| Composants UI | Tailwind CSS + shadcn/ui (Radix) + `lucide-react` | Radix gère le RTL (`DirectionProvider`) |
| Manipulation sur le canevas | `react-moveable` | Déplacer, redimensionner, pivoter, guides magnétiques |
| Réordonner des listes | `@dnd-kit` | Scènes, calques |
| Traduction de l'interface | `i18next` + `react-i18next` | fr / ar / en |
| Serveur local | Node.js + Fastify | Projets, fichiers, rendu vidéo |
| Tests | Vitest (unitaires), Playwright (bout en bout) | |
| Transcription (phase 10) | `@remotion/install-whisper-cpp` | Sous-titres automatiques en local, arabe compris |

### Remarques importantes

- **Licence Remotion** : gratuite pour un particulier ou une structure de 3 personnes maximum, y compris pour un usage commercial ; au-delà, une licence entreprise est nécessaire. Si l'application est un jour distribuée à un établissement ou vendue, revérifier la licence sur remotion.dev/license.
- **Rendu côté serveur local** (`@remotion/renderer`), **pas** côté navigateur : le rendu navigateur de Remotion (`@remotion/web-renderer`) est encore expérimental et émule le CSS. Le rendu serveur fait de vraies captures Chrome : l'arabe, MathJax et la 3D sortent exactement comme dans l'aperçu.
- Tous les paquets `remotion` et `@remotion/*` doivent avoir **exactement la même version**, sans `^`.

---

## 4. Architecture

```
┌──────────────────────── Navigateur (http://localhost:5173) ────────────────────────┐
│  ÉDITEUR  (src/editor)                                                              │
│  ┌──────────────┬─────────────────────────────────────────┬──────────────────────┐  │
│  │ Bibliothèque │  Canevas = <Player> Remotion             │ Propriétés           │  │
│  │              │        + calque de sélection (Moveable)  │ Contenu/Style/Anim.  │  │
│  ├──────────────┴─────────────────────────────────────────┴──────────────────────┤  │
│  │ Bande des scènes  +  Timeline de la scène sélectionnée                         │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
│        ▲ lit / écrit                                                                 │
│  Store zustand ──► Project (JSON validé par zod) ──► inputProps                       │
└─────────────────────────────────────────┬────────────────────────────────────────────┘
                                          │
                 src/video : <ProjectVideo project={…}/>   ◄── code PARTAGÉ aperçu / rendu
                                          │
┌────────────────── Serveur local Node (http://localhost:3210) ──────────────────────┐
│  /api/projects   /api/assets   /api/fonts   /api/render (+ progression SSE)        │
│  Rendu : bundle() → selectComposition() → renderMedia() → MP4                      │
│  Données : ~/PhysiMotion/projets/<projet>/project.json + assets/   ~/PhysiMotion/exports/ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Arborescence cible

```
physimotion/
├─ CLAUDE.md
├─ PLAN.md
├─ package.json
├─ public/
│  └─ fonts/                 # .woff2 embarqués (arabe + latin)
├─ src/
│  ├─ shared/                # schéma zod, types, migrations, utilitaires purs (temps, maths)
│  ├─ video/                 # TOUT ce qui apparaît dans la vidéo — ne dépend jamais de src/editor
│  │  ├─ ProjectVideo.tsx    # composition racine : scènes + transitions + audio
│  │  ├─ remotion-entry.ts   # registerRoot() pour le rendu serveur
│  │  ├─ elements/           # un composant par type d'élément + registre
│  │  ├─ animations/         # préréglages d'animation (fonctions pures) + registre
│  │  ├─ themes/             # thèmes visuels (jetons de style)
│  │  ├─ text/               # rendu du texte, bidi, révélations compatibles arabe
│  │  ├─ science/            # équations, repères, courbes, schémas
│  │  ├─ three/              # éléments 3D
│  │  └─ simulations/        # modèles physiques + rendus
│  ├─ editor/                # interface (React + Tailwind + shadcn)
│  │  ├─ layout/ panels/ library/ canvas/ timeline/ export/ wizard/
│  │  ├─ store/              # zustand + zundo
│  │  └─ i18n/               # fr.json, ar.json, en.json
│  └─ main.tsx
├─ server/                   # Fastify : projets, fichiers, polices, rendu
├─ templates/                # modèles de projets (JSON)
└─ tests/                    # unitaires + e2e
```

### Flux de rendu

1. Au démarrage, le serveur crée le bundle Remotion une fois (`bundle()` sur `src/video/remotion-entry.ts`) et le reconstruit si le code change (en développement).
2. Export : `selectComposition({ id: 'ProjectVideo', inputProps: { project } })` puis `renderMedia({ codec, crf, onProgress, cancelSignal })`.
3. Les médias sont servis par le serveur (`http://localhost:3210/files/<projet>/<fichier>`) : la même URL fonctionne pour l'aperçu et pour Chrome headless.
4. La durée totale, les dimensions et le fps de la composition sont calculés depuis le projet (`calculateMetadata`).
5. La progression du rendu est envoyée à l'éditeur par Server-Sent Events ; le rendu est annulable.

---

## 5. Modèle de données (cœur du système)

- Un projet = un dossier `~/PhysiMotion/projets/<slug>/` contenant `project.json` et `assets/`.
- Le temps est **stocké en frames** et **affiché en secondes** dans l'interface.
- Tous les types sont **dérivés de schémas zod** (`z.infer`). Le champ `schemaVersion` permet les migrations.

```ts
// src/shared/schema/ — esquisse, à formaliser avec zod
export type Lang = 'fr' | 'ar' | 'en';

export interface Project {
  schemaVersion: number;
  id: string;
  title: string;
  format: { width: number; height: number; fps: 30 | 60 }; // 1920×1080, 1080×1920, 1080×1080, 3840×2160
  defaultLang: Lang;
  digits: 'latin' | 'arabic-indic';    // 0-9 ou ٠-٩ dans les contenus arabes
  themeId: string;                     // thème visuel
  themeOverrides?: Partial<ThemeTokens>;
  assets: Asset[];                     // { id, kind: image|video|audio|lottie|svg, file, meta }
  audioTracks: AudioTrack[];           // voix off, musique — au niveau du projet
  scenes: Scene[];
  subtitles?: SubtitleCue[];
}

export interface Scene {
  id: string;
  name: string;
  durationInFrames: number;
  background: Background;              // couleur, dégradé, texture, grille, image, vidéo, particules
  camera?: CameraMove[];               // zoom / panoramique sur une zone de la scène
  transitionIn?: { type: TransitionId; durationInFrames: number; direction?: Direction };
  elements: SceneElement[];            // ordre du tableau = profondeur (dernier = devant)
  script?: string;                     // texte de la voix off / notes de l'enseignant
}

export interface ElementBase {
  id: string;
  type: ElementType;
  name: string;
  locked?: boolean;
  hidden?: boolean;
  transform: { x: number; y: number; width: number; height: number;
               rotation: number; scale: number; opacity: number };
  timing: { from: number; duration: number };        // frames, relatif au début de la scène
  animations: {
    enter?: AnimationRef;
    emphasis?: AnimationRef[];
    exit?: AnimationRef;
    motionPath?: MotionPath;                          // déplacement le long d'un chemin
  };
  keyframes?: PropertyKeyframes;                      // mode Avancé uniquement
}

export interface AnimationRef {
  presetId: string;                    // ex. 'enter.slide'
  duration: number;                    // frames
  delay?: number;
  easing?: EasingId;                   // 'smooth' | 'snappy' | 'bounce' | 'elastic' | 'linear' | …
  params?: Record<string, unknown>;    // validés par le schéma du préréglage
  repeat?: number;                     // pour les mises en valeur
}

export type SceneElement =
  | TextElement | MathElement | ImageElement | VideoElement | LottieElement
  | ShapeElement | ArrowElement | CalloutElement | IconElement
  | Plot2DElement | Plot3DElement | DiagramElement | SimulationElement | ChartElement
  | GroupElement;
```

Exemples d'éléments spécialisés :

```ts
interface TextElement extends ElementBase {
  type: 'text';
  lang: Lang;                          // police par défaut + direction
  direction: 'auto' | 'rtl' | 'ltr';
  content: TextRun[];                  // segments : texte stylé ou formule en ligne
  style: TextStyle;                    // police, taille, graisse, couleur/dégradé, alignement,
                                       // interligne, contour, ombre, lueur, fond, surlignage
  stylePresetId?: string;              // 'title' | 'subtitle' | 'body' | 'caption' | 'definition' | 'key-formula'…
}
type TextRun =
  | { kind: 'text'; text: string; style?: Partial<TextStyle> }
  | { kind: 'math'; latex: string };

interface MathElement extends ElementBase {
  type: 'math';
  latex: string;                       // ex. 'E_c = \\frac{1}{2} m v^2'
  color: string;
  fontSize: number;
  parts?: { id: string; label: string }[]; // sous-expressions (\cssId) animables séparément
}

interface Plot2DElement extends ElementBase {
  type: 'plot2d';
  axes: Axes2D;                        // bornes, graduations, grille, libellés, unités, flèches
  series: Series2D[];
  decorations: PlotDecoration[];       // point mobile, tangente, aire sous la courbe, asymptote, annotation
}
type Series2D =
  | { kind: 'function';   expr: string; params: Record<string, AnimatableNumber>; stroke: Stroke }
  | { kind: 'parametric'; x: string; y: string; tRange: [number, number]; stroke: Stroke }
  | { kind: 'polar';      r: string; thetaRange: [number, number]; stroke: Stroke }
  | { kind: 'data';       points: [number, number][]; fit?: 'none' | 'linear' | 'affine' | 'quadratic' | 'exponential'; marker: Marker };

// Un paramètre peut varier dans le temps → la courbe se déforme (ex. ω augmente)
type AnimatableNumber = { value: number; to?: number; startFrame?: number; duration?: number; easing?: EasingId };

interface SimulationElement extends ElementBase {
  type: 'simulation';
  simId: string;                       // 'pendulum', 'projectile', 'rc-circuit', …
  params: Record<string, number>;      // validés par le schéma de la simulation
  display: { vectors: string[]; trajectory: boolean; labels: boolean; linkedPlots: LinkedPlot[] };
}
```

---

## 6. Fonctionnalités détaillées

### 6.1 Interface de l'éditeur

- **Barre du haut** : nom du projet, Annuler / Rétablir, format, thème, langue de l'interface, bouton **Exporter**.
- **Gauche — Bibliothèque** (onglets) : Texte · Médias · Formes & icônes · Sciences (équations, courbes, schémas) · 3D · Simulations · Modèles. Glisser-déposer vers le canevas ou clic pour ajouter au centre.
- **Centre — Canevas** : lecteur Remotion + calque de sélection (déplacer, redimensionner, pivoter, guides magnétiques, grille d'alignement), zoom du canevas, zones de sécurité.
- **Droite — Propriétés** de l'élément sélectionné, en 3 onglets : **Contenu** · **Style** · **Animation**. L'onglet Animation contient trois menus déroulants : *Apparition*, *Mise en valeur*, *Disparition*, avec **aperçu animé au survol** de chaque option, et un curseur de durée.
- **Bas** : **bande des scènes** (vignettes, glisser pour réordonner, icône de transition entre deux vignettes) + **timeline de la scène** (une barre par élément ; glisser pour régler début et durée ; tête de lecture ; forme d'onde de la voix off).
- **Assistant « Nouveau projet »** : format → langue principale → thème → modèle (ou projet vide).
- **Raccourcis** : Espace (lecture), Ctrl+Z / Ctrl+Y, Ctrl+D (dupliquer), Suppr, flèches (déplacer, Maj = ×10), Ctrl+S, Ctrl+C / Ctrl+V.
- **Interface entièrement traduite** fr / ar / en. En arabe, toute l'interface passe en RTL (mise en miroir des panneaux). La timeline reste orientée gauche → droite (le temps s'écoule vers la droite) — choix à valider avec l'utilisateur.
- **Sauvegarde automatique** toutes les 5 s après modification ; liste des projets récents.

### 6.2 Texte & typographie

**Polices embarquées** (Google Fonts, licence OFL, fichiers locaux) :

| Usage | Arabe | Latin (fr / en) |
|---|---|---|
| Moderne / titres | Cairo, Tajawal, Almarai, Changa | Poppins, Montserrat, Inter |
| Classique / lecture | Amiri, Noto Naskh Arabic | Lora, Playfair Display |
| Affiche / géométrique | Noto Kufi Arabic, Reem Kufi, Lalezar, El Messiri | Bebas Neue |
| Calligraphique / manuscrit | Aref Ruqaa | Caveat, Patrick Hand, Kalam |
| Code / données | — | JetBrains Mono |

Chaque thème associe une police arabe et une police latine harmonisées ; le changement de langue d'un texte bascule automatiquement sur la police correspondante.

**Préréglages de style de texte** : Titre, Sous-titre, Corps, Légende, Encadré « Définition », Encadré « À retenir », Encadré « Attention », Formule clé, Valeur numérique + unité, Citation.

**Effets** : couleur unie ou dégradé, contour, ombre, lueur (néon), fond (bandeau, pastille, carte), surlignage type marqueur, soulignement.

**Règles arabe & bidirectionnel (obligatoires)** :
- La direction découle de la langue ; `dir="auto"` par paragraphe pour les textes mixtes.
- Les formules en ligne, nombres avec unités et termes latins sont **isolés en LTR** (`unicode-bidi: isolate`).
- `letter-spacing` forcé à 0 en arabe ; pas de `text-transform`.
- **Jamais d'animation lettre par lettre en arabe** (découper un mot en `<span>` séparés casse les liaisons entre lettres). Repli automatique sur « mot par mot ».
- La **machine à écrire** fonctionne en affichant des sous-chaînes de graphèmes (`Intl.Segmenter`) : la mise en forme contextuelle est recalculée à chaque image, comme une vraie frappe.
- Les **révélations par masque** suivent le sens de lecture (droite → gauche en arabe).
- Option du projet : chiffres 0-9 ou ٠-٩.
- **Durée automatique** suggérée selon la longueur du texte (≈ 3 mots/s, minimum 2 s).

### 6.3 Médias

- Import par glisser-déposer ou bouton : images (png, jpg, webp, svg, gif), vidéos (mp4, webm, mov), audio (mp3, wav, m4a), animations Lottie (json). Les fichiers sont copiés dans `assets/` du projet.
- Bibliothèque de médias du projet avec vignettes, recherche, suppression des médias inutilisés.
- Images : recadrage, ajustement (couvrir / contenir), coins arrondis, bordure, ombre, masques (cercle, rectangle arrondi), effet **Ken Burns** (zoom/panoramique lent).
- Vidéos : début/fin (découpage), vitesse, muet/volume, boucle.
- Bibliothèque d'**icônes** intégrée (lucide) et de **formes** (rectangle, cercle, polygone, étoile, ligne, flèche courbe, bulle).

### 6.4 Bibliothèque d'animations

Chaque préréglage est une **fonction pure** `(progress 0→1, params, contexte) → { style, clipPath?, reveal? }`, accompagnée de métadonnées : identifiant, nom traduit, catégorie, durée par défaut, schéma de paramètres, types d'éléments compatibles, compatibilité arabe, vignette d'aperçu.

| Catégorie | Préréglages |
|---|---|
| **Apparition** | Fondu · Glisser (4 directions) · Zoom avant / arrière · Pop (rebond) · Flou → net · Rotation · Retournement 3D · Élastique · Rideau / masque (4 directions) · Machine à écrire · Mot par mot · Lettre par lettre (latin) · Ligne par ligne · **Tracé** (dessin du contour SVG) · **Écriture à la main** (tracé puis remplissage) · Glitch · Compteur (nombre qui défile, ex. `v = 0 → 12,5 m/s`) |
| **Mise en valeur** | Pulsation · Secousse · Balancement · Agrandir/réduire · Clignotement · Changement de couleur · **Surlignage marqueur** · **Soulignement dessiné** · **Entourer** (cercle tracé) · Flèche qui pointe · Lueur |
| **Disparition** | Symétriques des apparitions + Rétrécir en point, Balayage |
| **Mouvement** | Déplacement A → B · Le long d'un chemin dessiné · Orbite · Flottement |
| **Caméra de scène** | Zoom sur une zone · Panoramique · Travelling · Retour au plan large |
| **Transitions de scènes** | Coupe · Fondu · Glissement · Balayage · Zoom · Retournement · Horloge · Iris |
| **Accélérations** (noms simples) | Douce · Vive · Rebond · Élastique · Constante · Ralentie |

En mode Avancé : images clés par propriété (position, échelle, rotation, opacité, couleur) avec choix de l'accélération.

### 6.5 Thèmes visuels (« styles »)

Un thème = jetons de style : palette (5–6 couleurs nommées : fond, texte, accent 1/2/3, grille), polices arabe + latine, type de fond, style de trait (net / dessiné à la main), ombres/lueurs, animations et transitions par défaut.

| Thème | Ambiance |
|---|---|
| **Tableau noir** | Fond ardoise, texture craie, polices manuscrites, traits Rough.js, apparitions en tracé |
| **Cahier** | Papier quadrillé ou ligné, encre bleue/rouge, surlignages marqueur |
| **Blueprint** | Fond bleu technique, traits blancs fins, grille, cotations |
| **Minimal clair** | Fond blanc, couleurs vives, typographie sans empattement, flat design |
| **Sombre mathématique** | Fond noir bleuté, couleurs pastel, tracés fluides et élégants |
| **Néon** | Fond noir, couleurs saturées, lueurs |
| **Laboratoire** | Blanc et bleu, figures nettes, style manuel scolaire |
| **Typographie cinétique** | Gros titres, mouvements rapides, contrastes forts |
| **Papier découpé** | Formes en papier, ombres portées douces |

Changer de thème met à jour tout le projet en un clic (les surcharges manuelles de l'utilisateur sont conservées). **Kit de marque** : logo, couleurs personnelles, intro/outro réutilisables.

**Fonds de scène** : couleur, dégradé, texture (papier, ardoise, grille), image, vidéo, particules animées (avec graine aléatoire fixe).

### 6.6 Module Sciences (2D)

**Équations (LaTeX via MathJax SVG)**
- Éditeur avec aperçu en direct + **palette de symboles** pour la physique (vecteurs `\vec{}`, dérivées, intégrales, indices, lettres grecques, unités, flèches de réaction).
- Animations : tracé de l'équation, apparition **terme par terme**, surbrillance d'un terme, encadrement, **transformation d'une équation en une autre** (étapes de calcul : les termes communs se déplacent, les autres apparaissent/disparaissent).

**Repères & courbes 2D**
- Repère configurable : bornes, graduations, grille, flèches, noms des axes avec unités, origine.
- Types de courbes : `y = f(x)`, paramétrique `x(t), y(t)`, polaire `r(θ)`, **données mesurées** (tableau saisi ou collé) avec **modélisation** (linéaire, affine, quadratique, exponentielle) et affichage de l'équation du modèle.
- Animations : tracé progressif, **point mobile** avec coordonnées, **tangente mobile**, **aire sous la courbe** qui se remplit, **paramètre animé** (ex. l'amplitude ou ω varie → la courbe se déforme), apparition de plusieurs courbes successives, asymptotes, annotations, lignes de rappel en pointillés.
- Échantillonnage adaptatif et mémorisé (performance de l'aperçu).

**Données & graphiques** : barres, secteurs, histogramme (animés) pour les statistiques et comparaisons.

**Vecteurs, annotations & schémas**
- Vecteurs avec nom (`\vec{F}`), point d'application, norme proportionnelle, décomposition en composantes ; angles (arc + valeur) ; cotations ; repères.
- **Bibliothèque de schémas paramétrables (SVG)** :
  - Mécanique : masse, ressort, poulie, plan incliné, fil, support, chariot, sol hachuré.
  - Électricité : générateur, pile, résistance, condensateur, bobine, lampe, interrupteur, diode, DEL, ampèremètre, voltmètre, oscilloscope ; fils avec coudes automatiques.
  - Optique : lentilles convergente/divergente, miroir, prisme, rayon lumineux, écran, source, œil.
  - Divers : thermomètre, bécher, aimant, Terre/satellite.
- Bulles et encadrés pédagogiques : Définition, À retenir, Attention, Exemple, Méthode.

### 6.7 3D

- Élément « Scène 3D » avec repère 3D (axes, grille, libellés).
- Surfaces `z = f(x, y)`, courbes paramétriques 3D (ex. hélice), champs vectoriels 3D, solides (sphère, cube, cylindre, cône, plan), flèches 3D, trajectoires de particules.
- Animations : tracé progressif des courbes, croissance des surfaces, **caméra** (orbite, zoom, travelling, vue de face/dessus/profil), paramètres animés.
- Éclairage et matériaux harmonisés avec le thème (mat, brillant, filaire, translucide).
- Étiquettes : texte 3D via `drei/Text` (troika) — **vérifier le rendu de l'arabe** ; à défaut, étiquettes 2D superposées par projection des points 3D à l'écran.

### 6.8 Simulations physiques prêtes à l'emploi

**Cadre commun** : chaque simulation = un modèle physique (équations différentielles intégrées à pas fixe, **pré-calculées** et indexées par frame) + un rendu + un schéma de paramètres (avec unités et bornes) + des grandeurs exportables vers des **graphiques synchronisés** (ex. pendule à gauche, courbe θ(t) qui se trace à droite en même temps). Options : vecteurs (vitesse, accélération, forces), trajectoire, valeurs numériques, ralenti, pause sur un instant.

| Domaine | Simulations (★ = priorité v1) |
|---|---|
| Mécanique | ★ Chute libre · ★ Projectile (vecteurs vitesse) · ★ Pendule simple (amorti ou non) · ★ Masse-ressort · Plan incliné avec frottement · Mouvement circulaire uniforme · Satellite / lois de Kepler · Chocs 1D |
| Ondes | ★ Onde progressive sur une corde · Onde stationnaire · Ondes circulaires à la surface de l'eau · Interférences à deux sources · Diffraction · Effet Doppler |
| Électricité | ★ Circuit RC (charge/décharge, uC(t)) · Circuit RL · RLC oscillations amorties · Courant (électrons en mouvement) · Lignes de champ électrique · Champ magnétique (aimant, bobine) · Force de Lorentz |
| Optique | ★ Réfraction (Snell-Descartes, angle variable) · Réflexion totale · Lentille convergente (construction de l'image) · Dispersion par un prisme |
| Divers | Gaz parfait (particules, graine fixe) · Décroissance radioactive N(t) · Énergies (cinétique/potentielle/mécanique en barres animées) |

**Tests physiques obligatoires** (exemples) : période du pendule aux petits angles = 2π√(L/g) à 1 % près ; portée du projectile = v₀² sin(2α)/g ; uC(τ) = 0,63 E pour le circuit RC ; énergie mécanique conservée à 0,1 % près sur 10 périodes (sans frottement).

### 6.9 Audio, voix off & sous-titres

- Pistes audio au niveau du projet : **voix off** et **musique**, avec volume, fondu d'entrée/sortie, **atténuation automatique de la musique** pendant la voix.
- **Enregistrement de la voix off directement dans l'application** (micro, `MediaRecorder`), scène par scène, en lisant le champ « script » de la scène.
- Bouton **« Caler la durée de la scène sur la voix »**.
- Effets sonores courts (whoosh, pop, clic) intégrés et associables aux animations.
- **Sous-titres** : saisie manuelle ou **transcription automatique locale** (Whisper, arabe/français/anglais), incrustés dans la vidéo (style du thème) ou exportés en `.srt`.

### 6.10 Export

- Formats : **MP4 H.264** (par défaut, compatible partout), WebM, GIF (courts extraits), PNG d'une image (miniature YouTube).
- Résolutions : 1920×1080 (16:9), 1080×1920 (9:16, Shorts/Reels/Status), 1080×1080 (1:1), 3840×2160 (4K).
- 30 ou 60 images/s ; qualité Brouillon / Standard / Haute.
- Barre de progression, temps restant estimé, annulation, ouverture du dossier d'export.
- Export d'une seule scène ou d'un intervalle (pour vérifier rapidement).

### 6.11 Modèles de vidéos

Projets complets avec contenus d'exemple à remplacer, disponibles en fr / ar / en :
« Notion en 60 secondes » · « Définition + formule » · « Exercice corrigé pas à pas » · « Expérience simulée » · « Comparer deux phénomènes » · « Résumé de chapitre » · « Short vertical » · « Intro + outro de chaîne ».

---

## 7. Feuille de route par phases

> Règle : **une phase à la fois**, dans l'ordre. Une phase n'est terminée que lorsque tous ses critères de validation sont vérifiés, les tests passent, et un commit Git est fait.

### Phase 0 — Fondations
**Objectif** : projet qui démarre, outillage en place.
- Initialiser Vite + React + TypeScript strict, ESLint, Prettier, Vitest, Playwright.
- Installer Remotion (versions épinglées identiques) et les **skills Remotion** pour Claude Code (`npx skills add remotion-dev/skills`).
- Créer l'arborescence de la section 4 (dossiers vides avec un `README` d'une ligne si nécessaire).
- Serveur Fastify minimal ; script `npm run dev` qui lance éditeur + serveur ensemble.
- Page avec un `<Player>` affichant « Bonjour / مرحبا / Hello » animé (fondu).

**Validation** : `npm run dev` ouvre l'éditeur ; le texte arabe est correctement lié ; `npm test`, `npm run lint`, `npm run typecheck` passent.

### Phase 1 — Moteur vidéo minimal + export MP4
**Objectif** : de bout en bout, un projet JSON devient une vidéo MP4.
- Schéma zod `Project` v1 (scènes, éléments de base, animations), fonction de migration, projet d'exemple `templates/demo.json` (3 scènes, textes fr/ar/en).
- `ProjectVideo` : scènes enchaînées (`TransitionSeries`), registre d'éléments, élément Texte, élément Image, préréglages Fondu et Glisser, fond de scène couleur/dégradé.
- Chargement des polices locales avant rendu.
- Serveur : `bundle`, `selectComposition`, `renderMedia`, progression SSE, annulation. Script `npm run render:demo`.

**Validation** : `templates/demo.json` produit un MP4 1080p lisible, identique à l'aperçu ; l'arabe est correct ; tests du schéma et des fonctions d'animation.

### Phase 2 — Éditeur de base
**Objectif** : créer une vidéo simple sans toucher au JSON.
- Disposition de la section 6.1 (barre du haut, bibliothèque, canevas, propriétés, bas), bande des scènes (ajouter, dupliquer, supprimer, réordonner), sélection sur le canevas (déplacer, redimensionner, pivoter, guides magnétiques).
- Panneau Propriétés généré à partir des schémas d'éléments.
- Timeline de la scène : barres déplaçables/redimensionnables, tête de lecture, lecture/pause, affichage en secondes.
- Annuler/rétablir, sauvegarde automatique, ouvrir/créer/dupliquer un projet (dossiers sur disque via le serveur), liste des projets récents.
- Interface traduite fr / ar / en avec bascule RTL ; bouton Exporter relié à la phase 1.

**Validation** : scénario e2e Playwright « créer projet → ajouter 2 scènes → ajouter un texte arabe et une image → exporter » réussi ; l'interface en arabe est entièrement en miroir et utilisable.

### Phase 3 — Texte & typographie
- Toutes les polices du tableau 6.2, sélecteur de police avec aperçu dans l'écriture concernée.
- Préréglages de style de texte, effets (contour, ombre, lueur, dégradé, fond, surlignage).
- Texte riche avec formules en ligne, isolation bidi, option chiffres.
- Animations de texte compatibles arabe (machine à écrire par graphèmes, mot par mot, ligne par ligne, masque dans le sens de lecture) ; lettre par lettre réservé au latin avec repli automatique.
- Durée automatique selon la longueur.

**Validation** : une scène de test avec texte mixte arabe + formule + nombre avec unité s'affiche dans le bon ordre ; aucune liaison arabe cassée sur toutes les animations (vérification par captures `renderStill` à plusieurs frames).

### Phase 4 — Médias & audio
- Import glisser-déposer, bibliothèque de médias, images (recadrage, masques, Ken Burns), vidéos (découpage, vitesse, volume), Lottie, GIF, icônes, formes.
- Pistes audio voix off + musique, forme d'onde dans la timeline, fondus, atténuation automatique, enregistrement micro par scène, « caler la scène sur la voix », effets sonores.

**Validation** : vidéo exportée avec voix off enregistrée dans l'app, musique atténuée sous la voix, vidéo importée découpée ; synchronisation audio/image correcte.

### Phase 5 — Bibliothèque d'animations & transitions
- Moteur d'animation (fonctions pures, registre, accélérations), **catalogue complet** de la section 6.4, répétitions des mises en valeur, déplacement le long d'un chemin, caméra de scène, transitions de scènes.
- Menus Apparition / Mise en valeur / Disparition avec **aperçu animé au survol** (mini-lecteur en boucle).
- Mode Avancé : images clés par propriété.

**Validation** : chaque préréglage a un test unitaire (valeurs à progress 0, 0,5, 1) et une vignette d'aperçu ; démonstration « galerie » exportable listant toutes les animations.

### Phase 6 — Thèmes visuels
- Système de jetons de thème, les 9 thèmes de la section 6.5, application globale en un clic, surcharges conservées.
- Fonds (textures, grilles, particules), mode « dessiné à la main » (Rough.js, graine fixe), kit de marque (logo, couleurs, intro/outro).

**Validation** : le projet de démonstration exporté dans chacun des 9 thèmes, sans retouche manuelle, a un rendu cohérent et lisible.

### Phase 7 — Module Sciences 2D
- Équations MathJax SVG + palette de symboles + animations (tracé, terme par terme, surbrillance, transformation d'équation).
- Repères et courbes (fonction, paramétrique, polaire, données + modélisation) avec toutes les animations de la section 6.6.
- Graphiques de données, vecteurs, angles, cotations, bibliothèque de schémas (mécanique, électricité, optique), encadrés pédagogiques.

**Validation** : reproduire une vidéo « Énergie cinétique » : formule qui s'écrit, courbe Ec = f(v) tracée avec point mobile, schéma d'un chariot avec vecteur vitesse ; exactitude des courbes testée (valeurs échantillonnées).

### Phase 8 — 3D
- Élément Scène 3D, repère, surfaces, courbes paramétriques, champs vectoriels, solides, flèches, étiquettes (test arabe), préréglages de caméra, éclairage par thème.

**Validation** : hélice d'une particule chargée dans un champ magnétique, avec caméra en orbite, exportée en 1080p sans saccade ; aperçu fluide (résolution d'aperçu réduite si nécessaire).

### Phase 9 — Simulations physiques
- Cadre commun (modèle, intégrateur à pas fixe, pré-calcul, paramètres avec unités, vecteurs, graphiques synchronisés).
- Implémenter d'abord les simulations ★, puis les autres.

**Validation** : tests physiques de la section 6.8 au vert ; vidéo « pendule + graphe θ(t) synchronisé » exportée.

### Phase 10 — Export pro, sous-titres & modèles
- Panneau d'export complet (6.10), export d'une scène ou d'un intervalle, miniature PNG.
- Sous-titres manuels et automatiques (Whisper local), incrustation stylée ou `.srt`.
- Les 8 modèles de la section 6.11 en trois langues ; assistant « Nouveau projet ».

**Validation** : un utilisateur novice produit une vidéo de 1 min à partir d'un modèle en moins de 20 min (test manuel) ; sous-titres arabes correctement affichés.

### Phase 11 — Finitions & distribution
- Performance (mémoïsation, aperçu basse résolution, chargement paresseux de la 3D), gestion des erreurs (messages clairs en 3 langues), guide d'utilisation intégré (bulles d'aide au premier lancement).
- Lanceur en un double-clic (`Lancer PhysiMotion.bat` sous Windows, `.command` sous macOS) qui démarre le serveur et ouvre le navigateur.
- *(Optionnel)* Application de bureau Electron avec installateur (attention : les binaires de rendu Remotion doivent être exclus de l'archive asar).

**Validation** : installation propre sur une machine neuve en suivant uniquement le guide ; aucun message d'erreur technique visible par l'utilisateur.

---

## 8. Pièges connus & règles de qualité

1. **Déterminisme** : tout ce qui bouge dépend de `useCurrentFrame()`. Interdits dans `src/video` : `Date.now()`, `Math.random()` (utiliser `random(seed)` de Remotion), `setTimeout`, transitions et animations CSS.
2. **Polices** : chargées et attendues avant le rendu (`@remotion/fonts` / `delayRender`), sinon la première image sort avec une police de secours.
3. **Arabe** : pas de découpage lettre par lettre, `letter-spacing: 0`, isolation bidi des formules et nombres, masques dans le sens de lecture. Vérifier par captures de frames.
4. **Versions Remotion** identiques et épinglées ; mise à jour avec `npx remotion upgrade`.
5. **Séparation** : `src/video` n'importe jamais `src/editor`. Pas de Tailwind dans `src/video` (styles en ligne ou objets de style), Tailwind uniquement dans l'éditeur.
6. **Simulations et courbes pré-calculées** et mémorisées (`useMemo` sur les paramètres) ; jamais d'intégration « en direct » image après image.
7. **Médias** : toujours via les composants Remotion (`@remotion/media`, `Img`), jamais `<video>`/`<img>` HTML bruts, pour que le rendu attende leur chargement.
8. **Schéma** : toute nouvelle propriété est ajoutée au schéma zod avec une valeur par défaut ; toute rupture = nouvelle `schemaVersion` + migration testée.
9. **Interface** : aucune chaîne en dur ; toutes via i18n (fr, ar, en). Tester chaque nouveau panneau en RTL.
10. **Performance de l'aperçu** : objectif 30 i/s en 1080p sur un ordinateur portable ordinaire ; sinon réduire la résolution d'aperçu automatiquement.

---

## 9. Hors périmètre de la v1 (idées pour plus tard)

- **Assistant IA** : « décris ta leçon, l'application génère les scènes » (le projet étant un JSON validé par zod, une IA peut le produire ; nécessite une clé d'API).
- Collaboration en ligne, stockage cloud, partage direct vers YouTube.
- Avatar / présentateur animé, synthèse vocale.
- Import de diaporamas PowerPoint.
- Application mobile.

---

## 10. Prompts à copier dans Claude Code

### Prompt de démarrage (à utiliser une seule fois)

```
Lis attentivement CLAUDE.md puis PLAN.md en entier. Ne code rien encore.
Résume-moi en 10 lignes ce que tu as compris du projet, liste les points
ambigus ou les risques techniques que tu vois, et pose-moi tes questions.
```

### Prompt type pour chaque phase (remplacer N et le titre)

```
Réalise la Phase N — <titre> de PLAN.md (section 7), et uniquement celle-ci.
1. Passe d'abord en mode plan : propose ton plan d'implémentation détaillé
   (fichiers créés/modifiés, bibliothèques, tests) et attends ma validation.
2. Ensuite implémente par petites étapes, en lançant typecheck, lint et tests
   régulièrement. Consulte les skills Remotion avant d'utiliser une API Remotion.
3. Vérifie un par un les critères de validation de la phase et montre-moi la preuve
   (sortie des tests, captures renderStill, fichier MP4 produit).
4. Mets à jour la section « Journal d'avancement » de CLAUDE.md, puis fais un commit
   « phase N: <titre> ».
5. Termine par un résumé court et la marche à suivre pour que je teste moi-même.
```

### Prompt de correction

```
J'ai testé la phase N. Voici ce qui ne va pas : <description précise, captures si possible>.
Trouve la cause, corrige-la, ajoute un test qui aurait détecté ce problème,
puis vérifie à nouveau les critères de validation de la phase.
```
