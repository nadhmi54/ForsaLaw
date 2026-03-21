package com.forsalaw.messengerManagement.model;

import com.forsalaw.messengerManagement.entity.ConversationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryDTO {

    private String id;
    private String clientUserId;
    private String clientNom;
    private String clientPrenom;
    private String avocatId;
    private String avocatNom;
    private String avocatPrenom;
    private ConversationStatus status;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private LocalDateTime updatedAt;
    /** Nombre de messages non lus pour le destinataire courant (client ou avocat selon le contexte). */
    private long unreadCount;
}
