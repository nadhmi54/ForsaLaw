# ForsaLaw – Guide Docker (base de données et pgAdmin)

Ce document explique **en détail** comment la partie Docker du projet ForsaLaw a été configurée, **pourquoi** on a fait ces choix, et **comment** les utiliser (toi et ton partenaire) pour travailler sur le même projet.

---

## Pourquoi utiliser Docker pour la base de données ?

- **Même environnement pour tout le monde** : toi et ton partenaire avez exactement la même base PostgreSQL (même version, même config), sans installer PostgreSQL directement sur chaque PC.
- **Simple à lancer** : une seule commande (`docker-compose up -d`) démarre la base et pgAdmin.
- **Isolement** : la base tourne dans un conteneur ; elle ne mélange pas avec d’autres projets ou d’autres bases sur la machine.
- **Reproductible** : le fichier `docker-compose.yml` décrit tout ; en le gardant dans Git, tout le monde récupère la même config en faisant un `git pull`.

---

## Ce qui a été mis en place

### 1. Fichier `docker-compose.yml` (à la racine du projet)

Ce fichier décrit **deux services** :

| Service   | Rôle | Image Docker |
|-----------|------|--------------|
| **postgres** | Base de données PostgreSQL du projet | `postgres:16-alpine` |
| **pgadmin** | Interface web pour gérer la base (créer des tables, exécuter du SQL, etc.) | `dpage/pgadmin4:latest` |

### 2. Pourquoi des ports spécifiques (5433 et 5051) ?

Sur ta machine, tu peux avoir **d’autres projets** qui utilisent déjà :
- PostgreSQL sur le port **5432**
- pgAdmin sur le port **5050**

Pour **ne pas les remplacer** et éviter les conflits, ForsaLaw utilise :

- **PostgreSQL** : port **5433** sur ta machine (mappé au port 5432 dans le conteneur).
- **pgAdmin** : port **5051** sur ta machine (mappé au port 80 dans le conteneur).

Ainsi, ForsaLaw et l’autre projet peuvent tourner en même temps sans se gêner.

### 3. Configuration PostgreSQL

Dans `docker-compose.yml`, la base est configurée ainsi :

- **Nom de la base** : `forsalaw`
- **Utilisateur** : `forsalaw`
- **Mot de passe** : `forsalaw`

Le backend Spring Boot (fichier `backend/src/main/resources/application.properties`) utilise ces mêmes valeurs pour se connecter à la base.

### 4. Volume de données

Les données de PostgreSQL sont stockées dans un **volume Docker** nommé `forsalaw_pgdata`.  
Même si tu arrêtes les conteneurs (`docker-compose down`), les données restent. Elles ne sont supprimées que si tu fais `docker-compose down -v`.

### 5. Ordre de démarrage

pgAdmin **dépend** de PostgreSQL : dans le `docker-compose`, on a mis `depends_on` avec un **healthcheck** sur postgres. Donc Docker démarre d’abord PostgreSQL, attend qu’il soit prêt, puis lance pgAdmin. Comme ça, quand tu ouvres pgAdmin, la base est déjà disponible.

### 6. Connexion pgAdmin (email)

pgAdmin exige une adresse email **valide** pour la connexion (pas un domaine `.local`). On utilise donc **admin@forsalaw.com** et le mot de passe **forsalaw** pour se connecter à l’interface web.

---

## Comment lancer Docker (toi et ton partenaire)

### Prérequis

- **Docker Desktop** installé et démarré sur le PC.
- Le projet ForsaLaw cloné (ou récupéré avec `git pull`).

### Étapes

1. **Ouvrir un terminal** dans le dossier du projet (là où se trouve `docker-compose.yml`).

2. **Démarrer les conteneurs** :
   ```bash
   docker-compose up -d
   ```
   - `-d` = en arrière-plan (les conteneurs tournent sans garder le terminal ouvert).

3. **Vérifier** dans Docker Desktop que deux conteneurs sont en état "Running" :
   - **forsalaw-postgres** (ou "postgres" sous le projet "forsalaw")
   - **forsalaw-pgadmin** (ou "pgadmin" sous le projet "forsalaw")

4. **Ouvrir pgAdmin** dans le navigateur : **http://localhost:5051**
   - Email : **admin@forsalaw.com**
   - Mot de passe : **forsalaw**

5. **Ajouter le serveur PostgreSQL dans pgAdmin** (une seule fois par machine) :
   - Clic sur **"Add New Server"** (ou clic droit sur **Servers** → **Register** → **Server**).
   - **Onglet General** : Name = `ForsaLaw` (ou au choix).
   - **Onglet Connection** :
     - **Host name/address** : `postgres` (nom du service dans Docker, pas localhost)
     - **Port** : `5432`
     - **Maintenance database** : `forsalaw`
     - **Username** : `forsalaw`
     - **Password** : `forsalaw`
     - Cocher **Save password** si tu veux.
   - **Save**.

Après ça, la base **forsalaw** apparaît sous **Servers → ForsaLaw → Databases → forsalaw**. Les tables créées par le backend (JPA/Hibernate) s’y afficheront.

### Arrêter les conteneurs

À la racine du projet :

```bash
docker-compose down
```

Les données restent dans le volume. Pour tout supprimer y compris les données : `docker-compose down -v`.

---

## Lancer le backend Spring Boot

Une fois Docker lancé (PostgreSQL sur le port 5433) :

- Depuis IntelliJ : lancer la classe **ForsaLawApplication**.
- Ou en ligne de commande, à la racine du projet (où se trouve `pom.xml`) :  
  `mvn spring-boot:run`

L’application se connecte à **localhost:5433** (voir `application.properties`). Les tables sont créées ou mises à jour automatiquement selon `spring.jpa.hibernate.ddl-auto=update`.

---

## Récapitulatif pour ton partenaire

1. **Cloner ou pull** le projet depuis Git.
2. **Ouvrir Docker Desktop** et le lancer.
3. À la **racine du projet** : `docker-compose up -d`.
4. Se connecter à **pgAdmin** sur http://localhost:5051 (admin@forsalaw.com / forsalaw) et ajouter le serveur **ForsaLaw** (host `postgres`, port 5432, user/password forsalaw).
5. Lancer le **backend** (IntelliJ ou `mvn spring-boot:run`).

Tout le monde travaille alors avec la même base (chacun sur sa machine, avec sa propre instance Docker locale). Le code et la config Docker sont partagés via Git.
