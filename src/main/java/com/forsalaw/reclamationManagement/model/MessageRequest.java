package com.forsalaw.reclamationManagement.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MessageRequest {
    @NotBlank(message = "Le contenu ne peut pas être vide")
    private String contenu;
}
