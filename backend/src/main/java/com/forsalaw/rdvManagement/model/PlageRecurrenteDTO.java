package com.forsalaw.rdvManagement.model;

import java.time.LocalTime;

public record PlageRecurrenteDTO(
        String id,
        int dayOfWeek,
        LocalTime heureDebut,
        LocalTime heureFin
) {}
