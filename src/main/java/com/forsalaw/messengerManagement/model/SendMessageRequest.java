package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Envoi d'un message dans une conversation.")
public class SendMessageRequest {

    @NotBlank(message = "Le contenu du message est requis.")
    @Size(max = 10000, message = "Le message ne peut pas dépasser 10000 caractères.")
    @Schema(description = "Texte du message", requiredMode = Schema.RequiredMode.REQUIRED)
    private String content;
}
