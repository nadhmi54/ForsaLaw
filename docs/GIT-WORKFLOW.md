# ForsaLaw – Git Workflow

Guide rapide du workflow Git pour le projet ForsaLaw (branches, commits, Pull Requests).

---

## Branches

| Branche | Rôle |
|---------|------|
| **main** | Code en production. Ne pas committer directement dessus. |
| **develop** | Intégration. Branche de travail principale. |
| **feature/xxx** | Nouvelle fonctionnalité. Part de `develop`, revient dans `develop`. |
| **fix/xxx** | Correction de bug. Part de `develop`, revient dans `develop`. |
| **hotfix/xxx** | Urgence sur la prod. Part de `main`, merge dans `main` puis `develop`. |

---

## Workflow au quotidien

### 1. Démarrer une nouvelle feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nom-de-la-feature
```

Exemple : `feature/rag-upload`, `feature/chat-websocket`.

### 2. Travailler et committer

```bash
git add .
git status
git commit -m "feat: description courte et claire"
```

### 3. Pousser et ouvrir une Pull Request

```bash
git push -u origin feature/nom-de-la-feature
```

Puis sur GitHub : **Pull requests** → **New pull request**  
- Base : `develop`  
- Compare : `feature/nom-de-la-feature`  
→ **Create pull request**.

### 4. Après merge de la PR

Sur GitHub : merger la PR (souvent "Squash and merge" ou "Merge pull request").  
En local :

```bash
git checkout develop
git pull origin develop
git branch -d feature/nom-de-la-feature
```

---

## Quand ta branche est « behind » (en retard)

Sur GitHub tu peux voir par exemple : **« This branch is 2 commits ahead and 1 commit behind main »**.  
Ça veut dire : ta branche a des commits que l’autre n’a pas (ahead), et l’autre branche a des commits que ta branche n’a pas (behind). Pour rester à jour, il faut **récupérer** ces commits dans ta branche.

### Cas : c’est ta **branche feature** qui est behind **develop**

Tu es sur `feature/ma-feature` et `develop` a avancé (d’autres PR mergées). Tu veux que ta branche contienne les derniers changements de `develop` pour éviter les conflits au moment de la PR.

**Commandes :**

```bash
git checkout feature/ma-feature
git fetch origin
git merge origin/develop
# en cas de conflits : les résoudre, puis git add . && git commit
git push origin feature/ma-feature
```

Ou en une ligne après `git checkout feature/ma-feature` :

```bash
git pull origin develop
```

Ensuite tu continues à travailler et tu ouvres ta PR **feature/ma-feature** → **develop** comme d’habitude.

---

## Quand le build CI échoue

Quand la CI (ex. « Backend (Spring Boot) ») est en échec après un push ou une PR :

### 1. Vérifier l’erreur

- Sur GitHub : **Actions** → ouvrir le workflow en échec → ouvrir le job (ex. « Backend (Spring Boot) ») → lire les logs du step qui a échoué (ex. « Build »).
- Repérer le message d’erreur (ex. dépendance manquante, compilation, test).

### 2. Corriger en local

- Corriger le code ou la config (ex. `pom.xml`, fichiers Java) sur ta branche.
- Tester en local si possible :
  ```bash
  mvn -q -B compile
  ```
  ou
  ```bash
  mvn -q -B test -DskipTests
  ```

### 3. Pousser la version corrigée pour relancer le build

```bash
git add .
git status
git commit -m "fix: description de la correction (ex. fix: add missing dependency version)"
git push origin -u feature/nom-feature
```

Exemple si tu es sur la branche `feature/ci` :

```bash
git add .
git commit -m "fix: remove flyway-database-postgresql to fix CI build"
git push origin feature/ci
```

La CI se relance automatiquement après le push. Vérifier dans **Actions** que le workflow est vert.

---

## Corriger un bug (fix)

```bash
git checkout develop
git pull origin develop
git checkout -b fix/description-du-bug
# ... corrections ...
git add .
git commit -m "fix: description du correctif"
git push -u origin fix/description-du-bug
```

Ouvrir une PR **fix/xxx** → **develop**, merger, puis mettre à jour `develop` en local comme ci-dessus.

---

## Préparer une release (develop → main)

Quand `develop` est prête pour la prod :

1. Sur GitHub : **Pull requests** → **New**  
   - Base : `main`  
   - Compare : `develop`
2. Titre type : `Release: résumé des changements`
3. Merger après validation (et passage de la CI).
4. En local :

```bash
git checkout main
git pull origin main
git checkout develop
git merge main
git push origin develop
```

---

## Conventions de commits

| Préfixe | Usage |
|---------|--------|
| **feat:** | Nouvelle fonctionnalité |
| **fix:** | Correction de bug |
| **chore:** | Tâche technique (config, deps, scripts) |
| **docs:** | Documentation uniquement |
| **refactor:** | Refactoring sans changement de comportement |
| **test:** | Ajout ou modification de tests |
| **style:** | Formatage, espaces, pas de changement de code métier |

Exemples :

- `feat: upload PDF juridiques pour le RAG`
- `fix: token JWT expiré côté frontend`
- `chore: mise à jour dépendances Spring Boot`

---

## Commandes utiles

```bash
# Voir les branches
git branch -a

# Voir le statut
git status

# Voir l’historique
git log --oneline -10

# Mettre à jour develop
git checkout develop
git pull origin develop

# Annuler les modifs non commitées (fichier)
git checkout -- chemin/fichier

# Annuler le dernier commit (garder les modifs)
git reset --soft HEAD~1
```

---

## En résumé

1. Toujours partir de **develop** à jour pour créer **feature/xxx** ou **fix/xxx**.
2. Committer souvent avec des messages **feat:** / **fix:** / **chore:**.
3. Pousser la branche et ouvrir une **Pull Request** vers **develop**.
4. Merger via la PR (la CI doit être verte).
5. Pour une release : PR **develop** → **main**, puis merger.

Voir aussi **docs/DEVOPS.md** pour la vue d’ensemble (CI, protection des branches, paramétrage GitHub).
