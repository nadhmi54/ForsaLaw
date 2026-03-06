package com.forsalaw.userManagement.model;

import com.forsalaw.userManagement.entity.RoleUser;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private RoleUser roleUser;
}
