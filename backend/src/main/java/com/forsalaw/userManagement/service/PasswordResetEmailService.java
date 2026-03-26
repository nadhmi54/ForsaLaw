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
public class PasswordResetEmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${forsalaw.mail.from:no-reply@forsalaw.local}")
    private String fromAddress;

    @Value("${forsalaw.password-reset.frontend-url:http://localhost:4200/reset-password}")
    private String resetFrontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = resetFrontendUrl + "?token=" + token;
        String subject = "ForsaLaw - Reinitialisation de votre mot de passe";

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("SMTP non configure. Email reset pour {}. Lien: {}", toEmail, resetLink);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            String htmlBody = buildHtmlBody(resetLink);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email reset envoye a {}", toEmail);
        } catch (Exception e) {
            log.error("Echec d'envoi email reset pour {}", toEmail, e);
        }
    }

    private String buildHtmlBody(String resetLink) {
        return """
                <html>
                  <body style="font-family:Arial,sans-serif;background:#f7f7f7;padding:24px;color:#1f2937;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:auto;background:#ffffff;border-radius:10px;padding:24px;">
                      <tr>
                        <td>
                          <h2 style="margin:0 0 12px 0;color:#111827;">Salut,</h2>
                          <p style="margin:0 0 12px 0;line-height:1.6;">
                            Notre equipe ForsaLaw a recu une demande de reinitialisation de mot de passe pour votre compte.
                          </p>
                          <p style="margin:0 0 20px 0;line-height:1.6;">
                            Cliquez sur le bouton ci-dessous pour definir un nouveau mot de passe :
                          </p>
                          <p style="text-align:center;margin:0 0 20px 0;">
                            <a href="%s" style="background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;">
                              Reinitialiser mon mot de passe
                            </a>
                          </p>
                          <p style="margin:0 0 12px 0;line-height:1.6;">
                            Ce lien expire dans 30 minutes.
                          </p>
                          <p style="margin:0;line-height:1.6;color:#6b7280;">
                            Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """.formatted(resetLink);
    }
}
