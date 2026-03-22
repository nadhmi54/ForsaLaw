package com.forsalaw.reclamationManagement.entity;

import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité Reclamation.
 */
@Entity
@Table(name = "reclamation")
@Getter
@Setter
public class Reclamation {

    @Id
    @Column(length = 20)
    private String id; // Format: AAAA-REC-NNNNN

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "createur_id", nullable = false)
    private User createur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_cible_id")
    private User utilisateurCible;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CategorieReclamation categorie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StatutReclamation statut = StatutReclamation.OUVERTE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private GraviteReclamation gravite = GraviteReclamation.BASSE;

    @Column(name = "a_nouvelle_notification", nullable = false)
    private boolean aNouvelleNotification = false;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification", nullable = false)
    private LocalDateTime dateModification;

    @OneToMany(mappedBy = "reclamation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReclamationMessage> messages = new ArrayList<>();

    @OneToMany(mappedBy = "reclamation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReclamationAttachment> attachments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        dateCreation = now;
        dateModification = now;
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }
}
