package com.forsalaw.messengerManagement.realtime;

import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * Vérifie que seuls les participants peuvent s'abonner aux topics messagerie.
 */
@Component
@RequiredArgsConstructor
public class MessengerStompChannelInterceptor implements ChannelInterceptor {

    private static final String PREFIX = "/topic/messenger/conversation/";
    private static final String SUFFIX = "/events";

    private final MessengerRealtimeAccessVerifier accessVerifier;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }
        StompCommand cmd = accessor.getCommand();
        if (cmd == null || StompCommand.CONNECT.equals(cmd) || StompCommand.CONNECTED.equals(cmd)) {
            return message;
        }
        if (!StompCommand.SUBSCRIBE.equals(cmd)) {
            return message;
        }
        String dest = accessor.getDestination();
        if (dest == null || !dest.startsWith(PREFIX) || !dest.endsWith(SUFFIX)) {
            return message;
        }
        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new IllegalStateException("Non authentifie.");
        }
        String convId = dest.substring(PREFIX.length(), dest.length() - SUFFIX.length());
        if (!accessVerifier.canAccessConversation(principal.getName(), convId)) {
            throw new IllegalStateException("Acces refuse a la conversation.");
        }
        return message;
    }
}
