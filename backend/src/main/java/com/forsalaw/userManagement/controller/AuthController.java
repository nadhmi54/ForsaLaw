package com.forsalaw.userManagement.controller;

import com.forsalaw.userManagement.model.AuthResponse;
import com.forsalaw.userManagement.model.LoginRequest;
import com.forsalaw.userManagement.model.RegisterRequest;
import com.forsalaw.userManagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Inscription", description = "Crée un nouveau compte utilisateur (client, avocat ou admin). Retourne un token JWT et les infos utilisateur.")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Connexion", description = "Authentifie un utilisateur par email et mot de passe. Retourne un token JWT à utiliser dans l'en-tête Authorization.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
