package com.forsalaw.userManagement.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestUnlockAccountRequest {

    @NotBlank(message = "L'email est requis")
    @Email(message = "Email invalide")
    @Size(max = 255)
    private String email;

    @Size(max = 1000, message = "Le message ne doit pas depasser 1000 caracteres")
    private String message;
}
