# ForsaLaw – Culture DevOps

## Stratégie de branches

| Branche      | Rôle |
|-------------|------|
| **main**    | Production, toujours déployable. |
| **develop** | Intégration, pré-production. |
| **feature/*** | Nouvelle fonctionnalité (ex: `feature/rag-upload`). |
| **fix/***   | Correctif (ex: `fix/login-jwt`). |
| **hotfix/*** | Urgence en prod. |

## Workflow au quotidien

1. Partir de **develop** à jour :
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Créer une branche de travail :
   ```bash
   git checkout -b feature/nom-de-la-feature
   ```

3. Développer, committer avec des messages clairs :
   ```bash
   git add .
   git commit -m "feat: description"
   ```

4. Pousser et ouvrir une **Pull Request** sur GitHub :
   ```bash
   git push -u origin feature/nom-de-la-feature
   ```
   → Sur GitHub : **Pull requests** → **New** → base `develop`, compare `feature/nom-de-la-feature`.

5. La CI (GitHub Actions) tourne automatiquement sur chaque push et PR.

6. Après revue (ou auto-merge), merger la PR dans **develop**. Supprimer la branche feature après merge.

7. Pour une release : ouvrir une PR **develop** → **main**, merger après validation.

## Conventions de commits

- `feat:` nouvelle fonctionnalité  
- `fix:` correction de bug  
- `chore:` tâche technique (config, deps, etc.)  
- `docs:` documentation  
- `refactor:` refactoring sans changement de comportement  

## CI/CD (GitHub Actions)

- **Fichier** : `.github/workflows/ci.yml`
- **Déclencheurs** : push et Pull Request sur `main` et `develop`.
- **Jobs** :
  - **Backend** : compile + tests (Maven) si `backend/pom.xml` existe.
  - **Frontend** : `npm ci` + build (Angular) si `frontend/package.json` existe.
  - **Quality** : vérification basique de la structure du repo.

## Paramétrage GitHub (recommandé)

1. **Protection de la branche main**  
   **Settings** → **Branches** → **Add rule** pour `main` :
   - Require a pull request before merging.
   - Require status checks to pass (choisir les jobs CI).
   - Optionnel : Require branches to be up to date.

2. **Branche par défaut**  
   **Settings** → **General** → **Default branch** : `develop` pour le travail courant.

3. **Environnements** (plus tard)  
   Créer des environnements (ex: `staging`, `production`) pour déploiements et secrets.

## Résumé

- Toujours travailler via des branches **feature/** ou **fix/**.
- Merger dans **develop** via Pull Request après passage de la CI.
- Merger **develop** → **main** pour une release.
- Ne pas pousser directement sur `main` ; utiliser les PR et la CI.
