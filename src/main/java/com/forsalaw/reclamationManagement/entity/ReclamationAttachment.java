package com.forsalaw.reclamationManagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Pièce jointe d'une réclamation.
 */
@Entity
@Table(name = "reclamation_attachment")
@Getter
@Setter
public class ReclamationAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reclamation_id", nullable = false)
    private Reclamation reclamation;

    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    @Column(name = "chemin_fichier", nullable = false, length = 500)
    private String cheminFichier;

    @Column(name = "type_contenu", length = 100)
    private String typeContenu;

    @Column(name = "taille_fichier")
    private Long tailleFichier;

    @Column(name = "date_envoi", nullable = false, updatable = false)
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        dateEnvoi = LocalDateTime.now();
    }
}
