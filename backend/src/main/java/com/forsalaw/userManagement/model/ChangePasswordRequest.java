package com.forsalaw.userManagement.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {

    @NotBlank(message = "Le mot de passe actuel est requis")
    @Size(min = 6, max = 100, message = "Le mot de passe actuel doit contenir entre 6 et 100 caractères")
    private String motDePasseActuel;

    @NotBlank(message = "Le nouveau mot de passe est requis")
    @Size(min = 6, max = 100, message = "Le nouveau mot de passe doit contenir entre 6 et 100 caractères")
    private String nouveauMotDePasse;
}
