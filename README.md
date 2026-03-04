# ForsaLaw

Plateforme LegalTech tunisienne – IA juridique, RAG, recommandation d'avocats, avatar 3D.

## Structure

- `backend/` – Spring Boot 3, JWT, JPA, PostgreSQL, pgvector, WebSocket
- `frontend/` – Angular 17+, Material, Three.js
- `docker/` – Dockerfiles, Nginx
- `.github/workflows/` – CI/CD

---

## Comprendre le workflow Git (explication simple)

Cette section explique **comment on travaille avec Git** sur ForsaLaw, sans supposer que tu connais déjà Git.

### À quoi sert Git ?

Git permet de :
- **Sauvegarder** l’historique de ton code (chaque “commit” = une sauvegarde avec un message).
- **Travailler à plusieurs** sans écraser le travail des autres.
- **Isoler** ton travail dans une “branche” avant de l’intégrer au projet.

Pense à une branche comme à **une copie du projet** sur laquelle tu travailles. Quand tu as fini et que tout est validé, on “fusionne” cette copie dans le projet commun.

### Les deux branches principales du projet

On utilise deux branches importantes :

| Branche   | Rôle en mots simples |
|-----------|----------------------|
| **main**  | C’est le code “officiel” en production. On ne modifie **jamais** directement dessus. |
| **develop** | C’est la branche où tout le monde intègre son travail. C’est à partir d’elle qu’on crée nos branches de fonctionnalité. |

**Pourquoi ne pas travailler sur main ?**  
Si tout le monde modifiait directement `main`, les changements se mélangeraient, les erreurs iraient en prod, et on ne pourrait pas revoir le code proprement. En passant par des branches et des “Pull Requests”, on garde le contrôle.

### Le déroulement en pratique (étape par étape)

Voici le cycle normal quand tu ajoutes une nouvelle fonctionnalité.

1. **Tu te mets à jour et tu crées ta branche**
   - Tu te places sur `develop` et tu récupères la dernière version :  
     `git checkout develop` puis `git pull origin develop`
   - Tu crées une nouvelle branche *à partir de develop* (ex. `feature/ma-nouvelle-fonctionnalite`) :  
     `git checkout -b feature/ma-nouvelle-fonctionnalite`  
   → À partir de là, tout ton travail se fait sur cette branche, pas sur `develop` ni sur `main`.

2. **Tu travailles et tu sauvegardes (commits)**
   - Tu modifies le code (backend, frontend, etc.).
   - Quand tu as fait un ensemble de changements cohérent, tu “commites” :  
     `git add .` puis `git commit -m "feat: description de ce que tu as fait"`  
   → Chaque commit = une sauvegarde avec un message (on utilise des préfixes comme `feat:`, `fix:`, `chore:` pour rester cohérents).

3. **Tu envoies ta branche sur GitHub et tu ouvres une Pull Request**
   - Tu envoies ta branche sur le dépôt distant :  
     `git push -u origin feature/ma-nouvelle-fonctionnalite`
   - Sur **GitHub**, tu vas dans **Pull requests** → **New pull request**.
   - Tu choisis : **base = develop**, **compare = ta branche** (ex. `feature/ma-nouvelle-fonctionnalite`).  
   → Une “Pull Request” (PR) = une demande pour **fusionner ton code dans develop**. Les autres peuvent voir tes changements, commenter, et la CI (tests/build) tourne automatiquement.

4. **Revue et fusion (merge)**
   - Une fois la revue OK et la CI verte (build et tests passent), on **merge** la PR dans `develop`.  
   → Ton code est alors intégré dans `develop`, pas encore dans `main`.

5. **Tu remets ton dépôt local à jour**
   - Tu repasses sur `develop`, tu récupères les derniers changements (dont ton merge) et tu peux supprimer ta branche locale si tu veux :  
     `git checkout develop` → `git pull origin develop` → `git branch -d feature/ma-nouvelle-fonctionnalite`

### Quand le code va sur main (production) ?

`main` n’est pas mise à jour à chaque PR. Quand l’équipe décide qu’une version est prête pour la production, on ouvre une **Pull Request develop → main**. Une fois cette PR mergée, le code en prod est à jour. C’est ce qu’on appelle une **release**.

### En résumé visuel

```
develop  ──►  tu crées feature/xxx  ──►  tu travailles + commits
                    │
                    ▼
            tu push + tu ouvres une PR (feature/xxx → develop)
                    │
                    ▼
            revue + CI OK  ──►  merge dans develop
                    │
                    ▼
            (plus tard)  PR develop → main  ──►  release en prod
```

### Où sont les commandes exactes ?

Toutes les commandes et les cas particuliers (corriger un bug avec `fix/xxx`, release, etc.) sont dans le guide détaillé :  
**[docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md)**.

---

## Démarrage

À venir (Docker Compose, etc.).
