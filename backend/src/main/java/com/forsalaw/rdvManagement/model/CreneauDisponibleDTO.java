package com.forsalaw.rdvManagement.model;

import java.time.LocalDateTime;

public record CreneauDisponibleDTO(
        LocalDateTime debut,
        LocalDateTime fin
) {}
