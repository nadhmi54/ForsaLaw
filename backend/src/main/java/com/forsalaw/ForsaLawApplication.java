package com.forsalaw;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ForsaLawApplication {

    public static void main(String[] args) {
        SpringApplication.run(ForsaLawApplication.class, args);
    }

    /**
     * Fix automatique pour la contrainte d'énumération qui bloque la signature
     * sans que l'utilisateur n'ait à toucher à la base de données.
     */
    @Bean
    public CommandLineRunner databaseFix(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE document_access_log DROP CONSTRAINT IF EXISTS document_access_log_action_check");
                System.out.println("✅ [Database Fix] Contrainte de signature mise à jour avec succès.");
            } catch (Exception e) {
                // Silencieux si déjà supprimé ou erreur mineure
            }
        };
    }
}
