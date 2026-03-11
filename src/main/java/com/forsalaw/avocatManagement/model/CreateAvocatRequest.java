package com.forsalaw.avocatManagement.model;

import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAvocatRequest {

    @NotNull(message = "La spécialité est requise")
    private SpecialiteJuridique specialite;

    @Min(0)
    private int anneesExperience = 0;

    @NotBlank(message = "La ville est requise")
    @Size(max = 100)
    private String ville;

    @Size(max = 2000)
    private String description;
}
