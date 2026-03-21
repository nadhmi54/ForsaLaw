package com.forsalaw.messengerManagement.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Résultat d'un envoi : id de conversation (pour GET historique) + message créé.")
public class MessengerSendResultDTO {

    @Schema(description = "Id de la conversation (…-CNV-…). À réutiliser pour GET /conversations/{id}/messages si besoin.")
    private String conversationId;

    private MessengerMessageDTO message;
}
