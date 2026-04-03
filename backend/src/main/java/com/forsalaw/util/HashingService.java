package com.forsalaw.util;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Service utilitaire pour calculer l'empreinte cryptographique (Hash SHA-256) d'un fichier.
 * Le hash sert de "sceau numérique" : si le fichier est modifié, le hash change.
 */
@Service
public class HashingService {

    /**
     * Calcule le Hash SHA-256 d'un flux de données.
     * @param inputStream Le flux du fichier à analyser.
     * @return Le hash en hexadécimal (64 caractères), ex: "a3f1b2c4..."
     */
    public String calculerHashSha256(InputStream inputStream) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (DigestInputStream dis = new DigestInputStream(inputStream, digest)) {
                byte[] buffer = new byte[8192];
                while (dis.read(buffer) != -1) {
                    // Lire le flux pour alimenter le digest
                }
            }
            byte[] hashBytes = digest.digest();
            return bytesEnHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Algorithme SHA-256 non disponible.", e);
        } catch (IOException e) {
            throw new IllegalStateException("Erreur lors de la lecture du fichier pour le hachage.", e);
        }
    }

    private String bytesEnHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
