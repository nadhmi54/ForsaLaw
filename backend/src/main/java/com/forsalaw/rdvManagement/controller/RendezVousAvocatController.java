package com.forsalaw.rdvManagement.controller;

import com.forsalaw.rdvManagement.model.AnnulerRendezVousRequest;
import com.forsalaw.rdvManagement.model.ProposerCreneauRequest;
import com.forsalaw.rdvManagement.model.RendezVousDTO;
import com.forsalaw.rdvManagement.model.RendezVousMeetingAccessDTO;
import com.forsalaw.rdvManagement.service.RendezVousService;
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
@RequestMapping("/api/rendezvous/avocat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AVOCAT')")
@SecurityRequirement(name = "bearerAuth")
public class RendezVousAvocatController {

    private final RendezVousService rendezVousService;

    @Operation(summary = "Lister les demandes recues par l'avocat")
    @GetMapping("/demandes-recues")
    public ResponseEntity<Page<RendezVousDTO>> listerDemandesRecues(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "dateMiseAJour", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(rendezVousService.listerDemandesRecuesAvocat(authentication.getName(), pageable));
    }

    @Operation(summary = "Detail d'une demande recue")
    @GetMapping("/demandes-recues/{idRendezVous}")
    public ResponseEntity<RendezVousDTO> getDetailRecu(
            Authentication authentication,
            @PathVariable String idRendezVous
    ) {
        return ResponseEntity.ok(rendezVousService.getDemandeRecueAvocat(authentication.getName(), idRendezVous));
    }

    @Operation(summary = "Acces a la salle du rendez-vous en ligne (avocat)")
    @GetMapping("/{idRendezVous}/meeting-access")
    public ResponseEntity<RendezVousMeetingAccessDTO> getMeetingAccess(
            Authentication authentication,
            @PathVariable String idRendezVous
    ) {
        return ResponseEntity.ok(rendezVousService.getMeetingAccessAvocat(authentication.getName(), idRendezVous));
    }

    @Operation(summary = "Proposer / fixer un creneau")
    @PatchMapping("/{idRendezVous}/proposer-creneau")
    public ResponseEntity<RendezVousDTO> proposerCreneau(
            Authentication authentication,
            @PathVariable String idRendezVous,
            @RequestBody ProposerCreneauRequest request
    ) {
        return ResponseEntity.ok(rendezVousService.proposerCreneauAvocat(authentication.getName(), idRendezVous, request));
    }

    @Operation(summary = "Annuler un rendez-vous (avocat)")
    @PatchMapping("/{idRendezVous}/annuler")
    public ResponseEntity<RendezVousDTO> annuler(
            Authentication authentication,
            @PathVariable String idRendezVous,
            @RequestBody AnnulerRendezVousRequest request
    ) {
        return ResponseEntity.ok(rendezVousService.annulerParAvocat(authentication.getName(), idRendezVous, request));
    }
}