package com.forsalaw.userManagement.model;

import com.forsalaw.userManagement.entity.RoleUser;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserDTO {

    private String id;
    private String nom;
    private String prenom;
    private String email;
    private RoleUser roleUser;
    private boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;

    /**
     * URL absolue pour GET la photo (Authorization Bearer requis), ou null si pas de photo.
     */
    private String profilePhotoUrl;
}
