package com.forsalaw.messengerManagement.entity;

/**
 * Resultat du scan antivirus (ClamAV) sur une piece jointe.
 */
public enum AttachmentScanStatus {
    /** Scan non configure ou desactive — fichier accepte apres controles locaux. */
    SKIPPED,
    /** En attente de scan (ne devrait pas rester en prod si scan synchrone). */
    PENDING,
    /** Fichier considere comme sain. */
    CLEAN,
    /** Menace detectee — le fichier ne doit pas etre servi. */
    INFECTED,
    /** Erreur technique lors du scan. */
    ERROR
}
