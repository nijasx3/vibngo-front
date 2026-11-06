# VibnGO – front (POC pour les tests UX)

Prototype mobile (responsive) de l'application **VibnGO**, développé en React avec des **données mockées** (fichiers JSON).
Il sert à faire tester l'idée de l'application à un panel d'utilisateurs : une seule destination (**Rome**), un seul itinéraire prédéfini, aucun appel réseau.

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres commandes : `npm run build` (build statique dans `dist/`), `npm run preview`, `npm test` (tests du scoring), `npm run typecheck`.

Sur ordinateur, l'application s'affiche dans un cadre de téléphone (393 × 852) ; sur téléphone, elle prend tout l'écran.

## Déployer (lien public pour le panel / LinkedIn)

Le build est **100 % statique** (routage par `#`, chemins relatifs, polices embarquées) : il fonctionne sur GitHub Pages sous `https://nijasx3.github.io/vibngo-front/`, sans serveur.

Le workflow `.github/workflows/deploy.yml` construit et publie le prototype à chaque push sur `develop` (ou à la demande depuis l'onglet *Actions*). Réglages à faire **une seule fois** sur GitHub :

1. **Settings → Pages → Build and deployment → Source : GitHub Actions.**
2. **Settings → Environments → github-pages → Deployment branches and tags** : autoriser `develop` (par défaut, seule la branche principale peut déployer).
3. Pousser sur `develop` (ou lancer le workflow à la main). Le lien apparaît dans l'onglet *Actions* et dans Settings → Pages.

D'autres hébergeurs (Vercel, Netlify) fonctionnent aussi : commande `npm run build`, dossier `dist`.

## Session et remise à zéro

Il n'y a **aucune sauvegarde** : l'état (pseudo, profil, favoris, inscriptions, itinéraire) ne vit qu'en mémoire. **Rafraîchir la page déconnecte l'utilisateur** et ramène à l'écran d'inscription : chaque participant repart de zéro, sans rien à nettoyer.

Outils pour les tests : Profil → ⚙ Paramètres → *Outils pour les tests* → **Charger un itinéraire de démonstration**, pour tester la consultation (parcours 4) sans refaire la création.

## Les 6 parcours du prototype

| # | Parcours | Où |
|---|----------|----|
| 1 | Inscription (pseudo) → 4 questions → profil voyageur | Premier écran |
| 2 | Créer un itinéraire jusqu'à la validation | Bouton **+** de la barre de navigation, ou page *Rome* → « Créer un itinéraire pour Rome » |
| 3 | Modifier un paramètre (`geo`, `notif`) | Profil → ⚙ Paramètres |
| 4 | Consulter l'itinéraire en cours | Accueil, ou Profil → Mes itinéraires |
| 5 | S'inscrire à l'activité proposée par Paul | Communauté → « Je participe » |
| 6 | Rechercher et sauvegarder un hôtel | Explorer → rechercher « hôtel » (ou filtre *Hôtels*) → fiche → ♥ |

Les 11 écrans des maquettes Figma sont présents (Accueil en cours / avant départ, Assistant, Explorer, Communauté, Profil, Paramètres, Fiche lieu, Destination Rome, Créer un itinéraire, Carnet de voyage). Écrans ajoutés car absents des maquettes : inscription, questionnaire, résultat du profil, génération et validation de l'itinéraire, liste des hôtels.

## Données mockées (`src/mocks/`)

| Fichier | Contenu |
|---------|---------|
| `user.json` | utilisateur initial créé à l'inscription (`name`, `traveler_type`, `current_itinerary`, `like`, `parameters`, `friends`) |
| `profiles.json` | 8 profils voyageurs (nom, description, vecteur à 6 dimensions) – repris du back (`Profils.py`) |
| `questions.json` | **4 questions** retenues pour le POC (libellés repris du back) |
| `rome.json` | `pays → villes[{ville, activites[], hotels[], resto[]}]` + `point_d_interet[]` |
| `community.json` | amis, activité proposée par Paul (`offered_by`, `subscriptions`), publications, utilisateurs, événements |
| `itinerary.json` | l'itinéraire prédéfini de 3 jours + alternatives pour « Remplacer » + conseils |
| `chatbot.json` | réponses scriptées de l'assistant |

Le modèle utilisateur suit la structure du prototype : `user = { name, traveler_type, current_itinerary, like, parameters, friends }` et `activities = [{ name, offered_by, subscriptions, date }]` (voir `src/state/store.ts`).

Les écrans ne lisent **jamais** les JSON directement : tout passe par `src/api/mockApi.ts`. Pour brancher le vrai back, il suffira de remplacer ces fonctions par des appels HTTP.

> ⚠️ Les contenus de `rome.json`, `community.json` et `itinerary.json` (noms d'hôtels et de restaurants, prix, notes, avis, horaires) sont **fictifs** et servent uniquement au test. Ils ne doivent pas être présentés comme des informations réelles.

## Questionnaire et profils

Parmi les 12 questions du back, 4 ont été retenues, une par dimension : **environnement** (Q1), **rythme** (Q3), **organisation** (Q5), **rencontres** (Q7). Parmi les combinaisons de 4 dimensions étudiées, c'est celle qui répartit le plus équitablement les 8 profils (les 8 sont atteignables).

Règle de calcul (`src/lib/scoring.ts`), **déduite des vecteurs du back et à confirmer avec l'équipe back** : A = +1, B = +0,33, C = −0,33, D = −1 ; on compare les réponses aux seules dimensions posées ; le profil retenu est le vecteur le plus proche (distance euclidienne). En cas d'égalité (2 combinaisons sur 256), le premier profil de `profiles.json` l'emporte.
`npm test` vérifie que chaque profil est retrouvé à partir de ses réponses « idéales » et que les 256 combinaisons donnent le résultat attendu.

## Stack

Vite · React 18 · TypeScript · React Router (HashRouter) · Tailwind CSS v4 (couleurs et typographies de la charte dans `src/index.css`) · Zustand (état en mémoire) · lucide-react · Montserrat / Inter (embarquées) · Vitest.

## Limites connues (volontaires pour le POC)

- Pas de sauvegarde entre deux chargements de page (voulu : le prototype repart de zéro à chaque rafraîchissement).
- Pas de photos : des visuels aux couleurs de la charte les remplacent.
- Le texte saisi comme destination est repris tel quel dans l'itinéraire, mais le contenu proposé est toujours celui de Rome (3 jours).
- Chatbot scripté : il répond aux suggestions, pas au texte libre.
- Réservation, publication, stories, export PDF, message : simulés (message de confirmation uniquement).
