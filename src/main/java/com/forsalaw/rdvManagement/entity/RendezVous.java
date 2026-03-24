package com.forsalaw.rdvManagement.entity;

import com.forsalaw.avocatManagement.entity.Avocat;
import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "rendez_vous")
@Getter
@Setter
public class RendezVous {

    @Id
    @Column(length = 20)
    private String idRendezVous;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_user_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avocat_id", nullable = false)
    private Avocat avocat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutRendezVous statutRendezVous = StatutRendezVous.EN_ATTENTE;

    @Column(length = 1000)
    private String motifConsultation;

    @Column(name = "date_heure_debut")
    private LocalDateTime dateHeureDebut;

    @Column(name = "date_heure_fin")
    private LocalDateTime dateHeureFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeRendezVous typeRendezVous = TypeRendezVous.EN_LIGNE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CreePar creePar = CreePar.CLIENT;

    @Column(length = 1000)
    private String raisonAnnulation;

    @Column(length = 1000)
    private String commentaireAvocat;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(nullable = false)
    private LocalDateTime dateMiseAJour;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        dateCreation = now;
        dateMiseAJour = now;
    }

    @PreUpdate
    protected void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
    }
}