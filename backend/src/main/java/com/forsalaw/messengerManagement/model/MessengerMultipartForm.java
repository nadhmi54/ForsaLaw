package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Formulaire multipart pour l'envoi de pieces jointes (documentation OpenAPI + binding Spring).
 * Swagger UI : corps multipart (pas des query params).
 */
@Getter
@Setter
@Schema(
        description = "multipart/form-data : champ texte `content` + `files` (un ou plusieurs fichiers).",
        requiredProperties = {"files"}
)
public class MessengerMultipartForm {

    @Schema(description = "Texte du message (optionnel)")
    private String content;

    @ArraySchema(
            arraySchema = @Schema(description = "Fichiers (pdf, png, jpg, jpeg, gif, webp)"),
            schema = @Schema(type = "string", format = "binary")
    )
    private List<MultipartFile> files;

    /** Pour le service (tableau attendu par Spring MVC si plusieurs parts du meme nom). */
    public MultipartFile[] getFilesAsArray() {
        if (files == null || files.isEmpty()) {
            return new MultipartFile[0];
        }
        return files.toArray(new MultipartFile[0]);
    }
}
