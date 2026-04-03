package com.forsalaw.messengerManagement.realtime;

import com.forsalaw.messengerManagement.entity.MessengerSenderRole;
import com.forsalaw.messengerManagement.model.MessengerMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessengerRealtimePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishNewMessage(String conversationId, MessengerMessageDTO message) {
        try {
            MessengerWebSocketEvent ev = new MessengerWebSocketEvent(
                    MessengerWsEventType.NEW_MESSAGE, conversationId, message, null, null);
            messagingTemplate.convertAndSend(destination(conversationId), ev);
        } catch (Exception e) {
            log.warn("WebSocket NEW_MESSAGE publish failed for {}", conversationId, e);
        }
    }

    public void publishReadReceipt(String conversationId, MessengerSenderRole readByRole, LocalDateTime readAt) {
        try {
            MessengerReadReceiptPayload payload = new MessengerReadReceiptPayload(readByRole, readAt);
            MessengerWebSocketEvent ev = new MessengerWebSocketEvent(
                    MessengerWsEventType.READ_RECEIPT, conversationId, null, payload, null);
            messagingTemplate.convertAndSend(destination(conversationId), ev);
        } catch (Exception e) {
            log.warn("WebSocket READ_RECEIPT publish failed for {}", conversationId, e);
        }
    }

    public void publishTyping(String conversationId, String fromEmail, boolean typing) {
        try {
            MessengerTypingPayload payload = new MessengerTypingPayload(fromEmail, typing);
            MessengerWebSocketEvent ev = new MessengerWebSocketEvent(
                    MessengerWsEventType.TYPING, conversationId, null, null, payload);
            messagingTemplate.convertAndSend(destination(conversationId), ev);
        } catch (Exception e) {
            log.warn("WebSocket TYPING publish failed for {}", conversationId, e);
        }
    }

    private static String destination(String conversationId) {
        return "/topic/messenger/conversation/" + conversationId + "/events";
    }
}
