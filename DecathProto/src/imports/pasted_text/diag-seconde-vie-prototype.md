Crée un prototype mobile haute fidélité pour une application Decathlon Seconde Vie appelée **Diag’ Seconde Vie**.

L’objectif est de reproduire une interface proche d’un prototype existant : application mobile vendeur Decathlon, avec un style professionnel, sobre, très lisible, proche d’un outil interne métier.

L’application sert à réaliser un diagnostic de reprise vélo en magasin, en comparant le pré-diagnostic client avec le diagnostic technicien.

## Direction artistique

Créer une interface mobile portrait, type iPhone, avec :

* un **header bleu Decathlon** en haut de chaque écran ;
* un fond général gris très clair ;
* des cartes blanches arrondies ;
* des sections bien séparées ;
* des boutons larges ;
* une typographie très lisible ;
* un design fonctionnel, pas marketing ;
* un rendu proche d’un outil métier utilisé par un vendeur en magasin.

Le style doit être :

* clair ;
* efficace ;
* rassurant ;
* professionnel ;
* proche d’une application interne Decathlon ;
* très structuré.

Ne pas faire une landing page.
Ne pas faire une app trop décorative.
Ne pas utiliser de visuels lifestyle.
Ne pas utiliser un style e-commerce.
Créer une interface très opérationnelle, pensée pour un vendeur.

## Couleurs

Utiliser ces couleurs :

* Bleu Decathlon principal : `#007DBC` ou bleu Decathlon proche ;
* Fond écran : `#F3F5F7`;
* Cartes : `#FFFFFF`;
* Texte principal : `#111827`;
* Texte secondaire : `#6B7280`;
* Bordures : `#E5E7EB`;
* Vert succès : `#16A34A`;
* Orange attention : `#F59E0B`;
* Rouge refus / bloquant : `#DC2626`;
* Bleu clair information : `#E0F2FE`.

## Composants visuels à créer

Créer un design system mobile simple avec :

1. Header app

   * fond bleu Decathlon ;
   * texte blanc ;
   * titre : “DECATHLON · Seconde Vie” ;
   * retour éventuel avec flèche ;
   * hauteur compacte.

2. Carte blanche

   * coins arrondis ;
   * padding confortable ;
   * ombre très légère ou bordure subtile ;
   * utilisée pour les infos client, sections de diagnostic, résultats.

3. Bouton principal

   * bleu ;
   * texte blanc ;
   * pleine largeur ;
   * coins arrondis.

4. Bouton secondaire

   * fond blanc ;
   * bordure grise ;
   * texte bleu ou noir.

5. Boutons de choix

   * format chips ou boutons segmentés ;
   * état sélectionné visible ;
   * exemples : Excellent, Bon état, Moyen, Mauvais.

6. Badges de statut

   * En attente ;
   * Accepté ;
   * Refusé ;
   * Reprise conditionnelle ;
   * Bloquant.

7. Score circulaire ou score en grand

   * score client ;
   * score technicien ;
   * affichage très lisible.

8. Tableau comparatif

   * client vs technicien ;
   * critère ;
   * écart ;
   * impact.

9. Détail prix

   * ligne libellé + montant ;
   * montants négatifs en rouge ou gris ;
   * offre finale mise en évidence.

10. Zone photo

* placeholder gris clair ;
* texte “PHOTO” ;
* bordure pointillée ou carte discrète.

## Format général des écrans

Chaque écran doit respecter cette structure :

* Header bleu ;
* titre de page ;
* sous-titre ou contexte ;
* une ou plusieurs cartes ;
* action principale en bas ;
* navigation retour / suivant.

L’interface doit ressembler à un prototype mobile déjà existant avec des écrans très structurés, comme :

* accueil vendeur ;
* scan QR ;
* dossier client ;
* étapes de diagnostic ;
* synthèse ;
* décision ;
* reprise acceptée ;
* reprise refusée.

## Parcours à créer

Créer les écrans suivants dans l’ordre.

---

# Écran 1 — Accueil vendeur

Header :
“DECATHLON · Seconde Vie”

Titre :
“Diagnostic reprise”
Sous-titre :
“mode vendeur”

Afficher :
“Julien M. · Magasin Paris-Montparnasse”

Créer une grande carte d’action :
“Scanner le QR code client”
Sous-texte :
“Appuie pour ouvrir la caméra”

Ajouter une section :
“OU RECHERCHER UN DOSSIER”

Champ :
“N° dossier ex: DEC-00487”

Bouton secondaire :
“Nouveau sans pré-diagnostic”

Section :
“Dossiers en attente”

Liste de dossiers :

1. Marie Dupont
   “VTT Rockrider 520 · DEC-00487 · 12 min”
   Badge : “En attente”

2. Paul Rivière
   “Route Triban 100 · DEC-00481 · 2h”
   Badge : “Accepté”

3. Sophie Chen
   “Électrique B’Twin · DEC-00479 · 4h”
   Badge : “Refusé”

Les dossiers doivent apparaître sous forme de lignes ou cartes compactes avec initiales à gauche.

---

# Écran 2 — Scanner QR code

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Retour”

Titre :
“Scanner QR code”

Texte :
“Cadre le QR code du dossier client dans le viseur”

Créer un grand bloc caméra sombre ou gris foncé avec un cadre de scan.

Bouton :
“✓ Simuler la lecture (DEC-00487)”

Lien :
“Annuler”

L’écran doit donner l’impression d’un vrai scan, mais rester simple.

---

# Écran 3 — Dossier client DEC-00487

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Accueil”

Titre :
“Dossier DEC-00487”
Sous-titre :
“Marie Dupont · En attente”

En haut, afficher deux scores en cartes :

* “72” avec label “Score client”
* “85 €” avec label “Estimation ligne”

Ajouter des onglets :

* Client
* Pré-diagnostic
* Photos

Onglet Client actif.

Carte informations client :

* Nom : Marie Dupont
* Téléphone : 06 12 34 56 78
* Email : [marie.dupont@email.fr](mailto:marie.dupont@email.fr)
* Modèle déclaré : B’Twin Rockrider 520
* Année : 2019
* Km déclarés : ~2 500 km

Ajouter un encart info bleu clair :
“Vérifier le modèle et l’année avant de démarrer — le client a pu se tromper.”

Bouton principal :
“Démarrer le diagnostic”

---

# Écran 4 — Identification du vélo

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Dossier”

Titre :
“Vérification du vélo”
Sous-titre :
“Étape 0 / 5 — Identification”

Carte :
“Identification du vélo”

Texte :
“Client a déclaré : B’Twin Rockrider 520, 2019. Vérifier et corriger si nécessaire.”

Section :
“CONFIRMER / CORRIGER LE MODÈLE”

Champs :

* Catégorie de vélo : VTT
* Marque : B’Twin
* Modèle exact : Rockrider 520
* Année : 2019
* Numéro de série : Sous le pédalier
* Taille cadre : M

Section :
“PHOTOS D’IDENTIFICATION”

Deux placeholders photo :

* Plaque modèle
* Numéro série

Section :
“ÉTAT GÉNÉRAL AU PREMIER REGARD”

Boutons de choix :

* Excellent
* Bon état
* Moyen
* Mauvais

Bouton suivant en bas :
“Cadre & fourche →”

---

# Écran 5 — Cadre & fourche

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Identification”

Titre :
“Cadre & fourche”
Sous-titre :
“Étape 1 / 5”

Carte :
“Cadre & fourche · pondération 30%”

Texte :
“Client : aucun choc visible. Vérifier physiquement.”

Section :
“ÉTAT DU CADRE 30%”

Question :
“Condition générale”
Choix :

* Excellent
* Acceptable

Question :
“Rayures / impacts”
Choix :

* Aucune
* Légères
* Importantes
* Rouille

Question critique :
“Choc / déformation → BLOQUANT”
Choix :

* Non
* Oui — bloquant

Question :
“Fourche”
Choix :

* Fonctionnelle
* Hors service

Question :
“Jeu / usure”
Choix :

* Bon
* Mauvais

Section :
“PHOTOS DU CADRE”

Deux placeholders photo :

* Vue globale
* Zone critique

Bottom navigation :
“← Freins →”

Le choix “Oui — bloquant” doit être visuellement rouge.

---

# Écran 6 — Freins

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Cadre”

Titre :
“Freins”
Sous-titre :
“Étape 2 / 5”

Carte :
“Freins · pondération 25%”

Texte :
“Client : freins fonctionnels. À confirmer.”

Section :
“FREINS 25%”

Question :
“Type”
Valeur :
“V-brake / patins”

Question :
“Efficacité avant”
Choix :

* Correct
* Faible
* Inefficace

Question :
“Efficacité arrière”
Choix :

* Correct
* Faible
* Inefficace

Question :
“Usure patins / plaquettes”
Choix :

* Bonne épaisseur
* Usure normale
* À changer

Bottom navigation :
“← Transmission →”

---

# Écran 7 — Transmission

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Freins”

Titre :
“Transmission”
Sous-titre :
“Étape 3 / 5”

Carte :
“Transmission · pondération 25%”

Texte :
“Client : petites difficultés de transmission. Vérifier dérailleur.”

Section :
“TRANSMISSION 25%”

Question :
“Chaîne”
Choix :

* Propre / huilée
* Sale / sèche
* Étirée

Question :
“Dérailleur”
Choix :

* Parfait
* Passage difficile
* Bloqué

Question :
“Pédalier / boîtier”
Choix :

* OK
* Jeu / bruit
* HS

Bottom navigation :
“← Roues →”

---

# Écran 8 — Roues & pneus

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Transmission”

Titre :
“Roues & pneus”
Sous-titre :
“Étape 4 / 5”

Carte :
“Roues & pneus · pondération 10%”

Section :
“ROUES & PNEUS 10%”

Question :
“État des jantes”
Choix :

* Droites
* Léger voilage
* Voilage important

Question :
“Pneus”
Choix :

* Bonne gomme
* Usure normale
* À changer

Question :
“Roulements de moyeux”
Choix :

* Fluides
* Jeu perceptible
* Durs

Bottom navigation :
“← Finitions →”

---

# Écran 9 — Finitions

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Roues”

Titre :
“Finitions”
Sous-titre :
“Étape 5 / 5”

Carte :
“Finitions · pondération 10%”

Section :
“FINITIONS 10%”

Question :
“Selle”
Choix :

* Bon état
* Usée
* Déchirée

Question :
“Guidon / direction”
Choix :

* Stable
* Jeu
* HS

Question :
“Propreté”
Choix :

* Propre
* Nécessite nettoyage
* Très sale

Champ :
“Observations”
Placeholder :
“Notes libres…”

Bouton principal :
“Voir le scoring”

---

# Écran 10 — Synthèse diagnostic

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Finitions”

Titre :
“Synthèse diagnostic”
Sous-titre :
“Marie Dupont · VTT Rockrider 520”

Afficher deux scores en grand :

* 72 — Score client
* 61 — Score technicien

Section :
“COMPARAISON”

Créer un tableau compact :

Critère | Client | Tech | Écart

Lignes :

* Cadre | Bon | Bon | = OK
* Freins | OK | Usés | ↓ -10
* Transmission | Diff. | Diff. | = OK
* Roues | OK | Voilage | ↓ -5
* Finitions | Bon | Sale | ↓ -6

Section :
“SCORES PAR CATÉGORIE”

Barres ou lignes :

* Cadre (30%) : 85
* Freins (25%) : 60
* Transmission (25%) : 55
* Roues (10%) : 70
* Finitions (10%) : 68

Encart orange :
“Écart de 32% vs estimation client. Expliquer les frais de patins, nettoyage, réglage.”

Bouton principal :
“Générer la décision”

---

# Écran 11 — Décision de reprise

Header :
“DECATHLON · Seconde Vie”

Retour :
“← Synthèse”

Titre :
“Décision de reprise”

Carte score :
“Score technicien 61/100”

Badge orange :
“Reprise conditionnelle”

Sous-texte :
“Remise en état nécessaire”

Afficher l’offre finale en très grand :
“58 €”
Label :
“offre de reprise”

Comparaison prix :

* Estimation client : 85 €
* Offre finale : 58 €

Section :
“DÉTAIL FRAIS REMISE EN ÉTAT”

Lignes :

* Valeur vélo base : 95 €
* Remplacement patins : -12 €
* Nettoyage complet : -8 €
* Réglage dérailleur : -10 €
* Marge reconditionnement : -7 €
* Offre nette : 58 €

Section :
“AJUSTER L’OFFRE”

Champ :
“Prix de reprise (€) · fourchette 45–70 €”
Valeur :
58

Champ :
“Motif d’ajustement”
Valeur :
“Aucun ajustement”

Bottom actions :

* bouton rouge secondaire : “✕ Refuser”
* bouton vert ou bleu principal : “✓ Valider 58 €”

---

# Écran 12 — Reprise acceptée

Header :
“DECATHLON · Seconde Vie”

Titre :
“Reprise acceptée”
Sous-titre :
“Bon d’achat à remettre au client”

Afficher un grand pictogramme succès :
✓

Titre central :
“Reprise acceptée !”

Texte :
“Vélo accepté en programme Seconde Vie”

Carte QR code :
“QR code caisse — scanner en caisse”

Montant très grand :
“58 €”

Texte :
“Le client présente ce QR code en caisse pour récupérer son bon d’achat de 58 €”

Résumé :

* Client : Marie Dupont
* Vélo : VTT Rockrider 520
* Dossier : DEC-00487
* Date : 15/06/2026
* Bon d’achat : 58 €

Actions :

* Imprimer
* Email
* SMS

Message :
“Email automatiquement envoyé à [marie.dupont@email.fr](mailto:marie.dupont@email.fr)”

Bouton :
“⌂ Nouveau dossier”

---

# Écran 13 — Reprise refusée

Header :
“DECATHLON · Seconde Vie”

Titre :
“Reprise refusée”
Sous-titre :
“Communiquer les motifs”

Afficher un grand pictogramme refus :
✕

Titre :
“Reprise refusée”

Texte :
“Le vélo ne remplit pas les critères Seconde Vie”

Section :
“MOTIFS COMMUNIQUÉS AU CLIENT”

Lignes :

* Freins : patins en fin de vie
* Transmission : réglage avancé nécessaire

Section :
“ALTERNATIVES PROPOSÉES”

Carte :
“Atelier Decathlon : réparation ~45 € puis revente possible”

Carte :
“Recyclage gratuit en magasin”

Bouton :
“⌂ Nouveau dossier”

---

## Contraintes d’intégration

Le prototype doit être pensé pour être facilement intégré en React Native / Expo.

Créer des composants simples :

* Header ;
* Card ;
* Button ;
* ChoiceChip ;
* StatusBadge ;
* ScoreCard ;
* PhotoPlaceholder ;
* ComparisonTable ;
* PriceBreakdown ;
* BottomActionBar.

Respecter des espacements constants :

* padding écran : 16 px ;
* gap entre cartes : 12 à 16 px ;
* border radius : 12 à 16 px ;
* boutons hauteur 48 px minimum.

Ne pas générer des composants trop complexes.
Ne pas utiliser de layout impossible à intégrer.
Prévoir que chaque écran soit scrollable si le contenu dépasse.

## Résultat attendu

Créer un prototype mobile complet, cliquable, fidèle au parcours vendeur Decathlon Seconde Vie, avec un rendu très proche des frames existantes :

* header bleu ;
* cartes blanches ;
* diagnostic structuré par étapes ;
* comparaison client / technicien ;
* décision de reprise ;
* acceptation / refus ;
* ton professionnel et opérationnel.

L’interface doit donner l’impression d’une application interne Decathlon prête à être testée en magasin.
