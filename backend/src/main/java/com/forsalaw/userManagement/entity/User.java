package com.forsalaw.userManagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité User (schéma ForsaLaw).
 */
@Entity
@Table(name = "users", indexes = @Index(unique = true, columnList = "email"))
@Getter
@Setter
public class User {

    @Id
    @Column(length = 20)
    private String id; // Format: AAAA-USR-NNNNN (année-type-numéro)

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "motdepasse", nullable = false)
    private String motDePasse; // stocké hashé (BCrypt)

    @Column(name = "password_reset_token", length = 120)
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    private LocalDateTime passwordResetExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleUser roleUser = RoleUser.client;

    @Column(nullable = false)
    private boolean actif = true; // true = compte actif, false = bloqué

    @Column(name = "failed_login_attempts", nullable = false, columnDefinition = "integer default 0")
    private int failedLoginAttempts = 0;

    @Column(name = "blocked_by_failed_attempts", nullable = false, columnDefinition = "boolean default false")
    private boolean blockedByFailedAttempts = false;

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
