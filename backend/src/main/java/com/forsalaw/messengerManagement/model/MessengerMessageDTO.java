package com.forsalaw.messengerManagement.model;

import com.forsalaw.messengerManagement.entity.MessengerSenderRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessengerMessageDTO {

    private String id;
    private String senderUserId;
    private MessengerSenderRole senderRole;
    private String content;
    private LocalDateTime createdAt;
    private List<MessengerAttachmentDTO> attachments = new ArrayList<>();

    /**
     * Pour les messages que l'utilisateur courant a envoyés : progression vers le destinataire.
     * Null si le message n'est pas le sien ou si l'observateur est admin sans rôle expéditeur.
     */
    private MessengerRecipientReceiptStatus recipientReceiptStatus;
}
