package com.forsalaw.avocatManagement.entity;

/**
 * Spécialités juridiques (domaines et sous-domaines) – ForsaLaw.
 * Chaque valeur correspond à un sous-domaine du droit ; libellé en français pour l'affichage.
 */
public enum SpecialiteJuridique {

    // ----- Anciennes valeurs conservées pour compatibilité -----
    travail("Droit du travail", DomaineJuridique.DROIT_TRAVAIL_ET_SOCIAL),
    penal("Droit pénal général", DomaineJuridique.DROIT_PENAL),
    civil("Droit civil", DomaineJuridique.DROIT_PRIVE),
    famille("Droit de la famille", DomaineJuridique.DROIT_PRIVE),
    fiscal("Droit fiscal", DomaineJuridique.DROIT_PUBLIC),
    commercial("Droit commercial", DomaineJuridique.DROIT_PRIVE),

    // ----- 1. Droit public -----
    DROIT_CONSTITUTIONNEL("Droit constitutionnel", DomaineJuridique.DROIT_PUBLIC),
    DROIT_ADMINISTRATIF("Droit administratif", DomaineJuridique.DROIT_PUBLIC),
    DROIT_FISCAL_ETAT("Droit fiscal et fiscalité", DomaineJuridique.DROIT_PUBLIC),
    FINANCES_PUBLIQUES("Finances publiques", DomaineJuridique.DROIT_PUBLIC),
    DROIT_ELECTORAL("Droit électoral", DomaineJuridique.DROIT_PUBLIC),
    DROIT_MARCHES_PUBLICS("Droit des marchés publics", DomaineJuridique.DROIT_PUBLIC),

    // ----- 2. Droit privé -----
    DROIT_DE_LA_FAMILLE("Droit de la famille", DomaineJuridique.DROIT_PRIVE),
    DROIT_DES_SOCIETES("Droit des sociétés", DomaineJuridique.DROIT_PRIVE),
    DROIT_DES_CONTRATS("Droit des contrats", DomaineJuridique.DROIT_PRIVE),
    DROIT_DES_BIENS("Droit des biens", DomaineJuridique.DROIT_PRIVE),
    DROIT_IMMOBILIER("Droit immobilier", DomaineJuridique.DROIT_PRIVE),
    DROIT_DES_SUCCESSIONS("Droit des successions", DomaineJuridique.DROIT_PRIVE),
    DROIT_DES_ASSURANCES("Droit des assurances", DomaineJuridique.DROIT_PRIVE),
    DROIT_DE_LA_CONSOMMATION("Droit de la consommation", DomaineJuridique.DROIT_PRIVE),

    // ----- 3. Droit pénal -----
    DROIT_PENAL_GENERAL("Droit pénal général", DomaineJuridique.DROIT_PENAL),
    DROIT_PENAL_SPECIAL("Droit pénal spécial", DomaineJuridique.DROIT_PENAL),
    DROIT_PENAL_DES_AFFAIRES("Droit pénal des affaires", DomaineJuridique.DROIT_PENAL),
    DROIT_PENAL_INTERNATIONAL("Droit pénal international", DomaineJuridique.DROIT_PENAL),
    DROIT_PENAL_MILITAIRE("Droit pénal militaire", DomaineJuridique.DROIT_PENAL),

    // ----- 4. Droit du travail et social -----
    DROIT_DU_TRAVAIL("Droit du travail", DomaineJuridique.DROIT_TRAVAIL_ET_SOCIAL),
    DROIT_DE_LA_SECURITE_SOCIALE("Droit de la sécurité sociale", DomaineJuridique.DROIT_TRAVAIL_ET_SOCIAL),
    DROIT_SYNDICAL("Droit syndical", DomaineJuridique.DROIT_TRAVAIL_ET_SOCIAL),
    DROIT_DE_LA_PROTECTION_SOCIALE("Droit de la protection sociale", DomaineJuridique.DROIT_TRAVAIL_ET_SOCIAL),

    // ----- 5. Droit des affaires -----
    DROIT_BANCAIRE("Droit bancaire", DomaineJuridique.DROIT_DES_AFFAIRES),
    DROIT_FINANCIER("Droit financier", DomaineJuridique.DROIT_DES_AFFAIRES),
    DROIT_BOURSIER("Droit boursier", DomaineJuridique.DROIT_DES_AFFAIRES),
    DROIT_DE_LA_CONCURRENCE("Droit de la concurrence", DomaineJuridique.DROIT_DES_AFFAIRES),
    DROIT_DES_FAILLITES("Droit des faillites", DomaineJuridique.DROIT_DES_AFFAIRES),

    // ----- 6. Droit international -----
    DROIT_INTERNATIONAL_PUBLIC("Droit international public", DomaineJuridique.DROIT_INTERNATIONAL),
    DROIT_INTERNATIONAL_PRIVE("Droit international privé", DomaineJuridique.DROIT_INTERNATIONAL),
    DROIT_INTERNATIONAL_ECONOMIQUE("Droit international économique", DomaineJuridique.DROIT_INTERNATIONAL),
    DROIT_HUMANITAIRE_INTERNATIONAL("Droit humanitaire international", DomaineJuridique.DROIT_INTERNATIONAL),

    // ----- 7. Droit de la propriété intellectuelle -----
    DROIT_DAUTEUR("Droit d'auteur", DomaineJuridique.PROPRIETE_INTELLECTUELLE),
    DROIT_DES_BREVETS("Droit des brevets", DomaineJuridique.PROPRIETE_INTELLECTUELLE),
    DROIT_DES_MARQUES("Droit des marques", DomaineJuridique.PROPRIETE_INTELLECTUELLE),
    DROIT_DES_DESSINS_ET_MODELES("Droit des dessins et modèles", DomaineJuridique.PROPRIETE_INTELLECTUELLE),

    // ----- 8. Droit de l'environnement -----
    DROIT_DE_LA_POLLUTION("Droit de la pollution", DomaineJuridique.DROIT_ENVIRONNEMENT),
    DROIT_CLIMATIQUE("Droit climatique", DomaineJuridique.DROIT_ENVIRONNEMENT),
    DROIT_DES_RESSOURCES_NATURELLES("Droit des ressources naturelles", DomaineJuridique.DROIT_ENVIRONNEMENT),

    // ----- 9. Droit maritime et transport -----
    DROIT_MARITIME("Droit maritime", DomaineJuridique.DROIT_MARITIME_ET_TRANSPORT),
    DROIT_AERIEN("Droit aérien", DomaineJuridique.DROIT_MARITIME_ET_TRANSPORT),
    DROIT_DU_TRANSPORT("Droit du transport", DomaineJuridique.DROIT_MARITIME_ET_TRANSPORT),
    DROIT_SPATIAL("Droit spatial", DomaineJuridique.DROIT_MARITIME_ET_TRANSPORT),

    // ----- 10. Droit de la santé -----
    RESPONSABILITE_MEDICALE("Responsabilité médicale", DomaineJuridique.DROIT_DE_LA_SANTE),
    DROIT_HOSPITALIER("Droit hospitalier", DomaineJuridique.DROIT_DE_LA_SANTE),
    BIOETHIQUE("Bioéthique", DomaineJuridique.DROIT_DE_LA_SANTE),

    // ----- 11. Droit de l'immigration -----
    VISAS("Visas", DomaineJuridique.DROIT_IMMIGRATION),
    NATURALISATION("Naturalisation", DomaineJuridique.DROIT_IMMIGRATION),
    DROIT_DES_REFUGIES("Droit des réfugiés", DomaineJuridique.DROIT_IMMIGRATION),

    // ----- 12. Droit militaire -----
    DISCIPLINE_MILITAIRE("Discipline militaire", DomaineJuridique.DROIT_MILITAIRE),
    TRIBUNAUX_MILITAIRES("Tribunaux militaires", DomaineJuridique.DROIT_MILITAIRE),

    // ----- 13. Droit du numérique et technologies -----
    CYBERSECURITE("Cybersécurité", DomaineJuridique.DROIT_NUMERIQUE),
    DONNEES_PERSONNELLES_RGPD("Données personnelles et RGPD", DomaineJuridique.DROIT_NUMERIQUE),
    INTELLIGENCE_ARTIFICIELLE("Droit de l'intelligence artificielle", DomaineJuridique.DROIT_NUMERIQUE),
    DROIT_DE_INTERNET("Droit de l'internet", DomaineJuridique.DROIT_NUMERIQUE),

    // ----- 14. Droit de l'énergie -----
    DROIT_PETROLE_GAZ("Droit du pétrole et du gaz", DomaineJuridique.DROIT_ENERGIE),
    DROIT_ELECTRICITE("Droit de l'électricité", DomaineJuridique.DROIT_ENERGIE),
    ENERGIE_RENOUVELABLE("Énergie renouvelable", DomaineJuridique.DROIT_ENERGIE),

    // ----- 15. Droit agricole -----
    EXPLOITATION_AGRICOLE("Exploitation agricole", DomaineJuridique.DROIT_AGRICOLE),
    SECURITE_ALIMENTAIRE("Sécurité alimentaire", DomaineJuridique.DROIT_AGRICOLE);

    private final String libelle;
    private final DomaineJuridique domaine;

    SpecialiteJuridique(String libelle, DomaineJuridique domaine) {
        this.libelle = libelle;
        this.domaine = domaine;
    }

    /** Libellé en français pour l'affichage (API, frontend). */
    public String getLibelle() {
        return libelle;
    }

    /** Domaine du droit auquel appartient cette spécialité (pour Swagger / filtres). */
    public DomaineJuridique getDomaine() {
        return domaine;
    }
}
