# VibnGO – front (prototype pour les tests UX) · refonte mobile

Prototype mobile (responsive) de l'application **VibnGO**, développé en React avec des **données mockées** (fichiers JSON).
Il reprend la **refonte mobile** du design (export « VibnGo — Refonte mobile ») et sert à faire tester l'application à un panel d'utilisateurs : une seule destination (**Rome**), aucun appel réseau.

> **Avancement de la refonte — Lot 1/3** : nouveau style + les 6 parcours de test. Les lots 2 (voyages, carnet, réservations, déplacements, collaboration) et 3 (messages, trophées/récompenses, notifications) arrivent ensuite ; les entrées correspondantes affichent « Bientôt disponible ».

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres commandes : `npm run build` (vérifie les types puis construit `dist/`), `npm run preview`, `npm test` (scoring + logique d'itinéraire).

Sur ordinateur, l'application s'affiche dans un cadre de téléphone (393 × 852) ; sur téléphone, elle prend tout l'écran.

## Déployer (lien public pour le panel / LinkedIn)

Le build est **100 % statique** (routage par `#`, chemins relatifs, polices et photos embarquées) : il fonctionne sur GitHub Pages sous `https://nijasx3.github.io/vibngo-front/`, sans serveur.

Le workflow `.github/workflows/deploy.yml` construit et publie le prototype à chaque push sur `develop` (ou à la demande depuis l'onglet *Actions*). Réglages à faire **une seule fois** sur GitHub :

1. **Settings → Pages → Build and deployment → Source : GitHub Actions.**
2. **Settings → Environments → github-pages → Deployment branches and tags** : autoriser `develop`.
3. Pousser sur `develop` (ou lancer le workflow à la main).

## Session et remise à zéro

Aucune sauvegarde : l'état (pseudo, profil, sauvegardes, inscriptions, itinéraire) ne vit qu'en mémoire. **Rafraîchir la page déconnecte l'utilisateur** et ramène à l'écran de bienvenue : chaque participant repart de zéro.

Outils pour les tests (Profil → ⚙ Paramètres → *Outils de test*, hors design) : **Charger un voyage à Rome en cours** (pour tester la consultation sans refaire la création) et **Se déconnecter**.

## Les 6 parcours de test

| # | Parcours | Où |
|---|----------|----|
| 1 | Inscription (pseudo) → 12 questions → pays visités (facultatif) → profil voyageur → destinations pour toi → itinéraire de Rome → enregistrement | Premier écran |
| 2 | Créer un itinéraire jusqu'à la validation, **avec Vibi** (message → programme → modifier → enregistrer) ou **sans Vibi** (dates, budget, transport → activités jour par jour → enregistrer) | Bouton **Créer** (+) du menu, ou Explorer → Rome → « Créer un itinéraire » |
| 3 | Modifier un paramètre (`geo` = Géolocalisation, `notif` = Notifications › Événements à proximité) | Profil → ⚙ Paramètres |
| 4 | Consulter l'itinéraire en cours (Retarder / Reporter / Changer une étape) | Accueil, ou Profil → Mes voyages |
| 5 | S'inscrire à l'activité proposée par un ami (« Visite des Catacombes » de Tom Bernard) | Communauté → « Je participe » |
| 6 | Rechercher et sauvegarder un hôtel à Rome | Explorer → « Rome » → Filtres → Hébergements → fiche → marque-page |

Pour voir l'accueil **avant départ** (compte à rebours J−N), créer un voyage « sans Vibi » avec des dates futures.

## Données mockées (`src/mocks/`)

| Fichier | Contenu |
|---------|---------|
| `user.json` | utilisateur créé à l'inscription : `{ name, traveler_type, current_itinerary, like, parameters, friends }` |
| `questions.json` | les **12 questions** du design (2 par dimension) |
| `profiles.json` | 8 profils (nom, description du design, vecteur à 6 dimensions repris du back, illustration, ordre des 4 destinations) |
| `destinations.json` | destinations du design (Rome, Kyoto, Patagonie, Bali…) – seule Rome est ouverte |
| `places.json` | destination Rome + lieux (Colisée, Trevi, Pincio, Musée Borghèse…) + hébergements |
| `explore.json` | activités, vibers (utilisateurs) et événements de l'onglet Explorer |
| `trip.json` | itinéraire de Rome (8 jours), alternatives pour « Changer », suggestions d'activités |
| `community.json` | fil de la Communauté, invitation de Tom Bernard (`subscriptions`), amis |
| `chatbot.json` | réponses scriptées de Vibi |

Modèle : `user = { name, traveler_type, current_itinerary, like, parameters, friends }` ; `activities = [{ name, offered_by, subscriptions, date }]` (voir `src/state/store.ts`). Les écrans ne lisent **jamais** les JSON directement : tout passe par `src/api/mockApi.ts`.

> ⚠️ **Contenus fictifs** : le jour 1 de l'itinéraire, les lieux Colisée/Trevi/Pincio/Borghèse et l'hôtel Colosseum Palace viennent du design ; les jours 2 à 8, les autres hôtels, les prix, notes, avis, horaires et notes de lieux hors Colisée sont **inventés** pour les tests.

## Questionnaire et profils

12 questions, 2 par dimension : environnement, rythme, organisation, rencontres, confort, découverte. Règle de calcul (`src/lib/scoring.ts`), **déduite des vecteurs du back et à confirmer avec l'équipe back** : A = +1, B = +0,33, C = −0,33, D = −1 ; la valeur d'une dimension est la **moyenne de ses 2 réponses** (ce qui explique les valeurs ±0,66 des vecteurs) ; le profil retenu est le vecteur le plus proche (distance euclidienne) ; en cas d'égalité, le premier profil de `profiles.json` l'emporte.
« Passer » sur l'écran d'introduction crée un compte « Nouveau voyageur » sans profil.

## Design

Polices **Space Grotesk** (titres et texte) et **Space Mono** (lettres A–D du questionnaire), couleurs de `src/index.css` relevées sur l'export (fond `#fbf9f7`, brun `#5a2e1f`, orange `#e86c3c`, cartes `#f1e9e2`). Les photos et illustrations de profil sont **extraites du PDF d'export** (basse résolution) : à remplacer par les originaux (et créditer les auteurs) avant toute diffusion large.

## Stack

Vite · React 18 · TypeScript · React Router (HashRouter) · Tailwind CSS v4 · Zustand (état en mémoire) · lucide-react · Space Grotesk / Space Mono (embarquées) · Vitest.

## Limites connues (volontaires pour le prototype)

- Rome uniquement : les autres destinations affichent « Bientôt ».
- Vibi est scripté : en création, n'importe quel message produit l'itinéraire de Rome, départ aujourd'hui, 2 voyageurs ; l'assistant général répond aux suggestions.
- Plan du jour : illustration schématique (pas de fond de carte).
- Réorganiser le programme se fait avec des boutons ↑ ↓ (pas de glisser-déposer).
- Réservation, publication, stories, messages, notifications, trophées, carnet, réservations, déplacements, collaboration : Lots 2 et 3 (ou simulés par un message).
