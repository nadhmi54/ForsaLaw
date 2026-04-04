package com.forsalaw.notificationManagement.service;

import com.forsalaw.affaireManagement.entity.Affaire;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Orchestrateur de notifications : déclenche Email ET WhatsApp selon disponibilité.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final WhatsAppService whatsAppService;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Notifie le client d'un changement de statut sur son affaire.
     */
    public void notifierChangementStatutAffaire(Affaire affaire) {
        String clientTel = affaire.getClient().getTelephone();
        String avocatTel = (affaire.getAvocat() != null)
                ? affaire.getAvocat().getUser().getTelephone()
                : null;

        String msgClient = buildMessageClient(affaire);
        String msgAvocat = buildMessageAvocat(affaire);

        // Notification au client
        if (clientTel != null && !clientTel.isBlank()) {
            whatsAppService.envoyer(clientTel, msgClient);
        } else {
            log.info("[Notification] Pas de téléphone pour le client {}, notification WhatsApp ignorée.",
                    affaire.getClient().getEmail());
        }

        // Notification à l'avocat (si assigné)
        if (avocatTel != null && !avocatTel.isBlank()) {
            whatsAppService.envoyer(avocatTel, msgAvocat);
        }
    }

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

    // ─── Templates de messages ────────────────────────────────────────────────

    private String buildMessageClient(Affaire affaire) {
        StringBuilder sb = new StringBuilder();
        sb.append("⚖️ ForsaLaw | Mise à jour de votre affaire\n\n");
        sb.append("Affaire : ").append(affaire.getTitre()).append("\n");
        sb.append("Nouveau statut : ").append(translateStatut(affaire.getStatut())).append("\n");
        if (affaire.getDateProchaineAudience() != null) {
            sb.append("📅 Prochaine audience : ")
              .append(affaire.getDateProchaineAudience().format(DATE_FMT)).append("\n");
        }
        sb.append("\nConsultez les détails sur ForsaLaw.");
        return sb.toString();
    }

    private String buildMessageAvocat(Affaire affaire) {
        return String.format(
                "⚖️ ForsaLaw | Affaire %s\nStatut mis à jour : %s\nClient : %s %s",
                affaire.getId(),
                translateStatut(affaire.getStatut()),
                affaire.getClient().getPrenom(),
                affaire.getClient().getNom()
        );
    }

    private String translateStatut(com.forsalaw.affaireManagement.entity.StatutAffaire statut) {
        return switch (statut) {
            case INSTRUCTION -> "En Instruction";
            case AUDIENCE    -> "Audience Fixée";
            case DELIBERE    -> "En Délibéré";
            case JUGEMENT    -> "Jugement Prononcé";
            case APPEL       -> "En Appel";
            case CLOS        -> "Affaire Clôturée";
        };
    }
}
