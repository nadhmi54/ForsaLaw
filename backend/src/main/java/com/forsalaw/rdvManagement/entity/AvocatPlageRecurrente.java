package com.forsalaw.rdvManagement.entity;

import com.forsalaw.avocatManagement.entity.Avocat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(name = "avocat_plage_recurrente", indexes = {
        @Index(name = "idx_plage_avocat", columnList = "avocat_id")
})
@Getter
@Setter
public class AvocatPlageRecurrente {

    @Id
    @Column(length = 24)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avocat_id", nullable = false)
    private Avocat avocat;

    /** ISO-8601 : 1 = lundi … 7 = dimanche */
    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek;

    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;
}
