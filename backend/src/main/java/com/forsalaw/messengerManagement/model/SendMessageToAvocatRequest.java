package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Envoi direct au client : pas besoin de connaître l'id de conversation (CNV) à l'avance.
 */
@Getter
@Setter
@Schema(description = "Envoyer un message à un avocat : l'id de conversation est créé ou retrouvé automatiquement.")
public class SendMessageToAvocatRequest {

    @NotBlank(message = "L'identifiant de l'avocat est requis.")
    @Schema(description = "ID du profil avocat (…-AVC-…)", requiredMode = Schema.RequiredMode.REQUIRED, example = "2026-AVC-00001")
    private String avocatId;

    @NotBlank(message = "Le contenu du message est requis.")
    @Size(max = 10000)
    @Schema(description = "Texte du message", requiredMode = Schema.RequiredMode.REQUIRED)
    private String content;
}
