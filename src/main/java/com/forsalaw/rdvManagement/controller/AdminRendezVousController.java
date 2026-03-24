package com.forsalaw.rdvManagement.controller;

import com.forsalaw.rdvManagement.entity.StatutRendezVous;
import com.forsalaw.rdvManagement.model.RendezVousDTO;
import com.forsalaw.rdvManagement.service.RendezVousService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/rendezvous")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminRendezVousController {

    private final RendezVousService rendezVousService;

    @Operation(summary = "Lister les rendez-vous (admin, lecture seule)")
    @GetMapping
    public ResponseEntity<Page<RendezVousDTO>> lister(
            @RequestParam(required = false) String clientUserId,
            @RequestParam(required = false) String avocatId,
            @RequestParam(required = false) StatutRendezVous statut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime du,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime au,
            @PageableDefault(size = 20, sort = "dateMiseAJour", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(rendezVousService.listerPourAdmin(clientUserId, avocatId, statut, du, au, pageable));
    }

    @Operation(summary = "Detail d'un rendez-vous (admin, lecture seule)")
    @GetMapping("/{idRendezVous}")
    public ResponseEntity<RendezVousDTO> getDetail(@PathVariable String idRendezVous) {
        return ResponseEntity.ok(rendezVousService.getPourAdmin(idRendezVous));
    }
}