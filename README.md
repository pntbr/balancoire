# Application de comptabilité pour Brut de Thé

L'objectif est de réaliser une application simple de comptabilité d'engagement pour pouvoir répondre aux exigences légales.

## Contexte

Brut de Thé est une association à but non lucratif ayant une activité commerciale

- Régime Réel Simplifié - RSI
- Franchise de TVA

## Obligations légales

Les associations soumises au régime réel simplifié doivent tenir une comptabilité classique : un bilan, un compte de résultat et des annexes. Des dispositions particulières s’appliquent pour alléger vos obligations comptables :

- le livre journal n’enregistre journellement que les recettes encaissées et les dépenses payées,
- les créances et les dettes sont constatées à la clôture de l’exercice,
- le bilan fourni à l’administration fiscale est un bilan simplifié.

Dans les trois mois suivant la clôture de l’exercice, vous devez déposer un bilan comptable simplifié (tableaux 2033 A et suivants) joint au formulaire n° 2065 (impôt sur les sociétés).

L'association doit établir un inventaire au moins une fois par an pour évaluer ses actifs (stocks, immobilisations, créances) et ses passifs (dettes).

## Mode d'emploi

Pour utiliser l'application de comptabilité, suivez les étapes ci-dessous :

1. **Installation :** Après avoir téléchargé les fichiers de l'application, placez-les dans le répertoire de votre choix.

2. **Configuration :**
3. **Lancement de l'application :** En utilisant un terminal, lancez un serveur web dans le dossier de l'application. Par exemple :

   ```sh
   cd le_chemin_vers_votre_dossier
   python -m SimpleHTTPServer 8000
   ```

   ou si vous obtenez un message d'erreur

   ```sh
   cd le_chemin_vers_votre_dossier
   python3 -m http.server 8000
   ```

   Ouvrez votre navigateur et accédez à `http://localhost:8000` pour voir l'application en action.

4. **Utilisation :** Naviguez dans l'application pour accéder aux différentes fonctionnalités comme la saisie des écritures, la consultation du grand livre, du bilan, etc.

## Google Sheet

L'application utilise un Google Sheet pour saisir les écritures comptables. Ce Google Sheet doit contenir plusieurs onglets :

- **Onglets Année :** Chaque année doit avoir son propre onglet pour enregistrer les écritures. Les colonnes typiques incluent : "qui paye ?", "date", "qui reçoit", "poste", "montant", "nature", "pointage", "note", "facture correspondante".
- **Onglet Résultat :** Cet onglet calcule le résultat pour l'année sélectionnée. Une cellule permet de changer l'année pour afficher les résultats correspondants.

- **Onglet Inventaire :** Permet de gérer les variations de stocks pour toutes les années avec les colonnes : "année", "description", "numéro", "quantité", "valeur unique", "valeur totale", "notes".

- **Onglet Poste :** Gère automatiquement les différents postes comptables.

Chaque fois qu'une opération est entrée, il suffit de réactualiser la page du navigateur pour qu'elle soit prise en compte.

Pour tester l'application si l'utilisateur n'a pas renseigné son propre tableau, un tableau de test est disponible :
[Tableau de test](https://docs.google.com/spreadsheets/d/1EjBuZN2Brq9x1UoLKqCcipUxZRoG5gSFHu0eoXpy0oY/edit?gid=929320585#gid=929320585)

## Postes Comptables

Les postes utilisés par l'application sont définis dans le fichier `plan-comptables.js`. Voici une liste des principaux postes avec leurs synonymes possibles :

- `"106000": ["réserves"]`
- `"119000": ["report à nouveau (solde débiteur)", "report"]`
- `"120000": ["résultat de l'exercice (excédent)", "excédent"]`
- `"129000": ["résultat de l'exercice (déficit)", "déficit"]`
- `"275000": ["dépôts et cautionnements versés", "cautions"]`
- `"370000": ["stocks de marchandises", "inventaire"]`
- `"404000": ["fournisseurs d'immobilisations"]`
- `"444000": ["état - impôts sur les bénéfices"]`
- `"467000": ["autres comptes débiteurs ou créditeurs", "remboursements", "prêts"]`
- `"512000": ["banques"]`
- `"530000": ["caisse"]`
- `"602600": ["emballages"]`
- `"603700": ["variation des stocks de marchandises"]`
- `"604000": ["achats d'études et prestations de services", "achats prestations"]`
- `"606000": ["achats non stockés de matière et fournitures", "fournitures", "décorations", "énergies"]`
- `"607000": ["achats de marchandises", "marchandises"]`
- `"613000": ["locations"]`
- `"616000": ["primes d'assurances", "assurances"]`
- `"618300": ["documentation technique", "documentations"]`
- `"618500": ["frais de colloques, séminaires, conférences", "conférences"]`
- `"622000": ["rémunérations d'intermédiaires et honoraires", "intermédiaires"]`
- `"623000": ["publicité, publications, relations publiques", "communication"]`
- `"624100": ["transports sur achats"]`
- `"625000": ["déplacements, missions et réceptions", "déplacements", "restauration", "hébergements"]`
- `"626000": ["frais postaux et de télécommunications", "internet", "frais postaux", "télécommunications", "domiciliations"]`
- `"627000": ["services bancaires et assimilés", "services bancaires"]`
- `"695000": ["impôts sur les bénéfices"]`
- `"706000": ["prestations de services", "formations"]`
- `"707000": ["ventes de marchandises", "ventes"]`
- `"754100": ["dons manuels", "dons"]`
- `"756000": ["cotisations"]`
- `"890000": ["bilan d'ouverture"]`
- `"891000": ["bilan de clôture"]`

Par exemple, pour le poste `707000`, vous pouvez indifféremment utiliser "ventes de marchandises" ou "ventes".

Pour toute question ou problème, veuillez consulter la section d'aide ou contacter : stephane@pntbr.fr.

#### Un nom ?

- balançoire
- dans le brouillard
- balance tes comptes
- le boulier
-
