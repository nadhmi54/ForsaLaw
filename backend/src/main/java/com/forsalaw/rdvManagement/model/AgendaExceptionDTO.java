package com.forsalaw.rdvManagement.model;

import java.time.LocalDate;

public record AgendaExceptionDTO(
        String id,
        LocalDate dateDebut,
        LocalDate dateFin,
        String libelle
) {}
