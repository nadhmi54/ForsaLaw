package com.forsalaw.userManagement.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "L'email est requis")
    @Email(message = "Email invalide")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    private String motDePasse;
}
