package com.forsalaw.avocatManagement.controller;

import com.forsalaw.avocatManagement.entity.SpecialiteJuridique;
import com.forsalaw.avocatManagement.model.AvocatDTO;
import com.forsalaw.avocatManagement.model.CreateAvocatRequest;
import com.forsalaw.avocatManagement.model.UpdateAvocatRequest;
import com.forsalaw.avocatManagement.service.AvocatService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/avocats")
@RequiredArgsConstructor
public class AvocatController {

    private final AvocatService avocatService;

    @Operation(summary = "Liste des avocats (public)", description = "Retourne une liste paginée des avocats actifs, avec filtres optionnels (spécialité, ville, vérifié). Accessible sans authentification.")
    @GetMapping
    public ResponseEntity<Page<AvocatDTO>> listPublic(
            @RequestParam(required = false) SpecialiteJuridique specialite,
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Boolean verifie,
            @PageableDefault(size = 20, sort = "dateCreation", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<AvocatDTO> page = avocatService.findAllPublic(pageable, specialite, ville, verifie);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Mon profil avocat", description = "Retourne le profil avocat de l'utilisateur connecté (rôle AVOCAT requis).")
    @GetMapping("/me")
    @PreAuthorize("hasRole('AVOCAT')")
    public ResponseEntity<AvocatDTO> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        AvocatDTO avocat = avocatService.getMyProfile(email);
        return ResponseEntity.ok(avocat);
    }

    @Operation(summary = "Créer mon profil avocat", description = "Crée le profil avocat pour le compte connecté (un seul profil par compte, rôle AVOCAT requis).")
    @PostMapping("/me")
    @PreAuthorize("hasRole('AVOCAT')")
    public ResponseEntity<AvocatDTO> createMyProfile(
            Authentication authentication,
            @Valid @RequestBody CreateAvocatRequest request
    ) {
        String email = authentication.getName();
        AvocatDTO avocat = avocatService.createProfile(email, request);
        return ResponseEntity.ok(avocat);
    }

    @Operation(summary = "Modifier mon profil avocat", description = "Met à jour le profil avocat de l'utilisateur connecté (spécialité, expérience, ville, description).")
    @PutMapping("/me")
    @PreAuthorize("hasRole('AVOCAT')")
    public ResponseEntity<AvocatDTO> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateAvocatRequest request
    ) {
        String email = authentication.getName();
        AvocatDTO avocat = avocatService.updateMyProfile(email, request);
        return ResponseEntity.ok(avocat);
    }

    @Operation(summary = "Désactiver mon profil avocat", description = "Désactive le profil avocat de l'utilisateur connecté. Le profil n'apparaîtra plus dans la liste publique.")
    @DeleteMapping("/me")
    @PreAuthorize("hasRole('AVOCAT')")
    public ResponseEntity<Void> deactivateMyProfile(Authentication authentication) {
        String email = authentication.getName();
        avocatService.deactivateMyProfile(email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Détail d'un avocat (public)", description = "Retourne la fiche d'un avocat par son identifiant (avocats actifs uniquement). Accessible sans authentification.")
    @GetMapping("/{id}")
    public ResponseEntity<AvocatDTO> getById(@PathVariable Long id) {
        AvocatDTO avocat = avocatService.getById(id);
        return ResponseEntity.ok(avocat);
    }
}
