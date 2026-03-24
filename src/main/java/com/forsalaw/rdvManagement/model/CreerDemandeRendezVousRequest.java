package com.forsalaw.rdvManagement.model;

import com.forsalaw.rdvManagement.entity.TypeRendezVous;
import lombok.Data;

@Data
public class CreerDemandeRendezVousRequest {
    private String motifConsultation;
    private TypeRendezVous typeRendezVous;
}