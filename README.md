# 📊 Balançoire - Application de comptabilité simplifiée pour associations

Outil minimaliste pour répondre, en douceur, aux obligations comptables des associations.

---

## 📌 Contexte Légal

Pour les associations à but non lucratif avec activité commerciale :

- **Obligations minimales** :

  - Bilan simplifié + compte de résultat
  - Inventaire annuel des actifs/passifs
  - Dépôt des tableaux 2033A + formulaire 2065 sous 3 mois après clôture

- **Spécificités** :  
  🟢 Livre journal
  🟢 Grand livre
  🟢 Compte de résultat  
  🟢 Bilan fiscal simplifié
  🟢 Inventaires
  🟢 Fichier des Écritures Comptables
  🟢 Balances

---

## 🚀 Mode d'emploi

### ▶️ Version bac à sable

[![Ouvrir le bac à sable](https://img.shields.io/badge/🛠️-Tester_l'application-2ea44f)](https://balancoire.pntbr.fr)

- Utilisez les **données exemple** modifiables
- Réinitialisation quotidienne à minuit
- Visualisez en temps réel :  
  | 📑 journal | 📑 grand livre | 📑 Bilan | 📈 Compte de résultat | 📦 Inventaire | 📑 FEC | 📑 Balance

### 🔗 en utilisant vos propres données

1. **Copiez** le [modèle Google Sheet](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs)
2. **Renseignez** votre ID de feuille dans l'app :
   ```txt
   Exemple : https://docs.google.com/spreadsheets/d/ID_ICI/
   → ID = ID_ICI
   ```
3. Connectez l'application via le bouton : "connecter"

### 💻 Développement local

1. Téléchargez les fichiers
2. Lancez le serveur

```bash
   cd /chemin/vers/le-dossier
   python3 -m http.server 8000
```

3. Accédez à : http://localhost:8000
4. Naviguez dans l'application pour accéder aux différentes fonctionnalités comme la saisie des écritures, la consultation du grand livre, du bilan, etc.

## 🧮 Structure du Google Sheet

| **Onglet** | Description | Lien exemple
| **ANNÉE-XXXX** | Écritures comptables par exercice | [Voir](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs/edit?gid=1036658743#gid=1036658743)
| **Résultats** | Calculs automatiques par année | [Voir](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs/edit?gid=981539826#gid=981539826)
| **Inventaires** | Gestion des stocks (quantité + valeur) | [Voir](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs/edit?gid=1841174573#gid=1841174573)
| **Plan comptable** | Personnalisation des postes & synonymes | [Voir](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs/edit?gid=377402254#gid=377402254)
| **Postes** | Liste automatisée des postes utilisés | [Voir](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs/edit?gid=183366098#gid=183366098)
| **Paramètres** | Configuration des identifiants d'onglets | [Voir](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs/edit?gid=0#gid=0)

Chaque fois qu'une opération est entrée, il suffit de réactualiser la page du navigateur pour qu'elle soit prise en compte.

Pour tester l'application si l'utilisateur n'a pas renseigné son propre tableau, un tableau de test est disponible :
[Tableau de test](https://docs.google.com/spreadsheets/d/1EjBuZN2Brq9x1UoLKqCcipUxZRoG5gSFHu0eoXpy0oY/edit?gid=929320585#gid=929320585)

## 📋 Plan Comptable Simplifié

| Code | Intitulé principal | Synonymes courants |
| 512000 | Banques |
| 707000 | Ventes de marchandises | "ventes", "boutique"
| 625000 | Déplacements et missions | "restauration", "hébergements"
| 756000 | Cotisations
| [...] | [...] | [...]

Les postes utilisés par l'application sont définis dans le fichier l'onglet : [plan comptable](https://docs.google.com/spreadsheets/d/1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs/edit?gid=377402254#gid=377402254).

Par exemple, pour le poste `707000`, vous pouvez indifféremment utiliser "ventes de marchandises" ou "ventes" ou "boutique".

🔄 Workflow Comptable

- Saisie quotidienne dans l'onglet annuel (Ex: "2025" pour l'exercice en cours)
- Vérification via l'onglet Résultats

Clôture :

- Génération automatique du bilan, grand livre et compte de résultat.
- Export des écritures

## ❓ Assistance

Un problème ? Une suggestion ?

📧 Contact technique : stephane@pntbr.fr
