package com.forsalaw.avocatManagement.entity;

/**
 * Domaines du droit (grandes catégories). Utilisé pour afficher une hiérarchie
 * domaine → sous-domaines (spécialités) dans Swagger et le frontend.
 */
public enum DomaineJuridique {

    DROIT_PUBLIC("Droit public"),
    DROIT_PRIVE("Droit privé"),
    DROIT_PENAL("Droit pénal"),
    DROIT_TRAVAIL_ET_SOCIAL("Droit du travail et social"),
    DROIT_DES_AFFAIRES("Droit des affaires"),
    DROIT_INTERNATIONAL("Droit international"),
    PROPRIETE_INTELLECTUELLE("Propriété intellectuelle"),
    DROIT_ENVIRONNEMENT("Droit de l'environnement"),
    DROIT_MARITIME_ET_TRANSPORT("Droit maritime et transport"),
    DROIT_DE_LA_SANTE("Droit de la santé"),
    DROIT_IMMIGRATION("Droit de l'immigration"),
    DROIT_MILITAIRE("Droit militaire"),
    DROIT_NUMERIQUE("Droit du numérique et technologies"),
    DROIT_ENERGIE("Droit de l'énergie"),
    DROIT_AGRICOLE("Droit agricole");

    private final String libelle;

    DomaineJuridique(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
