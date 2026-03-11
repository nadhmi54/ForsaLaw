package com.forsalaw.avocatManagement.model;

import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAvocatRequest {

    private SpecialiteJuridique specialite;
    @Min(0)
    private Integer anneesExperience;
    @Size(max = 100)
    private String ville;
    @Size(max = 2000)
    private String description;
}
