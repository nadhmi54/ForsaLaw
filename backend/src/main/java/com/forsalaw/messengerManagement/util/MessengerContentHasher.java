package com.forsalaw.messengerManagement.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Empreinte SHA-256 du texte (avec poivre optionnel) pour l'affichage admin sans exposer le contenu en clair.
 */
public final class MessengerContentHasher {

    private MessengerContentHasher() {
    }

    /**
     * @return chaîne du type {@code sha256:hex...} ; pour entrée {@code null}, hache la chaîne vide.
     */
    public static String sha256Hex(String input, String pepper) {
        String s = input != null ? input : "";
        String p = pepper != null ? pepper : "";
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(p.getBytes(StandardCharsets.UTF_8));
            md.update((byte) '|');
            md.update(s.getBytes(StandardCharsets.UTF_8));
            return "sha256:" + toHex(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /**
     * Aperçu liste conversation : null reste null ; texte non vide devient empreinte.
     */
    public static String hashOptionalPreview(String preview, String pepper) {
        if (preview == null) {
            return null;
        }
        if (preview.isBlank()) {
            return preview;
        }
        return sha256Hex(preview, pepper);
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
