package com.forsalaw.rdvManagement.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateAgendaExceptionRequest {

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String libelle;
}
