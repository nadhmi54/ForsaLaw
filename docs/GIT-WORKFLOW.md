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

## Workflow Frontend (Angular) dans le même repo

Cette section décrit le workflow recommandé quand tu travailles sur `frontend/` dans ce monorepo (backend + frontend).

### 1. Créer ta branche depuis `develop`

```bash
git checkout develop
git pull origin develop
git checkout -b feature/front-nom-feature
```

Exemples :
- `feature/front-auth-ui`
- `feature/front-admin-audit-page`

### 2. Travailler uniquement dans `frontend/`

- Code Angular : `frontend/src/...`
- Assets : `frontend/public/...`
- Dépendances : `frontend/package.json` et `frontend/package-lock.json`

### 3. Vérifier le front avant commit

```bash
cd frontend
npm install
npm run build
```

Notes :
- Les warnings `LF will be replaced by CRLF` sous Windows ne bloquent pas.
- Les warnings de budget Angular n'empêchent pas le build tant qu'ils restent des warnings.

### 4. Commit propre

Depuis la racine du repo :

```bash
git add frontend
git status
git commit -m "feat(front): add homepage and auth pages"
```

### 5. Push + PR vers `develop`

```bash
git push -u origin feature/front-nom-feature
```

Sur GitHub :
- Base : `develop`
- Compare : `feature/front-nom-feature`

### 6. Après merge de la PR frontend

```bash
git checkout develop
git pull origin develop
git branch -d feature/front-nom-feature
```

Ensuite (optionnel) :

```bash
git push origin --delete feature/front-nom-feature
```

### 7. Ton collègue pour récupérer le frontend

```bash
git checkout develop
git pull origin develop
cd frontend
npm install
npm run build
```

### Bonnes pratiques front pour rester structuré

- Une branche = une feature front claire.
- PR petite et lisible (UI, routing, services, etc.).
- Toujours commit `package-lock.json` si `package.json` change.
- Ne pas committer `frontend/node_modules` ni `frontend/dist` (déjà ignorés).
- Utiliser des messages explicites : `feat(front): ...`, `fix(front): ...`, `chore(front): ...`.

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

## Se mettre à jour après merge d'un coéquipier

Cas fréquent : toi ou ton ami merge une nouvelle gestion (ex. réclamation) dans `develop`, la branche feature est supprimée, et l'autre personne ne voit pas encore les nouveaux fichiers en local.

### Procédure recommandée (sans perdre son travail local)

1. Aller à la racine du repo et vérifier l'état local :

```bash
cd "C:\Users\...\ForsaLaw\ForsaLaw"
git status
```

2. Si `git status` montre des modifications locales, les mettre de côté temporairement :

```bash
git stash
```

3. Récupérer l'état distant (et nettoyer les branches supprimées) :

```bash
git fetch --all --prune
```

4. Se placer sur `develop` et récupérer la version complète :

```bash
git checkout develop
git pull origin develop
```

5. Vérifier que le merge est bien présent :

```bash
git log --oneline -n 20
```

6. Remettre ses modifications locales si un stash a été fait :

```bash
git stash list
git stash pop
git status
```

### Si la nouvelle gestion n'apparaît toujours pas

Vérifier que tu tires du bon dépôt distant :

```bash
git remote -v
```

Si besoin, corriger `origin`, puis refaire fetch/pull :

```bash
git remote set-url origin https://github.com/ForsaLaw/ForsaLaw.git
git fetch --all --prune
git checkout develop
git pull origin develop
```

### Notes importantes

- Les warnings `LF will be replaced by CRLF` sous Windows sont informatifs, pas bloquants.
- Si la branche feature de ton ami est supprimée après merge, c'est normal : il faut tirer `develop`, pas la feature.
- Toujours faire `git stash` avant `pull` si tu as des modifications non commitées.

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

---

## Workflow complet (avec sécurité secrets)

Cette section est la version opérationnelle recommandée pour le monorepo ForsaLaw (backend + frontend), avec un focus sur la sécurité des clés/API secrets.

### 1) Version `.gitignore` recommandée

```gitignore
# =========================
# Java / Spring Boot
# =========================
target/
build/
out/
*.class
*.jar
*.war
*.log

# =========================
# Frontend / Node
# =========================
node_modules/
dist/
.angular/
coverage/
.nyc_output/
*.lcov

# =========================
# IDE / Editor
# =========================
.idea/
*.iml
*.ipr
*.iws
.project
.classpath
.settings/
.vscode/
*.launch
.cursor/

# =========================
# OS files
# =========================
.DS_Store
Thumbs.db

# =========================
# Env / Secrets
# =========================
.env
.env.*
!.env.example

application-local.properties
application-local.yml
application-local.yaml
application-secret.properties
application-secret.yml
application-secret.yaml

*.pem
*.key
*.p12
*.jks
*.keystore
*.crt

*credentials*.json
*service-account*.json

# =========================
# Misc
# =========================
*.swp
*.bak
*.tmp
```

### 2) Règles sécurité obligatoires

- Ne jamais committer de vraie clé (`JWT_SECRET`, `GOOGLE_CLIENT_SECRET`, etc.).
- Mettre les vraies valeurs uniquement dans les variables d’environnement (IntelliJ Run Configuration ou terminal local).
- Garder `backend/.env.example` en placeholders uniquement.
- Vérifier le diff staged avant commit.

### 3) Démarrer une nouvelle feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nom-feature
```

### 4) Commit propre et sécurisé

Staging sélectif (exemple backend auth) :

```bash
git reset
git add backend/.env.example backend/src/main/resources/application.properties backend/src/main/java/com/forsalaw/security/JwtService.java
git diff --staged
```

Contrôle anti-secrets :

```bash
git diff --staged | findstr /I "GOCSPX GOOGLE_CLIENT_SECRET JWT_SECRET"
git check-ignore -v .env
```

Puis commit :

```bash
git commit -m "chore(security): sanitize env examples and keep secrets in env vars"
```

### 5) Push + Pull Request

```bash
git push -u origin feature/nom-feature
```

Sur GitHub :
- Base : `develop`
- Compare : `feature/nom-feature`
- Ouvrir PR, faire review, merger quand CI est verte.

### 6) Après merge PR (nettoyage)

```bash
git checkout develop
git pull origin develop
git branch -d feature/nom-feature
git push origin --delete feature/nom-feature
```

### 7) Si tu as des modifications locales qui bloquent un checkout

```bash
git stash
git checkout develop
git pull origin develop
git stash list
```

Puis soit :

```bash
git stash pop
```

ou supprimer le stash si inutile :

```bash
git stash drop
```
