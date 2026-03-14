package com.forsalaw.avocatManagement.model;

import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AvocatDTO {

    private String id;
    private String userId;
    private String userNom;
    private String userPrenom;
    private String userEmail;
    private SpecialiteJuridique specialite;
    private int anneesExperience;
    private String ville;
    private String description;
    private double noteMoyenne;
    private int totalDossiers;
    private boolean verifie;
    private boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
}
