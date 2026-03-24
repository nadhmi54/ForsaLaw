package com.forsalaw.userManagement.controller;

import com.forsalaw.userManagement.model.AdminUpdateUserRequest;
import com.forsalaw.userManagement.model.UserDTO;
import com.forsalaw.userManagement.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private static final List<String> ALLOWED_SORT_FIELDS = List.of(
            "id", "nom", "prenom", "email", "dateCreation", "dateMiseAJour", "roleUser", "actif"
    );

    private final UserService userService;

    @Operation(summary = "Liste des utilisateurs", description = "Retourne une liste paginée de tous les utilisateurs, avec recherche optionnelle par nom, prénom ou email.")
    @GetMapping
    public ResponseEntity<Page<UserDTO>> listUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Pageable safePageable = toSafePageable(pageable);
        Page<UserDTO> page = userService.findAll(safePageable, search);
        return ResponseEntity.ok(page);
    }

    private Pageable toSafePageable(Pageable pageable) {
        List<Sort.Order> orders = new ArrayList<>();
        for (Sort.Order order : pageable.getSort()) {
            if (ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                orders.add(order);
            }
        }
        if (orders.isEmpty()) {
            orders.add(new Sort.Order(Sort.Direction.DESC, "dateCreation"));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
    }

    @Operation(summary = "Détail utilisateur", description = "Retourne les informations d'un utilisateur par son identifiant.")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        UserDTO user = userService.getById(id);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Modifier un utilisateur", description = "Met à jour les informations d'un utilisateur (nom, prénom, email, rôle, actif, mot de passe).")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable String id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        UserDTO user = userService.updateByAdmin(id, request);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Désactiver un utilisateur par email", description = "Désactive le compte de l'utilisateur dont l'email est fourni (soft delete).")
    @DeleteMapping("/by-email")
    public ResponseEntity<Void> deleteUserByEmail(@RequestParam String email) {
        userService.deactivateByAdminEmail(email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Désactiver un utilisateur par id", description = "Désactive le compte de l'utilisateur dont l'identifiant est fourni (soft delete).")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deactivateByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Réactiver un utilisateur par email", description = "Réactive le compte d'un utilisateur désactivé en fournissant son email.")
    @PatchMapping("/by-email/reactivate")
    public ResponseEntity<Void> reactivateUserByEmail(@RequestParam String email) {
        userService.reactivateByAdminEmail(email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Réactiver un utilisateur par id", description = "Réactive le compte d'un utilisateur désactivé en fournissant son identifiant.")
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateUser(@PathVariable String id) {
        userService.reactivateByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
