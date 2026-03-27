package com.forsalaw.rdvManagement.entity;

import com.forsalaw.avocatManagement.entity.Avocat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "avocat_agenda_exception", indexes = {
        @Index(name = "idx_exc_avocat", columnList = "avocat_id")
})
@Getter
@Setter
public class AvocatAgendaException {

    @Id
    @Column(length = 24)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avocat_id", nullable = false)
    private Avocat avocat;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(length = 500)
    private String libelle;
}
