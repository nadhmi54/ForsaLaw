package com.forsalaw.userManagement.model;

import com.forsalaw.userManagement.entity.RoleUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUserRequest {

    private String nom;
    private String prenom;

    @Email(message = "Email invalide")
    @Size(max = 255)
    private String email;

    private RoleUser roleUser;
    private Boolean actif; // true = actif, false = bloqué

    @Size(min = 6, max = 100, message = "Le mot de passe doit contenir entre 6 et 100 caractères")
    private String nouveauMotDePasse; // optionnel
}
