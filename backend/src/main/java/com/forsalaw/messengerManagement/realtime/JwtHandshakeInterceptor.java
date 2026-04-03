package com.forsalaw.messengerManagement.realtime;

import com.forsalaw.security.JwtService;
import com.forsalaw.userManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Collections;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler,
                                     Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }
        String token = servletRequest.getServletRequest().getParameter("token");
        if (token == null || token.isBlank()) {
            return false;
        }
        if (!jwtService.isTokenValid(token)) {
            return false;
        }
        String email = jwtService.extractEmail(token);
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().isActif()) {
            return false;
        }
        String role = jwtService.extractRole(token);
        if (role == null) {
            role = "";
        }
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());
        UsernamePasswordAuthenticationToken principal = new UsernamePasswordAuthenticationToken(
                email, null, Collections.singletonList(authority));
        attributes.put("principal", principal);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        // rien
    }
}
