package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Statut d'accusé de réception pour un message <strong>que j'ai envoyé</strong> :
 * livré au destinataire et/ou lu par lui.
 */
@Schema(description = "SENT = enregistré côté serveur ; DELIVERED = vu par l'interlocuteur (sync) ; READ = marqué lu.")
public enum MessengerRecipientReceiptStatus {
    SENT,
    DELIVERED,
    READ
}
