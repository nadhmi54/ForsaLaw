package com.forsalaw.messengerManagement.realtime;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class MessengerWsTypingController {

    private final MessengerRealtimeAccessVerifier accessVerifier;
    private final MessengerRealtimePublisher publisher;

    @MessageMapping("/messenger/typing")
    public void typing(@Payload MessengerTypingInbound payload, Principal principal) {
        if (payload == null || payload.getConversationId() == null || payload.getConversationId().isBlank()) {
            return;
        }
        if (principal == null) {
            return;
        }
        if (!accessVerifier.canAccessConversation(principal.getName(), payload.getConversationId())) {
            throw new IllegalStateException("Acces refuse.");
        }
        publisher.publishTyping(payload.getConversationId(), principal.getName(), payload.isTyping());
    }
}
