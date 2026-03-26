package com.forsalaw.userManagement.service;

import  com.forsalaw.security.JwtService;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.model.AuthResponse;
import com.forsalaw.userManagement.model.ForgotPasswordRequest;
import com.forsalaw.userManagement.model.LoginRequest;
import com.forsalaw.userManagement.model.RegisterRequest;
import com.forsalaw.userManagement.model.ResetPasswordRequest;
import com.forsalaw.userManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetEmailService passwordResetEmailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet email.");
        }
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = new User();
        user.setId(userService.generateNextId("USR"));
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(normalizedEmail);
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setRoleUser(resolveRoleForEmail(normalizedEmail));
        user.setActif(true);
        user = userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getRoleUser().name());
        return toAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect."));
        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect.");
        }
        if (!user.isActif()) {
            throw new IllegalArgumentException("Compte désactivé.");
        }
        String token = jwtService.generateToken(user.getEmail(), user.getRoleUser().name());
        return toAuthResponse(user, token);
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(30));
            userRepository.save(user);
            passwordResetEmailService.sendPasswordResetEmail(normalizedEmail, token);
            log.warn("Password reset token generated for {}", normalizedEmail);
        });
        return "Si l'email existe, un token de reinitialisation a ete genere.";
    }

    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Token de reinitialisation invalide."));

        if (user.getPasswordResetExpiresAt() == null || LocalDateTime.now().isAfter(user.getPasswordResetExpiresAt())) {
            throw new IllegalArgumentException("Token de reinitialisation expire.");
        }

        user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
        return "Mot de passe reinitialise avec succes.";
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getNom(),
                user.getPrenom(),
                user.getRoleUser()
        );
    }

    private RoleUser resolveRoleForEmail(String email) {
        if (email.endsWith("@forsalaw") || email.endsWith("@forsalaw.com")) {
            return RoleUser.admin;
        }
        return RoleUser.client;
    }
}
