package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Réponse de l'avocat sans mettre l'id de conversation (CNV) dans l'URL.
 */
@Getter
@Setter
@Schema(description = "Répondre à un client : utilise l'id utilisateur du client (…-USR-…).")
public class SendMessageToClientRequest {

    @NotBlank(message = "L'identifiant du client (utilisateur) est requis.")
    @Schema(description = "ID du compte utilisateur client (…-USR-…)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String clientUserId;

    @NotBlank(message = "Le contenu du message est requis.")
    @Size(max = 10000)
    @Schema(description = "Texte du message", requiredMode = Schema.RequiredMode.REQUIRED)
    private String content;
}
