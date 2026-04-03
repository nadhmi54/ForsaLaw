package com.forsalaw.documentManagement.entity;

import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Trace chaque action effectuée sur un document du Coffre-fort Numérique.
 * Répond à la question : Qui a fait quoi sur quel document et quand ?
 */
@Entity
@Table(name = "document_access_log", indexes = {
        @Index(name = "idx_access_log_document", columnList = "document_id"),
        @Index(name = "idx_access_log_user", columnList = "acteur_id"),
        @Index(name = "idx_access_log_date", columnList = "date_action")
})
@Getter
@Setter
public class DocumentAccessLog {

    @Id
    @Column(length = 20)
    private String id;

    /** Le document concerné par l'action. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private DocumentMetadata document;

    /** L'utilisateur qui a effectué l'action (null si action système). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acteur_id")
    private User acteur;

    /** Le type d'action effectuée sur le document. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActionDocument action;

    /** Adresse IP depuis laquelle l'action a été effectuée. */
    @Column(name = "adresse_ip", length = 64)
    private String adresseIp;

    /** Résultat de la vérification d'intégrité (utilisé pour VERIFICATION_INTEGRITE). */
    @Column(name = "integrite_valide")
    private Boolean integriteValide;

    /** Détails supplémentaires (ex: raison d'un refus d'accès). */
    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "date_action", nullable = false, updatable = false)
    private LocalDateTime dateAction;

    @PrePersist
    protected void onCreate() {
        dateAction = LocalDateTime.now();
    }
}
