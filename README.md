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

## Deux recueils
L'application sait afficher deux recueils **séparés**, chacun avec sa numérotation, ses favoris, sa couleur
(bordeaux pour « Louanges à Dieu », bleu pour « Recueil Cantiques ») et un badge sur chaque cantique.
Le second recueil n'apparaît que si le fichier `recueil2.json` existe (sinon l'application reste comme avant).

Pour l'ajouter à partir d'un scan :
1. `python tools/ocr_scan.py scan.pdf brut.txt` (Tesseract requis, voir l'en-tête du script) ;
2. relire et corriger `brut.txt`, au format décrit dans `tools/build_recueil.py` ;
3. `python tools/build_recueil.py brut.txt` crée `recueil2.json` et `recueil2.local.js` ;
4. changer `VERSION` dans `sw.js`, puis publier.

## Contenu du second recueil
`recueil2.json` a été produit à partir du document `Recueil_cantiques_reprise_manuelle_pages_59_70.docx`
(579 cantiques, numéros 1 à 662). Les cantiques dont le texte est incertain affichent un avertissement ;
la liste complète est dans `docs/Passages_a_verifier_recueil2.txt`.
La comparaison avec le scan (pages 1 à 22) est dans `docs/Comparaison_scan_recueil2.txt`.

## Installation : ce qui est prévu pour les téléphones
- L'application marche aussi **sans installation**, dans n'importe quel navigateur, et fonctionne hors ligne dès la première visite.
- Guide pas à pas par téléphone : `#/installer` (aussi accessible depuis l'accueil et les réglages).
- Dans le navigateur intégré de WhatsApp/Facebook (Android) : bouton « Ouvrir dans Chrome » ; sur iPhone : bouton « Copier le lien » à coller dans Safari.
- `affiche.html` : affiche imprimable avec code QR vers le site (à scanner avec l'appareil photo, ce qui ouvre le vrai navigateur).
