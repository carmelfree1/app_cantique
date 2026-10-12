# Louanges à Dieu — Recueil de cantiques

Application web (PWA) : 883 cantiques lisibles hors ligne, comme un livre électronique.
HTML + CSS + JavaScript, sans serveur ni SQL : les données sont intégrées dans `data.js`.

## Fonctions
- Lecture en strophes et refrains, pages qui se tournent (glisser ou flèches du clavier)
- Recherche instantanée (titres, paroles, numéro ; insensible aux accents)
- Accès par numéro, séries de 100, index alphabétique, 12 thèmes
- Favoris, reprise de la lecture, partage
- Taille du texte, thèmes Papier / Clair / Sombre, mode « grand écran » pour le chantre, écran maintenu allumé
- Installable et 100 % hors ligne (service worker)

## Lancer
```
python -m http.server 8000
```
puis ouvrir http://localhost:8000 (le mode hors ligne exige http(s), pas `file://`).

Le n° 666 n'existe pas dans le recueil d'origine.
