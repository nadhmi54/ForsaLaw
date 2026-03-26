package com.forsalaw.userManagement.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Le token de reinitialisation est requis")
    private String token;

    @NotBlank(message = "Le nouveau mot de passe est requis")
    @Size(min = 6, max = 100, message = "Le mot de passe doit contenir entre 6 et 100 caracteres")
    private String nouveauMotDePasse;
}
