package com.forsalaw.avisAvocatManagement.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAvisRequest {

    /** Note de 1 à 5 étoiles. */
    @NotNull(message = "La note est requise")
    @Min(value = 1, message = "La note doit être entre 1 et 5")
    @Max(value = 5, message = "La note doit être entre 1 et 5")
    private Integer note;

    /** Commentaire / feedback optionnel. */
    @Size(max = 2000)
    private String commentaire;
}
