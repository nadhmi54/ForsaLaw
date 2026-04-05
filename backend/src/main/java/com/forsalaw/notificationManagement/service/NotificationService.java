package com.forsalaw.notificationManagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Orchestrateur de notifications : déclenche Email ET WhatsApp selon disponibilité.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final WhatsAppService whatsAppService;

    /**
     * Notifie qu'un document requiert une signature électronique.
     */
    public void notifierSignatureRequise(String telephone, String nomDocument, String affaireTitre) {
        if (telephone == null || telephone.isBlank()) return;
        String msg = String.format(
                "⚖️ ForsaLaw | Signature requise\n\nLe document \"%s\" lié à l'affaire \"%s\" requiert votre signature électronique.\n\nConnectez-vous à ForsaLaw pour le signer.",
                nomDocument, affaireTitre
        );
        whatsAppService.envoyer(telephone, msg);
    }
}
