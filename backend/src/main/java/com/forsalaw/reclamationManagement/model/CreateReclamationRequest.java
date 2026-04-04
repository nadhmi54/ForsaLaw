package com.forsalaw.reclamationManagement.model;

import com.forsalaw.reclamationManagement.entity.CategorieReclamation;
import com.forsalaw.reclamationManagement.entity.GraviteReclamation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Schema(description = "Création d'une réclamation. Le créateur est l'utilisateur authentifié (JWT) ; aucun champ « mon id » n'est requis.")
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

    @Schema(
            requiredMode = Schema.RequiredMode.NOT_REQUIRED,
            description = "Optionnel. Identifiant d'un **autre** utilisateur (ex. avocat) à associer à la réclamation. "
                    + "À omettre dans le cas courant : ne sert pas à vous identifier — le backend utilise le JWT pour le créateur.")
    private String utilisateurCibleId;
}
