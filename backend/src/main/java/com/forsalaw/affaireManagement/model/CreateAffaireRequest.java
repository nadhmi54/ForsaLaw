package com.forsalaw.affaireManagement.model;

import com.forsalaw.affaireManagement.entity.TypeAffaire;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateAffaireRequest {

    @NotBlank(message = "Le titre est obligatoire.")
    @Size(max = 250)
    private String titre;

    @Size(max = 5000)
    private String description;

    @NotNull(message = "Le type d'affaire est obligatoire.")
    private TypeAffaire type;

    @NotBlank(message = "L'ID du client est obligatoire.")
    private String clientId;

    private String avocatId; // optionnel à la création

    private String reclamationId; // optionnel : lier à une réclamation existante

    private LocalDateTime dateProchaineAudience;
}
