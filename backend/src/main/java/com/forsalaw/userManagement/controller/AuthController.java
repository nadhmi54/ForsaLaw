package com.forsalaw.userManagement.controller;

import com.forsalaw.userManagement.model.AuthResponse;
import com.forsalaw.userManagement.model.ForgotPasswordRequest;
import com.forsalaw.userManagement.model.LoginRequest;
import com.forsalaw.userManagement.model.RegisterRequest;
import com.forsalaw.userManagement.model.ResetPasswordRequest;
import com.forsalaw.userManagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Inscription", description = "Cree un nouveau compte utilisateur et retourne un token JWT.")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Connexion", description = "Authentifie un utilisateur par email et mot de passe. Retourne un token JWT.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Mot de passe oublie", description = "Genere un token temporaire de reinitialisation pour l'email fourni.")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @Operation(summary = "Reinitialiser le mot de passe", description = "Reinitialise le mot de passe a partir d'un token valide.")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @Operation(summary = "Login with Google", description = "Redirige vers Google OAuth2 pour authentification.")
    @GetMapping("/google")
    public RedirectView googleLogin() {
        return new RedirectView("/oauth2/authorization/google");
    }
}
