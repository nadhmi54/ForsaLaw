package com.forsalaw.avisAvocatManagement.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AvisAvocatDTO {

    private String id;
    private String userId;
    private String userNom;
    private String userPrenom;
    private String avocatId;
    /** Note de 1 à 5. */
    private int note;
    private String commentaire;
    private LocalDateTime dateCreation;
}
