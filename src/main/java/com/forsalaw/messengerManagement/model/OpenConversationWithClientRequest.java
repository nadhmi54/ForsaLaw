package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Ouvre une conversation avec un client ou retourne celle existante (même paire avocat connecté / client).")
public class OpenConversationWithClientRequest {

    @NotBlank(message = "L'identifiant du client (utilisateur) est requis.")
    @Schema(description = "ID du compte utilisateur client (…-USR-…)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String clientUserId;
}
