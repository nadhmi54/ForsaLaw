package com.forsalaw.messengerManagement.realtime;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

/**
 * Associe le {@link Principal} mis dans les attributs par {@link JwtHandshakeInterceptor}.
 */
public class MessengerPrincipalHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Object p = attributes.get("principal");
        if (p instanceof Principal principal) {
            return principal;
        }
        return null;
    }
}
