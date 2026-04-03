package com.forsalaw.userManagement.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UnlockAccountEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${forsalaw.mail.from:no-reply@forsalaw.local}")
    private String fromAddress;

    @Value("${forsalaw.support.admin-email:admin@forsalaw.local}")
    private String adminSupportEmail;

    public void sendUnlockRequestToAdmin(String requesterEmail, String requesterMessage) {
        String cleanEmail = requesterEmail == null ? "" : requesterEmail.trim().toLowerCase();
        String cleanMessage = requesterMessage == null ? "" : requesterMessage.trim();
        String subject = "ForsaLaw - Demande de deblocage de compte";
        String htmlBody = buildHtmlBody(cleanEmail, cleanMessage);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("SMTP non configure. Demande de deblocage pour {} (destinataire admin: {}).", cleanEmail, adminSupportEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(adminSupportEmail);
            helper.setReplyTo(cleanEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Demande de deblocage envoyee a l'admin pour {}", cleanEmail);
        } catch (Exception e) {
            log.error("Echec d'envoi de la demande de deblocage pour {}", cleanEmail, e);
        }
    }

    private String buildHtmlBody(String requesterEmail, String requesterMessage) {
        String safeEmail = escape(requesterEmail);
        String safeMessage = requesterMessage.isBlank()
                ? "<em>Aucun message complementaire.</em>"
                : escape(requesterMessage).replace("\n", "<br/>");
        return """
                <html>
                  <body style="font-family:Arial,sans-serif;background:#f7f7f7;padding:24px;color:#1f2937;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:auto;background:#ffffff;border-radius:10px;padding:24px;">
                      <tr>
                        <td>
                          <h2 style="margin:0 0 12px 0;color:#111827;">Demande de deblocage de compte</h2>
                          <p style="margin:0 0 10px 0;line-height:1.6;"><strong>Email utilisateur:</strong> %s</p>
                          <p style="margin:0 0 10px 0;line-height:1.6;"><strong>Message:</strong></p>
                          <p style="margin:0;line-height:1.6;color:#374151;">%s</p>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(safeEmail, safeMessage);
    }

    private static String escape(String s) {
        return s == null ? "" : s
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
