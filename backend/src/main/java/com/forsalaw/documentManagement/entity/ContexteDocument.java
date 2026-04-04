package com.forsalaw.documentManagement.entity;

/**
 * Définit le type de contexte auquel un document est rattaché.
 */
public enum ContexteDocument {
    RECLAMATION,
    MESSENGER,
    DOSSIER,
    GENERAL,
    /** Photo de profil utilisateur (contexteId = id utilisateur). */
    PROFIL_UTILISATEUR
}
