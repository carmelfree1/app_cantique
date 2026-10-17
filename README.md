# Louanges à Dieu — Recueil de cantiques

Application web (PWA) : 934 cantiques lisibles hors ligne, comme un livre électronique.
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

## Mettre à jour le recueil
1. Modifier `cantiques.json` (et recopier son contenu dans `cantiques.local.js`).
2. Changer `VERSION` en haut de `sw.js` : les téléphones recevront la nouvelle version au prochain lancement.

## Installation sur les téléphones
- **Android / Chrome, Edge, Samsung Internet** : bouton « Installer » dans l'application, ou menu ⋮ → « Installer l'application ».
- **iPhone / iPad** : uniquement depuis **Safari** → Partager → « Sur l'écran d'accueil » (Chrome et les navigateurs intégrés à WhatsApp, Facebook, etc. ne savent pas installer sur iOS).
- Le site doit être servi en **HTTPS**.

## Installation : ce qui est prévu pour les téléphones
- L'application marche aussi **sans installation**, dans n'importe quel navigateur, et fonctionne hors ligne dès la première visite.
- Guide pas à pas par téléphone : `#/installer` (aussi accessible depuis l'accueil et les réglages).
- Dans le navigateur intégré de WhatsApp/Facebook (Android) : bouton « Ouvrir dans Chrome » ; sur iPhone : bouton « Copier le lien » à coller dans Safari.
- `affiche.html` : affiche imprimable avec code QR vers le site (à scanner avec l'appareil photo, ce qui ouvre le vrai navigateur).
