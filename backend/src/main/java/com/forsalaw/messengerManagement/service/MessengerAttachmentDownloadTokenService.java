package com.forsalaw.messengerManagement.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Jetons JWT courts dedies au telechargement des pieces jointes (URL signee temporaire).
 */
@Service
public class MessengerAttachmentDownloadTokenService {

    public static final String CLAIM_ATTACHMENT_ID = "attachmentId";
    public static final String CLAIM_TYP = "typ";
    public static final String TYP_ATTACHMENT = "attachment_dl";

    @Value("${forsalaw.jwt.secret:forsalaw-secret-key-min-256-bits-pour-hs256-utilisation}")
    private String secret;

    @Value("${forsalaw.messenger.attachments.download-token-expiration-ms:900000}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateDownloadToken(String attachmentId, String viewerEmail) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(viewerEmail)
                .claim(CLAIM_TYP, TYP_ATTACHMENT)
                .claim(CLAIM_ATTACHMENT_ID, attachmentId)
                .issuedAt(now)
                .expiration(exp)
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
