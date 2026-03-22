package com.forsalaw.reclamationManagement.model;

import com.forsalaw.reclamationManagement.entity.CategorieReclamation;
import com.forsalaw.reclamationManagement.entity.GraviteReclamation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReclamationRequest {
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "La catégorie est obligatoire")
    private CategorieReclamation categorie;

    @NotNull(message = "La gravité est obligatoire")
    private GraviteReclamation gravite;

    private String utilisateurCibleId;
}
