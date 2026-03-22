package com.forsalaw.reclamationManagement.controller;

import com.forsalaw.reclamationManagement.entity.StatutReclamation;
import com.forsalaw.reclamationManagement.model.MessageRequest;
import com.forsalaw.reclamationManagement.model.ReclamationDTO;
import com.forsalaw.reclamationManagement.model.ReclamationMessageDTO;
import com.forsalaw.reclamationManagement.model.StatutRequest;
import com.forsalaw.reclamationManagement.service.ReclamationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reclamations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminReclamationController {

    private final ReclamationService reclamationService;

    @Operation(summary = "Liste toutes les réclamations (Admin)")
    @GetMapping
    public ResponseEntity<Page<ReclamationDTO>> listerTout(
            @RequestParam(required = false) String createurId,
            @RequestParam(required = false) StatutReclamation statut,
            @PageableDefault(size = 20, sort = "dateModification", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(reclamationService.listerToutPourAdmin(createurId, statut, pageable));
    }

    @Operation(summary = "Détail complet (Admin)")
    @GetMapping("/{id}")
    public ResponseEntity<ReclamationDTO> getDetail(@PathVariable String id) {
        return ResponseEntity.ok(reclamationService.getDetailReclamation(null, id));
    }

    @Operation(summary = "Mettre à jour le statut (Admin)")
    @PatchMapping("/{id}/statut")
    public ResponseEntity<ReclamationDTO> mettreAJourStatut(@PathVariable String id, @Valid @RequestBody StatutRequest request) {
        return ResponseEntity.ok(reclamationService.mettreAJourStatut(id, request.getStatut()));
    }

    @Operation(summary = "Répondre à une réclamation (Admin)")
    @PostMapping("/{id}/reponse")
    public ResponseEntity<ReclamationMessageDTO> repondre(
            org.springframework.security.core.Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody MessageRequest request
    ) {
        return ResponseEntity.ok(reclamationService.ajouterMessage(authentication.getName(), id, request.getContenu()));
    }

    @Operation(summary = "Timeline des messages (Admin)")
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ReclamationMessageDTO>> getMessages(@PathVariable String id) {
        return ResponseEntity.ok(reclamationService.getMessages(null, id));
    }
}
