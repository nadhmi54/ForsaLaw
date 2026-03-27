package com.forsalaw.rdvManagement.entity;

import com.forsalaw.avocatManagement.entity.Avocat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "avocat_agenda_config")
@Getter
@Setter
public class AvocatAgendaConfig {

    @Id
    @Column(name = "avocat_id", length = 20)
    private String avocatId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "avocat_id")
    private Avocat avocat;

    @Column(name = "zone_id", nullable = false, length = 64)
    private String zoneId = "Africa/Tunis";

    @Column(name = "duree_creneau_minutes", nullable = false)
    private int dureeCreneauMinutes = 45;

    @Column(name = "buffer_minutes", nullable = false)
    private int bufferMinutes = 10;

    @Column(name = "agenda_actif", nullable = false)
    private boolean agendaActif = true;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_mise_a_jour", nullable = false)
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
