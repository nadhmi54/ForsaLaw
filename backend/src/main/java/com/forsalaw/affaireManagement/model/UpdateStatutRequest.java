package com.forsalaw.affaireManagement.model;

import com.forsalaw.affaireManagement.entity.StatutAffaire;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateStatutRequest {

    @NotNull(message = "Le nouveau statut est obligatoire.")
    private StatutAffaire statut;

    private LocalDateTime dateProchaineAudience; // utile quand statut = AUDIENCE

    private String notesInternes;
}
