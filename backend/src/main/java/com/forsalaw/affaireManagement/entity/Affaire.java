package com.forsalaw.affaireManagement.entity;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.reclamationManagement.entity.Reclamation;
import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité Affaire — représente un dossier juridique actif sur ForsaLaw.
 * Une affaire peut être créée directement ou promue depuis une Réclamation.
 */
@Entity
@Table(name = "affaires", indexes = {
        @Index(columnList = "client_id"),
        @Index(columnList = "avocat_id"),
        @Index(columnList = "statut")
})
@Getter
@Setter
public class Affaire {

    @Id
    @Column(length = 20)
    private String id; // Format: AAAA-AFF-NNNNN

    @Column(nullable = false, length = 250)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avocat_id")
    private Avocat avocat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclamation_id")
    private Reclamation reclamation; // optionnel : si l'affaire vient d'une plainte

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeAffaire type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutAffaire statut = StatutAffaire.INSTRUCTION;

    @Column(name = "date_prochaine_audience")
    private LocalDateTime dateProchaineAudience;

    @Column(name = "date_ouverture", nullable = false, updatable = false)
    private LocalDateTime dateOuverture;

    @Column(name = "date_mise_a_jour", nullable = false)
    private LocalDateTime dateMiseAJour;

    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;

    @Column(name = "notes_internes", columnDefinition = "TEXT")
    private String notesInternes; // Visible seulement par avocat/admin

    @PrePersist
    protected void onCreate() {
        dateOuverture = LocalDateTime.now();
        dateMiseAJour = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }
}
