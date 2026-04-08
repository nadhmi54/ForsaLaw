package com.forsalaw.rdvManagement.service;

import com.forsalaw.rdvManagement.entity.RendezVous;
import com.forsalaw.rdvManagement.entity.StatutRendezVous;
import com.forsalaw.rdvManagement.repository.RendezVousRepository;
import com.forsalaw.userManagement.entity.UserNotificationPreferences;
import com.forsalaw.userManagement.repository.UserNotificationPreferencesRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.function.Predicate;

@Service
@RequiredArgsConstructor
@Slf4j
public class RdvNotificationEmailService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'à' HH:mm");

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final UserNotificationPreferencesRepository preferencesRepository;
    private final RendezVousRepository rendezVousRepository;

    @Value("${forsalaw.mail.from:no-reply@forsalaw.local}")
    private String fromAddress;

    @Value("${forsalaw.app.frontend-base-url:http://localhost:4200}")
    private String frontendBaseUrl;

    public void notifyDemandeRecue(String idRendezVous) {
        rendezVousRepository.findByIdWithClientAndAvocat(idRendezVous).ifPresent(rdv -> {
            String avocatUserId = rdv.getAvocat().getUser().getId();
            if (!prefs(avocatUserId, UserNotificationPreferences::isEmailRdvDemandeRecue)) {
                return;
            }
            String to = rdv.getAvocat().getUser().getEmail();
            String clientNom = rdv.getClient().getPrenom() + " " + rdv.getClient().getNom();
            String motif = formatMotif(rdv.getMotifConsultation());
            String subject = "ForsaLaw — Nouvelle demande de rendez-vous";
            String inner = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Vous avez reçu une <strong>nouvelle demande de rendez-vous</strong> de la part de <strong>%s</strong>.</p>
                    %s
                    <p style="margin:0;color:#475569;line-height:1.65;">Nous vous invitons à vous connecter à votre espace professionnel pour prendre connaissance de cette demande et, le cas échéant, proposer un créneau.</p>
                    """.formatted(escape(clientNom), blocMotif(motif));
            String html = wrapLayout("Nouvelle demande de rendez-vous", inner);
            sendHtml(to, subject, html);
        });
    }

    public void notifyCreneauPropose(String idRendezVous) {
        rendezVousRepository.findByIdWithClientAndAvocat(idRendezVous).ifPresent(rdv -> {
            if (rdv.getStatutRendezVous() != StatutRendezVous.PROPOSE) {
                return;
            }
            String clientUserId = rdv.getClient().getId();
            if (!prefs(clientUserId, UserNotificationPreferences::isEmailRdvCreneauPropose)) {
                return;
            }
            String to = rdv.getClient().getEmail();
            String avocatNom = rdv.getAvocat().getUser().getPrenom() + " " + rdv.getAvocat().getUser().getNom();
            String debut = rdv.getDateHeureDebut() != null ? FMT.format(rdv.getDateHeureDebut()) : "—";
            String fin = rdv.getDateHeureFin() != null ? FMT.format(rdv.getDateHeureFin()) : "—";
            String subject = "ForsaLaw — Proposition de créneau pour votre rendez-vous";
            String inner = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;"><strong>%s</strong> vous propose les créneaux suivants pour votre consultation :</p>
                    %s
                    <p style="margin:0;color:#475569;line-height:1.65;">Vous pouvez accepter ou refuser cette proposition depuis votre espace personnel.</p>
                    """.formatted(escape(avocatNom), blocHoraires(debut, fin));
            String html = wrapLayout("Proposition de créneau", inner);
            sendHtml(to, subject, html);
        });
    }

    public void notifyAnnulation(String idRendezVous, boolean annuleParClient) {
        rendezVousRepository.findByIdWithClientAndAvocat(idRendezVous).ifPresent(rdv -> {
            if (rdv.getStatutRendezVous() != StatutRendezVous.ANNULE) {
                return;
            }
            String destinataireUserId = annuleParClient ? rdv.getAvocat().getUser().getId() : rdv.getClient().getId();
            if (!prefs(destinataireUserId, UserNotificationPreferences::isEmailRdvAnnulation)) {
                return;
            }
            String to = annuleParClient ? rdv.getAvocat().getUser().getEmail() : rdv.getClient().getEmail();
            String autre = annuleParClient
                    ? rdv.getClient().getPrenom() + " " + rdv.getClient().getNom()
                    : rdv.getAvocat().getUser().getPrenom() + " " + rdv.getAvocat().getUser().getNom();
            String subject = "ForsaLaw — Rendez-vous annulé";
            String raison = rdv.getRaisonAnnulation() != null && !rdv.getRaisonAnnulation().isBlank()
                    ? escape(rdv.getRaisonAnnulation().trim())
                    : null;
            String inner = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Le rendez-vous prévu avec <strong>%s</strong> a été <strong>annulé</strong>.</p>
                    %s
                    """.formatted(escape(autre), raison != null ? blocRaison(raison) : "<p style=\"margin:0;color:#64748b;font-size:14px;\">Aucun motif complémentaire n'a été indiqué.</p>");
            String html = wrapLayout("Annulation de rendez-vous", inner);
            sendHtml(to, subject, html);
        });
    }

    public void notifyConfirmation(String idRendezVous) {
        rendezVousRepository.findByIdWithClientAndAvocat(idRendezVous).ifPresent(rdv -> {
            if (rdv.getStatutRendezVous() != StatutRendezVous.CONFIRME) {
                return;
            }
            String debut = rdv.getDateHeureDebut() != null ? FMT.format(rdv.getDateHeureDebut()) : "—";
            String fin = rdv.getDateHeureFin() != null ? FMT.format(rdv.getDateHeureFin()) : "—";
            boolean enLigne = rdv.getTypeRendezVous() == com.forsalaw.rdvManagement.entity.TypeRendezVous.EN_LIGNE;
            String blocFormat = enLigne
                    ? "<p style=\"margin:0 0 16px;color:#0f172a;\"><strong>Format :</strong> En ligne (depuis la plateforme ForsaLaw)</p>"
                    : "<p style=\"margin:0 0 16px;color:#0f172a;\"><strong>Format :</strong> Cabinet / présentiel</p>";
            String blocAccesPlateforme = enLigne
                    ? "<p style=\"margin:0 0 18px;line-height:1.65;color:#334155;\">Vous pourrez rejoindre la salle de rendez-vous directement depuis votre espace ForsaLaw au moment prévu.</p>"
                    : "";

            // Toujours envoyer la confirmation si SMTP OK. Les autres mails RDV restent filtres par les preferences.
            String avocatNom = rdv.getAvocat().getUser().getPrenom() + " " + rdv.getAvocat().getUser().getNom();
            String innerClient = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Votre rendez-vous avec <strong>%s</strong> a été <strong>confirmé</strong>.</p>
                    %s
                    %s
                    %s
                    """.formatted(escape(avocatNom), blocHoraires(debut, fin), blocFormat, blocAccesPlateforme);
            sendHtml(rdv.getClient().getEmail(), "ForsaLaw — Rendez-vous confirmé", wrapLayout("Confirmation de rendez-vous", innerClient));

            String clientNom = rdv.getClient().getPrenom() + " " + rdv.getClient().getNom();
            String innerAvocat = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Le rendez-vous avec <strong>%s</strong> est désormais <strong>confirmé</strong>.</p>
                    %s
                    %s
                    %s
                    """.formatted(escape(clientNom), blocHoraires(debut, fin), blocFormat, blocAccesPlateforme);
            sendHtml(rdv.getAvocat().getUser().getEmail(), "ForsaLaw — Rendez-vous confirmé", wrapLayout("Confirmation de rendez-vous", innerAvocat));
        });
    }

    public void notifyRappelJ1(RendezVous rdv) {
        if (rdv.getDateHeureDebut() == null) {
            return;
        }
        String debut = FMT.format(rdv.getDateHeureDebut());
        String fin = rdv.getDateHeureFin() != null ? FMT.format(rdv.getDateHeureFin()) : "—";

        if (prefs(rdv.getClient().getId(), UserNotificationPreferences::isEmailRdvRappelJ1)) {
            String inner = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Nous vous rappelons que vous avez un <strong>rendez-vous confirmé demain</strong>.</p>
                    %s
                    <p style="margin:0;color:#475569;line-height:1.65;">N'hésitez pas à vous connecter à votre espace pour toute précision.</p>
                    """.formatted(blocHoraires(debut, fin));
            sendHtml(rdv.getClient().getEmail(), "ForsaLaw — Rappel : rendez-vous demain", wrapLayout("Rappel — rendez-vous demain", inner));
        }
        if (prefs(rdv.getAvocat().getUser().getId(), UserNotificationPreferences::isEmailRdvRappelJ1)) {
            String clientNom = rdv.getClient().getPrenom() + " " + rdv.getClient().getNom();
            String inner = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Rappel : vous avez un rendez-vous prévu <strong>demain</strong> avec <strong>%s</strong>.</p>
                    %s
                    """.formatted(escape(clientNom), blocHoraires(debut, fin));
            sendHtml(rdv.getAvocat().getUser().getEmail(), "ForsaLaw — Rappel : rendez-vous demain", wrapLayout("Rappel — rendez-vous demain", inner));
        }
    }

    public void notifyRappelH1(RendezVous rdv) {
        if (rdv.getDateHeureDebut() == null) {
            return;
        }
        String debut = FMT.format(rdv.getDateHeureDebut());
        String fin = rdv.getDateHeureFin() != null ? FMT.format(rdv.getDateHeureFin()) : "—";

        if (prefs(rdv.getClient().getId(), UserNotificationPreferences::isEmailRdvRappelH1)) {
            String inner = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Votre rendez-vous commence dans environ <strong>une heure</strong>.</p>
                    %s
                    """.formatted(blocHoraires(debut, fin));
            sendHtml(rdv.getClient().getEmail(), "ForsaLaw — Rappel : rendez-vous dans une heure", wrapLayout("Rappel — dans environ une heure", inner));
        }
        if (prefs(rdv.getAvocat().getUser().getId(), UserNotificationPreferences::isEmailRdvRappelH1)) {
            String clientNom = rdv.getClient().getPrenom() + " " + rdv.getClient().getNom();
            String inner = """
                    <p style="margin:0 0 14px;">Bonjour,</p>
                    <p style="margin:0 0 18px;line-height:1.65;">Rappel : rendez-vous avec <strong>%s</strong> dans environ <strong>une heure</strong>.</p>
                    %s
                    """.formatted(escape(clientNom), blocHoraires(debut, fin));
            sendHtml(rdv.getAvocat().getUser().getEmail(), "ForsaLaw — Rappel : rendez-vous dans une heure", wrapLayout("Rappel — dans environ une heure", inner));
        }
    }

    private static String formatMotif(String motif) {
        if (motif == null || motif.isBlank()) {
            return "Non renseigné";
        }
        return motif.trim();
    }

    private static String blocMotif(String motifEscapedOrPlain) {
        String m = escape(motifEscapedOrPlain);
        return """
                <div style="background:#f8fafc;border-radius:8px;padding:16px 18px;margin:0 0 20px;border-left:4px solid #1e3a5f;">
                  <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;">Objet de la demande</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;line-height:1.5;">%s</p>
                </div>
                """.formatted(m);
    }

    private static String blocHoraires(String debut, String fin) {
        return """
                <div style="background:#f8fafc;border-radius:8px;padding:16px 18px;margin:0 0 20px;border-left:4px solid #1e3a5f;">
                  <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;">Horaires proposés</p>
                  <p style="margin:0 0 6px;font-size:15px;color:#0f172a;"><strong>Début :</strong> %s</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;"><strong>Fin :</strong> %s</p>
                </div>
                """.formatted(debut, fin);
    }

    private static String blocRaison(String raisonEscaped) {
        return """
                <div style="background:#f8fafc;border-radius:8px;padding:16px 18px;margin:0 0 0;border-left:4px solid #94a3b8;">
                  <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;">Motif indiqué</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;line-height:1.5;">%s</p>
                </div>
                """.formatted(raisonEscaped);
    }

    private boolean prefs(String userId, Predicate<UserNotificationPreferences> flag) {
        Optional<UserNotificationPreferences> o = preferencesRepository.findById(userId);
        return o.map(flag::test).orElse(true);
    }

    private void sendHtml(String to, String subject, String htmlBody) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("SMTP non configure. Email non envoye a {} — sujet: {}", to, subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email RDV envoye a {} — {}", to, subject);
        } catch (Exception e) {
            log.error("Echec envoi email RDV a {} — {}", to, subject, e);
        }
    }

    private String wrapLayout(String title, String innerHtml) {
        return """
                <html>
                  <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
                  <body style="margin:0;padding:0;background:#eef1f5;">
                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:32px 16px;">
                      <tr><td align="center">
                        <table role="presentation" width="100%%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.08);">
                          <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%%,#0f172a 100%%);padding:22px 28px;">
                            <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;letter-spacing:.02em;">ForsaLaw</p>
                            <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">Votre espace juridique</p>
                          </td></tr>
                          <tr><td style="padding:28px 28px 8px;">
                            <h1 style="margin:0 0 18px;font-size:20px;font-weight:600;color:#0f172a;line-height:1.35;">%s</h1>
                            <div style="font-size:15px;line-height:1.6;color:#334155;">%s</div>
                          </td></tr>
                          <tr><td style="padding:8px 28px 28px;">
                            <a href="%s" style="display:inline-block;background:#1e3a5f;color:#ffffff !important;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Accéder à mon espace</a>
                          </td></tr>
                          <tr><td style="padding:16px 28px 22px;border-top:1px solid #e2e8f0;background:#fafafa;">
                            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5;">Message automatique — merci de ne pas répondre directement à cet e-mail.</p>
                            <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">© ForsaLaw</p>
                          </td></tr>
                        </table>
                      </td></tr>
                    </table>
                  </body>
                </html>
                """.formatted(escape(title), innerHtml, escape(frontendBaseUrl));
    }

    private static String escape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
