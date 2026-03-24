# ForsaLaw – Configurer Docker (pour toi et ton partenaire)

## Prérequis

- **Docker Desktop** installé et démarré.
- Projet **cloné** ou à jour (`git pull`).

---

## Étapes

### 1. Démarrer les conteneurs

Dans le dossier **`backend/`** (où se trouve `docker-compose.yml`) :

```bash
docker-compose up -d
```

(La première fois, les images se téléchargent. Si le projet a changé d’image : `docker-compose pull` puis `docker-compose up -d`.)

### 2. Vérifier

```bash
docker ps
```

Tu dois voir **forsalaw-postgres** et **forsalaw-pgadmin** en état **Up**.

### 3. Se connecter à pgAdmin

- Ouvrir **http://localhost:5051**
- **Email** : `admin@forsalaw.com`
- **Mot de passe** : `forsalaw`

### 4. Ajouter le serveur PostgreSQL (une fois par machine)

- **Add New Server** (ou clic droit sur Servers → Register → Server).
- **Onglet General** : **Name** = `ForsaLaw`
- **Onglet Connection** :
  - **Host** : `postgres`
  - **Port** : `5432`
  - **Maintenance database** : `forsalaw`
  - **Username** : `forsalaw`
  - **Password** : `forsalaw`
- **Save**.

### 5. Lancer le backend

- IntelliJ : lancer **ForsaLawApplication**
- Ou en terminal (depuis `backend/`) : `mvn spring-boot:run`

Au premier démarrage, **Flyway** crée la table RAG (`legal_document_chunk`) ; rien à faire à la main.

---

## Arrêter Docker

```bash
docker-compose down
```

(Les données restent. Pour tout supprimer : `docker-compose down -v`.)

---

## En cas de problème

| Problème | Solution |
|----------|----------|
| **Connection refused** dans pgAdmin | Vérifier que les conteneurs tournent (`docker ps`). Dans pgAdmin utiliser **Host = postgres**, **Port = 5432** (pas localhost). |
| **Extension "vector" is not available** | `docker-compose down` → `docker-compose pull` → `docker-compose up -d` → relancer le backend. |
