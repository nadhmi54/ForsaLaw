package com.forsalaw.userManagement.controller;

import com.forsalaw.userManagement.model.UpdateUserRequest;
import com.forsalaw.userManagement.model.UserDTO;
import com.forsalaw.userManagement.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Mon profil", description = "Retourne les informations du compte de l'utilisateur connecté (nom, prénom, email, rôle, etc.).")
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(Authentication authentication) {
        String email = authentication.getName();
        UserDTO user = userService.getByEmail(email);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Modifier mon profil", description = "Met à jour le profil de l'utilisateur connecté (nom, prénom, email, mot de passe).")
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        String email = authentication.getName();
        UserDTO user = userService.updateProfile(email, request);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Supprimer mon compte", description = "Désactive le compte de l'utilisateur connecté (soft delete). Le compte ne pourra plus se connecter.")
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(Authentication authentication) {
        String email = authentication.getName();
        userService.deactivateMyAccount(email);
        return ResponseEntity.noContent().build();
    }
}
