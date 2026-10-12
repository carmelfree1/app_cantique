# Louanges à Dieu — Recueil de cantiques

Application web (PWA) : 883 cantiques lisibles hors ligne, comme un livre électronique.
HTML + CSS + JavaScript, sans serveur ni SQL : toutes les données sont dans `cantiques.json`.

## Fonctions
- Lecture en strophes et refrains, pages qui se tournent (glisser ou flèches du clavier)
- Recherche instantanée (titres, paroles, numéro ; insensible aux accents)
- Accès par numéro, séries de 100, index alphabétique, 12 thèmes
- Favoris, reprise de la lecture, partage
- Taille du texte, thèmes Papier / Clair / Sombre, mode « grand écran » pour le chantre, écran maintenu allumé
- Installable et 100 % hors ligne (service worker)

## Héberger
Aucune compilation : copiez ces fichiers tels quels sur n'importe quel hébergement statique
(GitHub Pages, Netlify, serveur web classique...), en HTTPS pour l'installation et le mode hors ligne.


## Test en local
Double-cliquer sur `index.html` fonctionne (les données sont lues dans `cantiques.local.js`, copie de `cantiques.json`
utilisée uniquement hors serveur). Si vous modifiez `cantiques.json`, recopiez son contenu dans `cantiques.local.js`
sous la forme `window.__CANTIQUES=<contenu>;`. L'installation PWA et le hors-ligne nécessitent HTTPS.
