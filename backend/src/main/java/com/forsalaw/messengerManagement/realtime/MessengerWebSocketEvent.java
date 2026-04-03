package com.forsalaw.messengerManagement.realtime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.forsalaw.messengerManagement.model.MessengerMessageDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Enveloppe commune pour les messages STOMP sur /topic/messenger/conversation/{id}/events.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessengerWebSocketEvent {

    private MessengerWsEventType type;
    private String conversationId;
    /** NEW_MESSAGE : message complet. */
    private MessengerMessageDTO message;
    /** READ_RECEIPT : qui a lu / accusé. */
    private MessengerReadReceiptPayload readReceipt;
    /** TYPING : indicateur frappe. */
    private MessengerTypingPayload typing;
}
