package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Ouvre une conversation avec un avocat ou retourne celle existante (même paire client / avocat).")
public class OpenConversationRequest {

    @NotBlank(message = "L'identifiant de l'avocat est requis.")
    @Schema(description = "ID du profil avocat (ex. 2025-AVC-00001)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String avocatId;
}
