package com.forsalaw.avocatManagement.entity;

import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité Avocat (profil métier lié à un User avec rôle avocat).
 */
@Entity
@Table(name = "avocats", indexes = @Index(unique = true, columnList = "user_id"))
@Getter
@Setter
public class Avocat {

    @Id
    @Column(length = 20)
    private String id; // Format: AAAA-AVC-NNNNN (année-type-numéro)

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpecialiteJuridique specialite;

    @Column(name = "anneesexperience", nullable = false)
    private int anneesExperience = 0;

    @Column(nullable = false, length = 100)
    private String ville = "";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "notemoyenne", nullable = false)
    private double noteMoyenne = 0.0;

    @Column(name = "totaldossiers", nullable = false)
    private int totalDossiers = 0;

    @Column(nullable = false)
    private boolean verifie = false;

    @Column(nullable = false)
    private boolean actif = true;

    @Column(name = "datecreation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "datemiseajour", nullable = false)
    private LocalDateTime dateMiseAJour;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateMiseAJour = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }
}
