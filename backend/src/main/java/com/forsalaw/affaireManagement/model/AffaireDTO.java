package com.forsalaw.affaireManagement.model;

import com.forsalaw.affaireManagement.entity.StatutAffaire;
import com.forsalaw.affaireManagement.entity.TypeAffaire;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AffaireDTO {
    private String id;
    private String titre;
    private String description;
    private TypeAffaire type;
    private StatutAffaire statut;
    private String clientId;
    private String clientNom;
    private String avocatId;
    private String avocatNom;
    private String reclamationId;
    private LocalDateTime dateProchaineAudience;
    private LocalDateTime dateOuverture;
    private LocalDateTime dateMiseAJour;
    private LocalDateTime dateCloture;
    private String notesInternes; // null pour les clients
}
