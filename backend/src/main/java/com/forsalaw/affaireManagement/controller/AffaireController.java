package com.forsalaw.affaireManagement.controller;

import com.forsalaw.affaireManagement.entity.StatutAffaire;
import com.forsalaw.affaireManagement.model.AffaireDTO;
import com.forsalaw.affaireManagement.model.CreateAffaireRequest;
import com.forsalaw.affaireManagement.model.UpdateStatutRequest;
import com.forsalaw.affaireManagement.service.AffaireService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/affaires")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AffaireController {

    private final AffaireService affaireService;

    @Operation(summary = "Mes affaires (client ou avocat)")
    @GetMapping
    public ResponseEntity<Page<AffaireDTO>> mesAffaires(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "dateMiseAJour", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(affaireService.mesAffaires(authentication.getName(), pageable));
    }

    @Operation(summary = "Détail d'une affaire")
    @GetMapping("/{id}")
    public ResponseEntity<AffaireDTO> getAffaire(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(affaireService.getAffaire(id, authentication.getName()));
    }

    @Operation(summary = "Changer le statut d'une affaire (avocat assigné uniquement)")
    @PatchMapping("/{id}/statut")
    public ResponseEntity<AffaireDTO> changerStatut(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody UpdateStatutRequest request
    ) {
        return ResponseEntity.ok(affaireService.changerStatut(id, request, authentication.getName()));
    }
}
