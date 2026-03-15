-- ForsaLaw RAG - Étape 1 : extension pgvector + table des chunks juridiques (exécuté par Flyway au démarrage)

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS legal_document_chunk (
    id              BIGSERIAL PRIMARY KEY,
    code_name       VARCHAR(255) NOT NULL,
    article_reference VARCHAR(255) NOT NULL,
    article_title   VARCHAR(500),
    content         TEXT NOT NULL,
    embedding       vector(1536),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_legal_document_chunk_code_name ON legal_document_chunk (code_name);
CREATE INDEX IF NOT EXISTS idx_legal_document_chunk_article_ref ON legal_document_chunk (article_reference);

CREATE INDEX IF NOT EXISTS idx_legal_document_chunk_embedding
ON legal_document_chunk
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 1);

COMMENT ON TABLE legal_document_chunk IS 'Chunks de textes juridiques tunisiens pour le RAG (embeddings pgvector)';
