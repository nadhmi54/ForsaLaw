package com.forsalaw.security;

import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.service.GoogleOAuth2UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleOAuth2UserService googleOAuth2UserService;
    private final JwtService jwtService;

    @Value("${forsalaw.oauth2.success-redirect-uri:http://localhost:4200/auth/google/callback}")
    private String successRedirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        User user = googleOAuth2UserService.upsertGoogleUser(oauth2User);

        String token = jwtService.generateToken(user.getEmail(), user.getRoleUser().name());
        String redirectUrl = UriComponentsBuilder.fromUriString(successRedirectUri)
                .queryParam("token", token)
                .queryParam("email", user.getEmail())
                .queryParam("role", user.getRoleUser().name())
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
