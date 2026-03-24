package com.forsalaw.avocatManagement.controller;

import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import com.forsalaw.avocatManagement.model.AdminUpdateAvocatRequest;
import com.forsalaw.avocatManagement.model.AvocatDTO;
import com.forsalaw.avocatManagement.service.AvocatService;
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
@RequestMapping("/api/admin/avocats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAvocatController {

    private static final List<String> ALLOWED_SORT_FIELDS = List.of(
            "id", "specialite", "anneesExperience", "ville", "noteMoyenne", "totalDossiers",
            "verifie", "actif", "dateCreation", "dateMiseAJour"
    );

    private final AvocatService avocatService;

    @Operation(summary = "Liste des avocats (admin)", description = "Retourne une liste paginée de tous les avocats (actifs et inactifs), avec filtres (spécialité, ville, vérifié, actif).")
    @GetMapping
    public ResponseEntity<Page<AvocatDTO>> listAvocats(
            @RequestParam(required = false) SpecialiteJuridique specialite,
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Boolean verifie,
            @RequestParam(required = false) Boolean actif,
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Pageable safePageable = toSafePageable(pageable);
        Page<AvocatDTO> page = avocatService.findAllAdmin(safePageable, specialite, ville, verifie, actif);
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

    @Operation(summary = "Détail d'un avocat (admin)", description = "Retourne les informations complètes d'un avocat par son identifiant (y compris si inactif).")
    @GetMapping("/{id}")
    public ResponseEntity<AvocatDTO> getAvocatById(@PathVariable String id) {
        AvocatDTO avocat = avocatService.getByIdAdmin(id);
        return ResponseEntity.ok(avocat);
    }

    @Operation(summary = "Modifier un avocat", description = "Met à jour le profil d'un avocat (profil, vérification, actif).")
    @PutMapping("/{id}")
    public ResponseEntity<AvocatDTO> updateAvocat(
            @PathVariable String id,
            @Valid @RequestBody AdminUpdateAvocatRequest request
    ) {
        AvocatDTO avocat = avocatService.updateByAdmin(id, request);
        return ResponseEntity.ok(avocat);
    }

    @Operation(summary = "Désactiver un avocat par email", description = "Désactive le profil avocat de l'utilisateur dont l'email est fourni (soft delete).")
    @DeleteMapping("/by-email")
    public ResponseEntity<Void> deactivateAvocatByEmail(@RequestParam String email) {
        avocatService.deactivateByAdminEmail(email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Désactiver un avocat par id", description = "Désactive le profil d'un avocat (soft delete). Il n'apparaîtra plus dans la liste publique.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateAvocat(@PathVariable String id) {
        avocatService.deactivateByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Réactiver un avocat par email", description = "Réactive le profil avocat de l'utilisateur dont l'email est fourni.")
    @PatchMapping("/by-email/reactivate")
    public ResponseEntity<Void> reactivateAvocatByEmail(@RequestParam String email) {
        avocatService.reactivateByAdminEmail(email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Réactiver un avocat par id", description = "Réactive le profil d'un avocat désactivé. Il réapparaîtra dans la liste publique.")
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateAvocat(@PathVariable String id) {
        avocatService.reactivateByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
