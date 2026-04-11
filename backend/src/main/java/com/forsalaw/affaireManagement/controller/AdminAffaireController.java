package com.forsalaw.affaireManagement.controller;

import com.forsalaw.affaireManagement.entity.StatutAffaire;
import com.forsalaw.affaireManagement.model.AffaireDTO;
import com.forsalaw.affaireManagement.service.AffaireService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/affaires")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAffaireController {

    private final AffaireService affaireService;

    @Operation(summary = "Lister toutes les affaires (admin). Les affaires issues de RDV confirmes sont creees automatiquement.")
    @GetMapping
    public ResponseEntity<Page<AffaireDTO>> toutesLesAffaires(
            @RequestParam(required = false) StatutAffaire statut,
            @PageableDefault(size = 20, sort = "dateMiseAJour", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(affaireService.toutesLesAffaires(statut, pageable));
    }

    @Operation(summary = "Detail d'une affaire (admin)")
    @GetMapping("/{id}")
    public ResponseEntity<AffaireDTO> getAffaire(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(affaireService.getAffairePourAdmin(id, authentication.getName()));
    }

    @Operation(summary = "Chronologie d'une affaire (admin)")
    @GetMapping("/{id}/timeline")
    public ResponseEntity<java.util.List<com.forsalaw.affaireManagement.model.AffaireTimelineStepDTO>> getAffaireTimeline(Authentication authentication, @PathVariable String id) {
        return ResponseEntity.ok(affaireService.getTimelinePourAdmin(id, authentication.getName()));
    }
}
