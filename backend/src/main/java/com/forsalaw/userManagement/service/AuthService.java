package com.forsalaw.userManagement.service;

import  com.forsalaw.security.JwtService;
import com.forsalaw.userManagement.entity.RoleUser;
import com.forsalaw.userManagement.entity.User;
import com.forsalaw.userManagement.model.AuthResponse;
import com.forsalaw.userManagement.model.LoginRequest;
import com.forsalaw.userManagement.model.RegisterRequest;
import com.forsalaw.userManagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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
