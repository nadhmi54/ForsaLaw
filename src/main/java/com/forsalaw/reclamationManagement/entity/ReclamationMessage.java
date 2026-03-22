package com.forsalaw.reclamationManagement.entity;

import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Message additionnel dans une réclamation (timeline).
 */
@Entity
@Table(name = "reclamation_message")
@Getter
@Setter
public class ReclamationMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reclamation_id", nullable = false)
    private Reclamation reclamation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expediteur_id", nullable = false)
    private User expediteur;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Column(name = "date_envoi", nullable = false, updatable = false)
    private LocalDateTime dateEnvoi = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        dateEnvoi = LocalDateTime.now();
    }
}
