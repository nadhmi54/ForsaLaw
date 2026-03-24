package com.forsalaw.reclamationManagement.model;

import com.forsalaw.reclamationManagement.entity.StatutReclamation;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatutRequest {
    @NotNull(message = "Le statut est obligatoire")
    private StatutReclamation statut;
}
