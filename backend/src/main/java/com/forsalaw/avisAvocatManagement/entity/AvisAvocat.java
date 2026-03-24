package com.forsalaw.avisAvocatManagement.entity;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Avis / notation d'un avocat par un client (note 1 à 5 + commentaire).
 */
@Entity
@Table(name = "avis_avocat",
       indexes = { @Index(unique = true, columnList = "user_id, avocat_id") })
@Getter
@Setter
public class AvisAvocat {

    @Id
    @Column(length = 20)
    private String id; // Format: AAAA-AVI-NNNNN

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avocat_id", nullable = false)
    private Avocat avocat;

    /** Note de 1 à 5 étoiles. */
    @Column(nullable = false)
    private int note;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "datecreation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
