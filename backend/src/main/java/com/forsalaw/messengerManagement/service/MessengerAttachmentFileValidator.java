package com.forsalaw.messengerManagement.service;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;

/**
 * Validation extension, taille et en-tetes magiques (anti-spoof MIME basique).
 */
@Component
public class MessengerAttachmentFileValidator {

    private static final Set<String> ALLOWED_EXT = Set.of(
            "pdf", "png", "jpg", "jpeg", "gif", "webp"
    );

    public boolean isAllowedExtension(String ext) {
        if (ext == null) {
            return false;
        }
        return ALLOWED_EXT.contains(ext.toLowerCase(Locale.ROOT));
    }

    public String extensionOf(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).trim().toLowerCase(Locale.ROOT);
    }

    /**
     * Verifie les premiers octets pour correspondre au type attendu.
     */
    public boolean magicBytesMatch(String ext, byte[] head) {
        if (head == null || head.length < 4) {
            return false;
        }
        String e = ext.toLowerCase(Locale.ROOT);
        return switch (e) {
            case "pdf" -> head.length >= 4 && head[0] == 0x25 && head[1] == 0x50 && head[2] == 0x44 && head[3] == 0x46;
            case "png" -> head.length >= 4 && (head[0] & 0xFF) == 0x89 && head[1] == 0x50 && head[2] == 0x4E && head[3] == 0x47;
            case "jpg", "jpeg" -> head.length >= 3
                    && (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8 && (head[2] & 0xFF) == 0xFF;
            case "gif" -> head.length >= 6 && head[0] == 0x47 && head[1] == 0x49 && head[2] == 0x46;
            case "webp" -> head.length >= 12
                    && head[0] == 0x52 && head[1] == 0x49 && head[2] == 0x46 && head[3] == 0x46
                    && head[8] == 0x57 && head[9] == 0x45 && head[10] == 0x42 && head[11] == 0x50;
            default -> false;
        };
    }

    public byte[] readHead(MultipartFile file, int max) throws IOException {
        try (var in = file.getInputStream()) {
            return in.readNBytes(max);
        }
    }
}
