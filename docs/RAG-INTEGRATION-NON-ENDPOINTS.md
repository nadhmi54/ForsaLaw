# RAG ForsaLaw – Intégration des parties « non endpoints »

Ce document décrit comment intégrer dans le backend Spring Boot les aspects qui ne sont **pas** des endpoints REST : sécurité, rate limiting, prompt RAG, cache, ingestion PDF, logs et audit.

---

## A. Sécurité & rate limiting

### 1. SecurityConfig

- **Admin** : tous les chemins `/api/admin/**` réservés aux utilisateurs ayant le rôle **ADMIN**.
- **RAG utilisateur** : `/api/ai/**` accessible uniquement aux utilisateurs **authentifiés** (`authenticated()`).

Exemple de règles à ajouter dans `SecurityConfig` :

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/ai/**").authenticated()
```

(À placer **avant** la règle `anyRequest().authenticated()`.)

### 2. Propriétaire des sessions

- Les endpoints `/api/ai/sessions/**` ne doivent retourner ou modifier **que les sessions de l’utilisateur connecté**.
- Dans les **services** et **repositories** :
  - Récupérer le `userId` depuis le JWT (ex. `SecurityContextHolder` ou paramètre injecté).
  - Filtrer systématiquement : `WHERE session.user_id = :currentUserId` (ou équivalent en JPQL/Criteria).

Un utilisateur ne doit **jamais** accéder aux sessions ou messages d’un autre.

### 3. Rate limiting sur `/api/ai/question`

- Objectif : limiter le nombre de requêtes par utilisateur (ou par IP) pour éviter abus et coûts LLM.
- Implémentation possible :
  - Créer un **`OncePerRequestFilter`** (ou un composant dédié) qui :
    - identifie l’utilisateur (userId du JWT) ou, en fallback, l’IP ;
    - incrémente un compteur (en mémoire au début, ex. `ConcurrentHashMap<String, AtomicInteger>` avec fenêtre temporelle) ;
    - si le nombre de requêtes dépasse N par minute → répondre **429 Too Many Requests** et ne pas appeler le RAG.
- Plus tard : déplacer les compteurs vers **Redis** pour un rate limiting distribué.

---

## B. RAG interne (prompt, confiance, sources)

### 1. RagService

- **Construction du prompt** :
  - Un **prompt système** fixe (rôle de l’assistant, consignes : répondre uniquement à partir des articles fournis, dire « je ne sais pas » si absent, ton clair et pédagogique).
  - Concaténation du **contexte** : les textes des chunks juridiques récupérés.
  - Ajout de la **question** utilisateur.
- **Réponse structurée** : le service renvoie un **DTO** (ex. `RagAnswer`) contenant :
  - `answer` : texte de la réponse générée par le LLM ;
  - `sources` : liste d’objets (ex. `idChunk`, `codeName`, `articleReference`, `title`, `extrait`) ;
  - `confidenceScore` : score de confiance (ex. dérivé des scores de similarité des chunks, ou fourni par le LLM si disponible).

### 2. Contrôleurs

- Les contrôleurs des endpoints **`POST /api/ai/question`**, **`GET /api/ai/sessions/{id}/sources`**, etc., s’appuient sur ce DTO.
- Exposer **sources** et **confidenceScore** dans les réponses JSON pour le frontend (sources cliquables, affichage du score).

---

## C. Cache & performance

- **Interface** `RagCacheService` :
  - `Optional<RagAnswer> get(String key)` ;
  - `void put(String key, RagAnswer)` (éventuellement avec TTL).
- **Implémentation 1** : en mémoire avec **`ConcurrentHashMap`** (clé = question normalisée + éventuellement userId/langue).
- **Plus tard** : une autre implémentation (ex. **Redis**) sans changer la signature ni l’appel dans `RagService`, pour éviter de bloquer les requêtes identiques.

---

## D. Ingestion PDF & embeddings

### 1. DocumentIngestionService

- **Entrée** : document (ex. PDF) ou référence à un fichier uploadé.
- **Étapes** :
  - Lire le PDF (ex. **Apache PDFBox** ou **Tika**).
  - Nettoyer le texte (suppression headers/footers, normalisation).
  - Découper en **chunks** (ex. 500–800 tokens par chunk), en conservant pour chaque chunk : nom du code, référence d’article, titre, contenu.
  - Pour chaque chunk : appeler **EmbeddingService** pour obtenir un vecteur (`float[]` ou équivalent).
  - Persister dans la table **`legal_document_chunk`** (champs : code_name, article_reference, article_title, content, embedding, created_at).

### 2. EmbeddingService

- **Rôle** : encapsuler l’appel à l’API d’embeddings (OpenAI, Mistral, etc.).
- **Méthode** : `float[] generateEmbedding(String text)` (ou type adapté à ton modèle).
- **Configuration** : clé API lue depuis les **variables d’environnement** (ou `application.properties` non committée), **jamais** en dur dans le code.

---

## E. Logs & audit

### 1. Erreurs 4xx/5xx

- Utiliser un **`@RestControllerAdvice`** (ou un **filter**) pour :
  - intercepter les exceptions et réponses d’erreur ;
  - logger : endpoint, méthode HTTP, userId si disponible, message d’erreur, status.

### 2. Accès admin

- Logger explicitement chaque accès à **`/api/admin/**`** (userId, endpoint, date/heure) pour audit et sécurité.

### 3. Erreurs RAG

- Dans les services **RAG** (ingestion, appel LLM, recherche vectorielle) :
  - capturer les exceptions et les enregistrer (table dédiée ou log structuré) ;
  - exposer ces erreurs via l’endpoint **`GET /api/admin/rag/errors`** (liste paginée des dernières erreurs) pour le debug et le monitoring.

---

## Résumé

| Bloc | Où l’intégrer |
|------|----------------|
| **A. Sécurité & rate limiting** | `SecurityConfig`, filter(s), services/repos (filtrage par userId) |
| **B. RAG interne** | `RagService`, DTO `RagAnswer`, contrôleurs existants |
| **C. Cache** | Interface `RagCacheService` + impl en mémoire, appelée depuis `RagService` |
| **D. Ingestion & embeddings** | `DocumentIngestionService`, `EmbeddingService`, table `legal_document_chunk` |
| **E. Logs & audit** | `@RestControllerAdvice` ou filter, logs dans les services RAG et admin |

Ces éléments ne définissent pas de nouveaux endpoints ; ils décrivent comment implémenter la sécurité, la qualité des réponses, la performance et l’observabilité autour des endpoints RAG déjà listés.
