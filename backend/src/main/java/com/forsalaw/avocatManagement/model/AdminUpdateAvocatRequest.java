package com.forsalaw.avocatManagement.model;

import com.forsalaw.avocatManagement.entity.DomaineJuridique;
import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateAvocatRequest {

    @Schema(description = "Domaine du droit (optionnel, pour cocher domaine + sous-domaine dans Swagger)")
    private DomaineJuridique domaine;

    @Schema(description = "Spécialité (sous-domaine) juridique")
    private SpecialiteJuridique specialite;
    @Min(0)
    private Integer anneesExperience;
    @Size(max = 100)
    private String ville;
    @Size(max = 2000)
    private String description;
    private Boolean verifie;
    private Boolean actif;
}
