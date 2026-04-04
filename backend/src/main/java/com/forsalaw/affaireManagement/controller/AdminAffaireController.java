package com.forsalaw.affaireManagement.controller;

import com.forsalaw.affaireManagement.entity.StatutAffaire;
import com.forsalaw.affaireManagement.model.AffaireDTO;
import com.forsalaw.affaireManagement.model.CreateAffaireRequest;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/affaires")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminAffaireController {

    private final AffaireService affaireService;

    @Operation(summary = "Toutes les affaires (admin)")
    @GetMapping
    public ResponseEntity<Page<AffaireDTO>> toutesLesAffaires(
            @RequestParam(required = false) StatutAffaire statut,
            @PageableDefault(size = 20, sort = "dateMiseAJour", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(affaireService.toutesLesAffaires(statut, pageable));
    }

    @Operation(summary = "Créer une affaire (admin)")
    @PostMapping
    public ResponseEntity<AffaireDTO> creerAffaire(@Valid @RequestBody CreateAffaireRequest request) {
        return ResponseEntity.ok(affaireService.creerAffaire(request));
    }

    @Operation(summary = "Assigner un avocat à une affaire")
    @PatchMapping("/{id}/avocat/{avocatId}")
    public ResponseEntity<AffaireDTO> assignerAvocat(
            @PathVariable String id,
            @PathVariable String avocatId
    ) {
        return ResponseEntity.ok(affaireService.assignerAvocat(id, avocatId));
    }
}
