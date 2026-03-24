package com.forsalaw.userManagement.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    private String nom;
    private String prenom;

    @Email(message = "Email invalide")
    @Size(max = 255)
    private String email;

    @Size(min = 6, max = 100, message = "Le mot de passe doit contenir entre 6 et 100 caractères")
    private String nouveauMotDePasse; // optionnel : si rempli, on met à jour le mot de passe
}
