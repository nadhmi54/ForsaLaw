package com.forsalaw.rdvManagement.model;

import com.forsalaw.rdvManagement.entity.TypeRendezVous;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProposerCreneauRequest {
    private LocalDateTime dateHeureDebut;
    private LocalDateTime dateHeureFin;
    private TypeRendezVous typeRendezVous;
    private String commentaireAvocat;
}