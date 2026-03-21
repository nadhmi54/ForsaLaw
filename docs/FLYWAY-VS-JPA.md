# Flyway vs JPA / Hibernate — quand utiliser quoi ?

Ce document fixe une **règle simple** pour le projet ForsaLaw : éviter le double travail (SQL + entités) sans raison, tout en gardant Flyway pour ce qu’il fait mieux que Hibernate.

---

## Rappel rapide

| Outil | Rôle |
|--------|------|
| **Flyway** | Exécute des scripts SQL **versionnés** (`V1__...sql`, `V2__...sql`, …) **une seule fois** par base. Trace dans `flyway_schema_history`. |
| **JPA / Hibernate** | Crée ou met à jour le schéma à partir des **`@Entity`** quand `spring.jpa.hibernate.ddl-auto=update` (ou `validate`, etc.). |

Les deux peuvent coexister dans le même projet Spring Boot.

---

## Quand utiliser **Flyway**

Utilise Flyway quand le changement :

1. **Ne peut pas** (ou **ne doit pas**) être entièrement décrit par une entité JPA, par exemple :
   - **Extensions PostgreSQL** : `CREATE EXTENSION vector` (pgvector), etc.
   - **Vues, fonctions, triggers**, procédures stockées.
   - **Données initiales** (seed) : référentiels, paramètres, jeux de données de test contrôlés en SQL.

2. Doit être **explicite et identique** sur tous les environnements (dev, CI, préprod, prod) sans dépendre du comportement d’Hibernate.

3. Fait partie d’une **politique d’équipe** : tout changement de schéma “officiel” passe par une migration (souvent en prod avancée).

**Exemple dans ce repo :** le fichier `V1__rag_pgvector_and_legal_document_chunk.sql` (extension pgvector + table des chunks RAG).

---

## Quand **ne pas** utiliser Flyway (privilégier JPA / Hibernate)

Pour la majorité des **tables métier classiques** :

- Utilisateurs, avocats, messagerie, réclamations, etc.
- Tu ajoutes ou modifies une **`@Entity`**, des champs, des relations.
- Tu laisses **`ddl-auto=update`** (en développement) pour que Hibernate crée ou adapte les tables.

**Intérêt :** une seule source de vérité — le **code Java** — pas de duplication avec un `.sql` identique.

---

## Règle recommandée pour ForsaLaw

| Cas | Choix |
|-----|--------|
| Extension PostgreSQL, SQL spécifique, seed SQL, objets hors entité | **Flyway** |
| Nouvelle entité / nouvelle table “standard” | **JPA uniquement** (pas de nouveau fichier Flyway systématique) |
| Tu hésites | Par défaut : **JPA** ; Flyway seulement si une des lignes du bloc “Quand utiliser Flyway” s’applique. |

---

## Pièges à éviter

- **Dupliquer** le même schéma dans une migration Flyway **et** dans des entités sans besoin → deux endroits à maintenir.
- Modifier **à la main** une migration Flyway **déjà exécutée** en base → erreurs de checksum ; préférer une **nouvelle** migration pour corriger.
- En **production** plus tard : beaucoup d’équipes passent progressivement à **Flyway (ou Liquibase) pour tout le schéma** et passent Hibernate en `validate` ou `none`. Ce n’est pas obligatoire au début du projet.

---

## Fichiers et configuration utiles

- Migrations Flyway : `src/main/resources/db/migration/`
- Activation : `spring.flyway.enabled=true`, `spring.flyway.locations=classpath:db/migration` dans `application.properties`
- Hibernate : `spring.jpa.hibernate.ddl-auto=update` (adapté au dev ; à revoir avant prod stricte)

---

## Dépannage : erreur au démarrage (schéma non vide sans Flyway)

**Message typique :**  
`Found non-empty schema(s) "public" but no schema history table. Use baseline() or set baselineOnMigrate to true`

**Cause :** PostgreSQL contient déjà des tables (souvent créées par **Hibernate** avant la première exécution de Flyway), mais la table **`flyway_schema_history`** n’existe pas encore.

**Dans ce projet**, `application.properties` inclut :

- `spring.flyway.baseline-on-migrate=true` — au premier lancement, Flyway **crée** l’historique sur une base déjà remplie.
- `spring.flyway.baseline-version=0` — pour que la migration **V1** soit encore **appliquée** après ce baseline (avec la valeur par défaut `1`, Flyway peut considérer que la base est déjà à la version 1 et **ne pas exécuter** `V1__...sql`).

Après un `mvn clean` si l’IDE utilisait encore d’anciens fichiers dans `target/` (ex. ancienne migration supprimée).

---

*Document à jour avec les choix du projet ForsaLaw — messagerie et entités “classiques” gérées par JPA ; RAG / pgvector via Flyway V1.*
