package com.forsalaw.documentManagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Locale;

/**
 * Hibernate {@code ddl-auto=update} ne modifie pas les CHECK PostgreSQL sur {@code document_metadata.contexte_type}.
 * Ce correctif s'exécute au démarrage (après JPA) pour autoriser {@code PROFIL_UTILISATEUR}.
 */
@Component
@Order(Integer.MAX_VALUE)
public class DocumentMetadataContexteCheckPatcher implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DocumentMetadataContexteCheckPatcher.class);

    private final DataSource dataSource;

    public DocumentMetadataContexteCheckPatcher(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!isPostgreSql()) {
            return;
        }
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Integer count = jdbc.queryForObject(
                "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_metadata'",
                Integer.class);
        if (count == null || count == 0) {
            return;
        }
        try {
            jdbc.execute("ALTER TABLE document_metadata DROP CONSTRAINT IF EXISTS document_metadata_contexte_type_check");
            jdbc.execute("""
                    ALTER TABLE document_metadata ADD CONSTRAINT document_metadata_contexte_type_check
                    CHECK (contexte_type IN (
                        'RECLAMATION',
                        'MESSENGER',
                        'DOSSIER',
                        'GENERAL',
                        'PROFIL_UTILISATEUR'
                    ))
                    """);
            log.debug("Contrainte document_metadata.contexte_type : valeurs enum a jour (dont PROFIL_UTILISATEUR).");
        } catch (Exception e) {
            log.warn("Mise a jour de document_metadata_contexte_type_check ignoree ou en echec : {}", e.getMessage());
        }
    }

    private boolean isPostgreSql() {
        try (Connection c = dataSource.getConnection()) {
            String name = c.getMetaData().getDatabaseProductName();
            return name != null && name.toLowerCase(Locale.ROOT).contains("postgresql");
        } catch (SQLException e) {
            log.warn("Verification du SGBD impossible, patch contexte_type non applique : {}", e.getMessage());
            return false;
        }
    }
}
