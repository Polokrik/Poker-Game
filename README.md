# Hold'em Académie

Apprendre le Texas Hold'em en décidant : cours, quiz, grille de ranges, entraînement preflop, calculs, situations, table contre des bots, simulateur d'équité.
Site statique (HTML/CSS/JS, sans build), mobile et PC, installable et utilisable hors-ligne. Déployé sur GitHub Pages à chaque push sur `main`, après réussite des tests.

## Contenu
| Page | Rôle |
|---|---|
| Cours, Quiz | 6 chapitres, 33 questions (QCM, vrai/faux, classement) |
| Ranges | Grille 13×13 par position, ouverture / face à une relance / face à une 3-bet |
| Preflop | Entraîneur de décisions avec série et taux de réussite |
| Calculs | Cotes du pot, outs (règle 2/4), combinatoire, MDF, EV |
| Situations | 13 cas du plus courant au plus rare, équité simulée en direct |
| Jouer | Cash game à 6 contre 5 bots (débutant, intermédiaire, avancé), coach optionnel, revue de chaque main |
| Simulateur | Équité de n'importe quelle main contre 1 à 9 adversaires |
| Probas | Fréquences réelles des mains, mesurées par simulation |
| Légendes | Coups célèbres et idées des experts |

## Architecture
- `engine.js` : évaluation de mains, Monte-Carlo, score de Chen
- `game.js` : moteur de partie (enchères, tapis, side pots, abattage), sans DOM
- `bots.js` : trois niveaux de bots ; `ranges.js` : ranges preflop et conseils
- `play.js`, `train.js`, `situations.js`, `app.js` : interface
- `tests/run.js` : `node tests/run.js` (évaluation, équités connues, side pots, conservation des jetons sur des centaines de mains de bots, cohérence des ranges et du contenu)

## Limites connues
- Les ranges sont une approximation (score de Chen), pas une sortie de solveur.
- L'équité du coach est calculée contre des mains aléatoires : face à une mise, le vrai range adverse est plus fort.
- Les bots sont heuristiques (aucun ne s'adapte à vos habitudes).

## Idées pour la suite
- Revue de session sur plusieurs mains (fuites récurrentes)
- Mode tournoi (blinds croissantes, ICM, push/fold)
- Ranges adverses dans le coach (équité contre un range plutôt que contre des mains aléatoires)
