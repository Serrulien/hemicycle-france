# Changelog
Les changements notables du projet seront documentés dans ce fichier.

Le format se base sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et le projet utilise le [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
Aucune modification à venir pour le moment.

## [1.0.1] - 2019-05-28

### Ajouts
feat(app): la sélection des colonnes siège et data se fait par le nom ou numéro de colonne (39d5800)  
refactor(app): ajoute un header contenant les liens (69675df)  
fix(app): ajoute un .catch pour capturer les throws des .then (af214db)  
chore(release): ajoute les csv et images d'exemple (a38e6f4)  

### Modifications
feat(app): les options avancées pour import sont afficheable + un peu de style (8991042)  
refactor(app): colonne data -> colonne de données (c7be16e)  
refactor(app): LIre -> Injecter (9311889)  

### Suppressions
refactor(app): supprime un console.log (b7c1d12)  
feat(app): supprime le bouton colorer les sièges aléatoirement (ee2962b)  
docs(csv): supprime les anciens fichiers csv (0264a81)  

### Corrections de bugs
fix(main): corrige l'appel à un mauvais logger pour interruption (d1122f8)  
fix(app): mauvaise méthode d'accès à la couleur de la ligne (abef2ca)  

## [1.0.0] - 2019-05-27
Publication de la version initiale de [hemicycle-france].

[1.0.1]: https://github.com/Serrulien/hemicycle-france/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Serrulien/hemicycle-france/releases/tag/v1.0.0
[hemicycle-france]: https://serrulien.github.io/hemicycle-france/principale.html