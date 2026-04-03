package com.forsalaw.documentManagement.entity;

import com.forsalaw.userManagement.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Représente les métadonnées d'un document stocké dans le Coffre-fort Numérique.
 * Contient le hash SHA-256 servant de "sceau" d'intégrité.
 */
@Entity
@Table(name = "document_metadata", indexes = {
        @Index(name = "idx_doc_deposeur", columnList = "deposeur_id"),
        @Index(name = "idx_doc_contexte", columnList = "contexte_type, contexte_id"),
        @Index(name = "idx_doc_date_creation", columnList = "date_creation")
})
@Getter
@Setter
public class DocumentMetadata {

    @Id
    @Column(length = 20)
    private String id;

    /** L'utilisateur qui a déposé le document. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "deposeur_id", nullable = false)
    private User deposeur;

    /** Nom original du fichier tel qu'il a été uploadé par l'utilisateur. */
    @Column(name = "nom_original", nullable = false, length = 500)
    private String nomOriginal;

    /** Nom de stockage unique sur le disque (UUID + extension). */
    @Column(name = "nom_stockage", nullable = false, length = 255)
    private String nomStockage;

    /** Chemin physique complet sur le serveur. */
    @Column(name = "chemin_fichier", nullable = false, length = 1000)
    private String cheminFichier;

    /** Type MIME du fichier (ex: application/pdf, image/jpeg). */
    @Column(name = "type_contenu", length = 100)
    private String typeContenu;

    /** Taille du fichier en octets. */
    @Column(name = "taille_fichier")
    private Long tailleFichier;

    /**
     * Empreinte SHA-256 du fichier — le "sceau numérique".
     * 64 caractères hexadécimaux.
     */
    @Column(name = "hash_sha256", nullable = false, length = 64)
    private String hashSha256;

    /**
     * Type du contexte auquel ce document est rattaché (ex: RECLAMATION, DOSSIER, MESSENGER).
     * Permet de savoir d'où vient ce document.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "contexte_type", length = 50)
    private ContexteDocument contexteType;

    /** ID de l'entité parente (ex: ID de la réclamation, ID du dossier). */
    @Column(name = "contexte_id", length = 20)
    private String contexteId;

    /** Indique si le document a été supprimé (suppression logique). */
    @Column(name = "supprime", nullable = false)
    private boolean supprime = false;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
