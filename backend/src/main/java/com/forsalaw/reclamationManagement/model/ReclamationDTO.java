package com.forsalaw.reclamationManagement.model;

import com.forsalaw.reclamationManagement.entity.CategorieReclamation;
import com.forsalaw.reclamationManagement.entity.GraviteReclamation;
import com.forsalaw.reclamationManagement.entity.StatutReclamation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReclamationDTO {
    private String id;
    private String createurId;
    private String nomCreateur; // Nom + Prénom
    private String utilisateurCibleId;
    private String nomUtilisateurCible;
    private String titre;
    private String description;
    private CategorieReclamation categorie;
    private StatutReclamation statut;
    private GraviteReclamation gravite;
    private boolean aNouvelleNotification;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private List<ReclamationAttachmentDTO> piecesJointes;
}
